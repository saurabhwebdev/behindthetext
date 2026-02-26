/**
 * Server-side depth estimation using @huggingface/transformers with WASM/CPU backend.
 * Runs the same Depth Anything V2 Small model as the client but without WebGPU.
 */

import { pipeline, RawImage, env } from "@huggingface/transformers";
import sharp from "sharp";

// Disable local model loading — always fetch from HuggingFace Hub
env.allowLocalModels = false;

// Singleton pipeline — cached after first load (~30-60s cold start)
let depthPipeline: any = null;

async function getDepthPipeline() {
  if (depthPipeline) return depthPipeline;

  depthPipeline = await pipeline(
    "depth-estimation",
    "onnx-community/depth-anything-v2-small",
    {
      device: "cpu",
      session_options: {
        logSeverityLevel: 3, // Only log errors
      },
    }
  );

  return depthPipeline;
}

export interface DepthResult {
  depthMap: Float32Array;
  width: number;
  height: number;
}

/**
 * Estimate depth from an image buffer.
 * Returns a normalized Float32Array (0-1 range) where higher = closer to camera.
 */
export async function estimateDepthFromBuffer(
  imageBuffer: Buffer
): Promise<DepthResult> {
  const pipe = await getDepthPipeline();

  // Decode image to raw RGB pixels using Sharp, then create RawImage
  const { data: rawPixels, info } = await sharp(imageBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const image = new RawImage(
    new Uint8ClampedArray(rawPixels.buffer, rawPixels.byteOffset, rawPixels.byteLength),
    info.width,
    info.height,
    info.channels
  );

  const result = await pipe(image);

  const depthImage = result.depth;
  const w = depthImage.width;
  const h = depthImage.height;
  const rawData = depthImage.data;

  // Normalize to 0-1 range
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i] < minVal) minVal = rawData[i];
    if (rawData[i] > maxVal) maxVal = rawData[i];
  }

  const range = maxVal - minVal || 1;
  const normalized = new Float32Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    normalized[i] = (rawData[i] - minVal) / range;
  }

  return { depthMap: normalized, width: w, height: h };
}
