"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { CanvasPreview } from "./CanvasPreview";
import { ControlsPanel } from "./ControlsPanel";
import { useTextOverlayState } from "@/hooks/useTextOverlayState";
import { useDepthEstimation } from "@/hooks/useDepthEstimation";
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { useFontLoader } from "@/hooks/useFontLoader";
import { saveCreationMetadata } from "@/lib/supabase-metadata";

export function EditorLayout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { textParams, setField, reset } = useTextOverlayState();
  const {
    estimateDepth,
    isProcessing,
    progress,
    status,
    depthMap,
    depthWidth,
    depthHeight,
    clearDepth,
  } = useDepthEstimation();

  const { isFontLoaded } = useFontLoader(
    textParams.fontFamily,
    textParams.fontWeight
  );

  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  // Load original image element when URL changes
  useEffect(() => {
    if (!originalImageUrl) {
      setOriginalImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setOriginalImage(img);
    img.src = originalImageUrl;
  }, [originalImageUrl]);

  // Canvas renderer
  const { handleExport } = useCanvasRenderer(
    canvasRef,
    containerRef,
    originalImage,
    textParams,
    depthMap,
    depthWidth,
    depthHeight
  );

  // Handle image upload
  const onImageSelected = useCallback(
    (file: File) => {
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);

      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      estimateDepth(file);
    },
    [originalImageUrl, estimateDepth]
  );

  // Handle new image
  const onNewImage = useCallback(() => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    setOriginalFile(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
    clearDepth();
  }, [originalImageUrl, clearDepth]);

  // Handle export with metadata save
  const onExport = useCallback(async () => {
    if (!originalImage || !originalFile) return;
    setIsExporting(true);
    try {
      await handleExport();

      const dpiScale = Math.min(window.devicePixelRatio, 3);
      saveCreationMetadata({
        image_width: originalImage.naturalWidth,
        image_height: originalImage.naturalHeight,
        image_format: originalFile.type,
        text_content: textParams.text,
        font_family: textParams.fontFamily,
        font_size: textParams.fontSize,
        font_weight: textParams.fontWeight,
        text_color: textParams.color,
        text_params: textParams,
        export_width: Math.round(originalImage.naturalWidth * dpiScale),
        export_height: Math.round(originalImage.naturalHeight * dpiScale),
        dpi_scale: dpiScale,
      }).catch(() => {});
    } finally {
      setIsExporting(false);
    }
  }, [handleExport, originalImage, originalFile, textParams]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:items-stretch lg:gap-6 lg:p-6">
      {/* Canvas Preview — 60% on desktop */}
      <div className="flex flex-1 lg:basis-3/5">
        <CanvasPreview
          ref={canvasRef}
          containerRef={containerRef}
          hasImage={!!originalImage}
          isProcessing={isProcessing}
          processingProgress={progress}
          processingStatus={status}
          onImageSelected={onImageSelected}
        />
      </div>

      {/* Controls Panel — 40% on desktop */}
      <div className="flex lg:basis-2/5">
        <div className="flex-1 rounded-xl border border-border/40 bg-card p-3">
          <ControlsPanel
            textParams={textParams}
            setField={setField}
            reset={reset}
            onExport={onExport}
            isExporting={isExporting}
            hasImage={!!originalImage}
            hasDepth={!!depthMap}
            onNewImage={onNewImage}
          />
        </div>
      </div>
    </div>
  );
}
