"use client";

import { useEffect, useRef, useCallback } from "react";
import { TextOverlayParams } from "@/types/editor";
import { renderPreview, exportAsPNG } from "@/lib/canvas-renderer";

export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  originalImage: HTMLImageElement | null,
  textParams: TextOverlayParams,
  depthMap: Float32Array | null,
  depthWidth: number,
  depthHeight: number
) {
  const rafRef = useRef<number>(0);

  // Render loop
  useEffect(() => {
    if (!canvasRef.current || !originalImage) return;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpiScale = typeof window !== "undefined" ? window.devicePixelRatio : 1;

      renderPreview({
        canvas,
        originalImage,
        textParams,
        depthMap,
        depthWidth,
        depthHeight,
        dpiScale,
        containerWidth: rect.width,
        containerHeight: rect.height,
      });
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, containerRef, originalImage, textParams, depthMap, depthWidth, depthHeight]);

  // Re-render on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !originalImage) return;

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = container.getBoundingClientRect();
        const dpiScale =
          typeof window !== "undefined" ? window.devicePixelRatio : 1;

        renderPreview({
          canvas,
          originalImage,
          textParams,
          depthMap,
          depthWidth,
          depthHeight,
          dpiScale,
          containerWidth: rect.width,
          containerHeight: rect.height,
        });
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef, containerRef, originalImage, textParams, depthMap, depthWidth, depthHeight]);

  // Export function
  const handleExport = useCallback(async () => {
    if (!originalImage) return null;

    const blob = await exportAsPNG(
      originalImage,
      textParams,
      depthMap,
      depthWidth,
      depthHeight
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `behindthetext-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return blob;
  }, [originalImage, textParams, depthMap, depthWidth, depthHeight]);

  return { handleExport };
}
