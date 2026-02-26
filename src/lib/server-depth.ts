/**
 * Server-side depth estimation using HuggingFace Inference API (free tier).
 *
 * Sends the image to HuggingFace's hosted Depth Anything V2 model and
 * receives a grayscale depth map image back. No native binaries needed.
 *
 * Requires HF_TOKEN env var (free from https://huggingface.co/settings/tokens).
 */

import sharp from "sharp";

const HF_MODEL = "depth-anything/Depth-Anything-V2-Small-hf";
const HF_ENDPOINT = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

export interface DepthResult {
  depthMap: Float32Array;
  width: number;
  height: number;
}

/**
 * Estimate depth from an image buffer using HuggingFace Inference API.
 * Returns a normalized Float32Array (0-1 range) where higher = closer to camera.
 */
export async function estimateDepthFromBuffer(
  imageBuffer: Buffer
): Promise<DepthResult> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "HF_TOKEN is required. Get a free token at https://huggingface.co/settings/tokens"
    );
  }

  // Send image to HF Inference API
  const res = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HuggingFace API error ${res.status}: ${errText}`);
  }

  // Response is a grayscale depth image (PNG/JPEG)
  const depthImageBuffer = Buffer.from(await res.arrayBuffer());

  // Decode depth image to raw pixels using Sharp
  const { data: rawPixels, info } = await sharp(depthImageBuffer)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Convert to normalized Float32Array (0-1 range)
  const normalized = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    normalized[i] = rawPixels[i] / 255;
  }

  return { depthMap: normalized, width: w, height: h };
}
