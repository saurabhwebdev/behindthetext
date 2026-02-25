"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const DILATE_RADIUS = 4;

/**
 * Morphologically dilates the alpha channel by `radius` pixels using a
 * circular structuring element. For each pixel, takes the MAX alpha from
 * all neighbours within the radius. This spatially expands the foreground
 * mask outward so text is cleanly hidden behind the subject with no
 * bleed-through at edges.
 */
function dilateAlpha(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
) {
  // Extract alpha into a flat buffer for fast reads
  const len = width * height;
  const alphaIn = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    alphaIn[i] = data[i * 4 + 3];
  }

  // Pre-compute circular kernel offsets
  const offsets: number[] = []; // stored as flat index deltas
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        offsets.push(dy * width + dx);
      }
    }
  }

  // Dilate: for each pixel take the max alpha in the kernel neighbourhood
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = y * width + x;
      let maxA = 0;
      for (let k = 0; k < offsets.length; k++) {
        const a = alphaIn[idx + offsets[k]];
        if (a > maxA) {
          maxA = a;
          if (maxA === 255) break; // can't go higher
        }
      }
      data[idx * 4 + 3] = maxA;
    }
  }

  // Handle border pixels (within `radius` of edges) separately
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y >= radius && y < height - radius && x >= radius && x < width - radius) continue;
      const idx = y * width + x;
      let maxA = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          if (dx * dx + dy * dy > radius * radius) continue;
          const a = alphaIn[ny * width + nx];
          if (a > maxA) maxA = a;
        }
      }
      data[idx * 4 + 3] = maxA;
    }
  }
}

/**
 * Post-processes the foreground mask:
 * 1. Morphological dilation — expands the mask outward by DILATE_RADIUS px
 * 2. Soft feathering — 1px blur on the dilated alpha for smooth edges
 */
async function refineMask(foregroundBlob: Blob): Promise<Blob> {
  const img = await createImageBitmap(foregroundBlob);
  const w = img.width;
  const h = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: true })!;

  ctx.drawImage(img, 0, 0);

  // Step 1: Dilate the alpha channel to expand mask outward
  const imageData = ctx.getImageData(0, 0, w, h);
  dilateAlpha(imageData.data, w, h, DILATE_RADIUS);
  ctx.putImageData(imageData, 0, 0);

  // Step 2: Soft feather — blur the result slightly for smooth edges
  const featherCanvas = document.createElement("canvas");
  featherCanvas.width = w;
  featherCanvas.height = h;
  const fCtx = featherCanvas.getContext("2d")!;
  fCtx.filter = "blur(1px)";
  fCtx.drawImage(canvas, 0, 0);

  // Take the max of dilated alpha and feathered alpha (extends softly)
  const dilatedData = ctx.getImageData(0, 0, w, h);
  const featheredData = fCtx.getImageData(0, 0, w, h);
  for (let i = 3; i < dilatedData.data.length; i += 4) {
    dilatedData.data[i] = Math.max(dilatedData.data[i], featheredData.data[i]);
  }
  ctx.putImageData(dilatedData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 1.0);
  });
}

export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [foregroundBlobUrl, setForegroundBlobUrl] = useState<string | null>(
    null
  );
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const processImage = useCallback(async (file: File) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus("Loading AI model...");
    setForegroundBlobUrl(null);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(file, {
        model: "isnet",
        device: "gpu",
        output: {
          format: "image/png",
          quality: 1.0,
        },
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress(pct);
          if (key.includes("fetch")) {
            setStatus("Downloading AI model...");
          } else if (key.includes("compute")) {
            setStatus("Removing background...");
          } else {
            setStatus("Processing...");
          }
        },
      });

      // Post-process: refine edges for cleaner masking
      setStatus("Refining edges...");
      const refined = await refineMask(blob);

      const url = URL.createObjectURL(refined);
      blobUrlRef.current = url;
      setForegroundBlobUrl(url);
      setStatus("Done!");
      setProgress(100);
    } catch (err) {
      console.error("Background removal failed:", err);
      setStatus("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearForeground = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setForegroundBlobUrl(null);
    setProgress(0);
    setStatus("");
  }, []);

  return {
    processImage,
    isProcessing,
    progress,
    status,
    foregroundBlobUrl,
    clearForeground,
  };
}
