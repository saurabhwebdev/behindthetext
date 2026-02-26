/**
 * Server-side depth estimation using the official Depth Anything V2 Gradio Space.
 * Completely free — no API keys, no native binaries, just HTTP calls.
 *
 * Uses the Gradio queue protocol (upload → join → SSE poll) to call:
 * https://huggingface.co/spaces/depth-anything/Depth-Anything-V2
 */

import sharp from "sharp";

const GRADIO_API = "https://depth-anything-depth-anything-v2.hf.space";

export interface DepthResult {
  depthMap: Float32Array;
  width: number;
  height: number;
}

/**
 * Upload image to Gradio Space, returns the file path reference.
 */
async function uploadToGradio(jpegBuffer: Buffer): Promise<string> {
  const blob = new Blob([new Uint8Array(jpegBuffer)], { type: "image/jpeg" });
  const fd = new FormData();
  fd.append("files", blob, "input.jpg");

  const res = await fetch(`${GRADIO_API}/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(`Gradio upload failed: ${res.status}`);
  }

  const paths: string[] = await res.json();
  return paths[0];
}

/**
 * Join the Gradio queue and poll SSE for the result.
 */
async function runPrediction(filePath: string): Promise<string> {
  const sessionHash = Math.random().toString(36).substring(2, 14);

  // Join queue
  const joinRes = await fetch(`${GRADIO_API}/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        { path: filePath, meta: { _type: "gradio.FileData" } },
      ],
      fn_index: 0,
      session_hash: sessionHash,
    }),
  });

  if (!joinRes.ok) {
    throw new Error(`Gradio queue join failed: ${joinRes.status}`);
  }

  const { event_id } = await joinRes.json();
  if (!event_id) {
    throw new Error("No event_id from Gradio queue");
  }

  // Poll SSE stream for result
  const sseRes = await fetch(
    `${GRADIO_API}/queue/data?session_hash=${sessionHash}`
  );

  if (!sseRes.ok || !sseRes.body) {
    throw new Error(`Gradio SSE failed: ${sseRes.status}`);
  }

  const reader = sseRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Look for completed event in SSE stream
      if (buffer.includes('"msg":"process_completed"')) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (
            line.startsWith("data: ") &&
            line.includes("process_completed")
          ) {
            const payload = JSON.parse(line.substring(6));
            const output = payload.output;

            if (!output?.data?.[0]) {
              throw new Error("Empty output from Gradio");
            }

            // Output is a gallery: [[{image}, {image}]]
            // Second image is the depth map
            const gallery = output.data[0];
            const depthItem = Array.isArray(gallery)
              ? gallery[gallery.length - 1]
              : gallery;

            let url = depthItem?.url || depthItem?.image?.url;
            if (!url) {
              // Fallback: try path-based URL
              const path = depthItem?.path || depthItem?.image?.path;
              if (path) {
                url = `${GRADIO_API}/file=${path}`;
              }
            }

            if (!url) {
              throw new Error(
                `No depth image URL in response: ${JSON.stringify(depthItem).substring(0, 200)}`
              );
            }

            return url;
          }
        }
      }

      // Check for errors
      if (buffer.includes('"msg":"process_error"')) {
        throw new Error("Gradio processing error");
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  throw new Error("Gradio SSE stream ended without result");
}

/**
 * Estimate depth from an image buffer.
 * Returns a normalized Float32Array (0-1 range) where higher = closer to camera.
 */
export async function estimateDepthFromBuffer(
  imageBuffer: Buffer
): Promise<DepthResult> {
  // 1. Convert to JPEG for upload
  const jpegBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();

  // 2. Upload to Gradio Space
  const filePath = await uploadToGradio(jpegBuffer);

  // 3. Run prediction via queue
  const depthImageUrl = await runPrediction(filePath);

  // 4. Download the depth map image
  const depthRes = await fetch(depthImageUrl);
  if (!depthRes.ok) {
    throw new Error(`Failed to download depth map: ${depthRes.status}`);
  }
  const depthBuffer = Buffer.from(await depthRes.arrayBuffer());

  // 5. Convert to grayscale Float32Array
  const { data: rawPixels, info } = await sharp(depthBuffer)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  const normalized = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    normalized[i] = rawPixels[i] / 255;
  }

  return { depthMap: normalized, width: w, height: h };
}
