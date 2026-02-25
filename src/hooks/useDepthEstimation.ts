"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useDepthEstimation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [depthMap, setDepthMap] = useState<Float32Array | null>(null);
  const [depthWidth, setDepthWidth] = useState(0);
  const [depthHeight, setDepthHeight] = useState(0);
  const pipelineRef = useRef<any>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const estimateDepth = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setStatus("Loading depth model...");
    setDepthMap(null);
    abortRef.current = false;

    try {
      const { pipeline, RawImage, env } = await import(
        "@huggingface/transformers"
      );
      env.allowLocalModels = false;

      if (!pipelineRef.current) {
        setStatus("Downloading depth model...");
        pipelineRef.current = await pipeline(
          "depth-estimation",
          "onnx-community/depth-anything-v2-small",
          {
            device: "webgpu" as any,
            progress_callback: (p: any) => {
              if (p.status === "progress" && p.total) {
                setProgress(Math.round((p.loaded / p.total) * 50));
              }
            },
            session_options: {
              logSeverityLevel: 3, // Suppress ONNX Runtime info/warnings (0=verbose,1=info,2=warning,3=error,4=fatal)
            },
          }
        );
      }

      if (abortRef.current) return;

      setStatus("Estimating depth...");
      setProgress(60);

      // Load image as RawImage
      const url = URL.createObjectURL(file);
      const image = await RawImage.fromURL(url);
      URL.revokeObjectURL(url);

      if (abortRef.current) return;

      const result = await pipelineRef.current(image);
      setProgress(90);

      if (abortRef.current) return;

      // The depth output is a RawImage with 1 channel
      const depthImage = result.depth;
      const w = depthImage.width;
      const h = depthImage.height;

      // Normalize depth to 0-1 range as Float32Array
      const rawData = depthImage.data;
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

      setDepthMap(normalized);
      setDepthWidth(w);
      setDepthHeight(h);
      setProgress(100);
      setStatus("Done!");
    } catch (err: any) {
      console.error("Depth estimation failed:", err);

      // WebGPU might not be available, retry with wasm
      if (
        err?.message?.includes("webgpu") ||
        err?.message?.includes("WebGPU") ||
        err?.message?.includes("GPUAdapter")
      ) {
        try {
          setStatus("Retrying with CPU...");
          const { pipeline, RawImage, env } = await import(
            "@huggingface/transformers"
          );
          env.allowLocalModels = false;

          pipelineRef.current = await pipeline(
            "depth-estimation",
            "onnx-community/depth-anything-v2-small",
            {
              device: "wasm" as any,
              progress_callback: (p: any) => {
                if (p.status === "progress" && p.total) {
                  setProgress(Math.round((p.loaded / p.total) * 50));
                }
              },
              session_options: {
                logSeverityLevel: 3,
              },
            }
          );

          setStatus("Estimating depth...");
          setProgress(60);

          const url = URL.createObjectURL(file);
          const image = await RawImage.fromURL(url);
          URL.revokeObjectURL(url);

          const result = await pipelineRef.current(image);
          const depthImage = result.depth;
          const w = depthImage.width;
          const h = depthImage.height;
          const rawData = depthImage.data;

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

          setDepthMap(normalized);
          setDepthWidth(w);
          setDepthHeight(h);
          setProgress(100);
          setStatus("Done!");
        } catch (retryErr) {
          console.error("Depth estimation (WASM) also failed:", retryErr);
          setStatus("Depth estimation failed. Please try again.");
        }
      } else {
        setStatus("Depth estimation failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearDepth = useCallback(() => {
    setDepthMap(null);
    setDepthWidth(0);
    setDepthHeight(0);
    setProgress(0);
    setStatus("");
  }, []);

  return {
    estimateDepth,
    isProcessing,
    progress,
    status,
    depthMap,
    depthWidth,
    depthHeight,
    clearDepth,
  };
}
