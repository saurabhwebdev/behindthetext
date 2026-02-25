"use client";

import { forwardRef } from "react";
import { ProcessingOverlay } from "./ProcessingOverlay";
import { ImageUploader } from "./ImageUploader";

interface CanvasPreviewProps {
  hasImage: boolean;
  isProcessing: boolean;
  processingProgress: number;
  processingStatus: string;
  onImageSelected: (file: File) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasPreview = forwardRef<HTMLCanvasElement, CanvasPreviewProps>(
  function CanvasPreview(
    {
      hasImage,
      isProcessing,
      processingProgress,
      processingStatus,
      onImageSelected,
      containerRef,
    },
    canvasRef
  ) {
    return (
      <div
        ref={containerRef}
        className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/30 lg:min-h-[500px]"
      >
        {!hasImage ? (
          <ImageUploader onImageSelected={onImageSelected} />
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="block max-h-full max-w-full"
            />
            {isProcessing && (
              <ProcessingOverlay
                progress={processingProgress}
                status={processingStatus}
              />
            )}
          </>
        )}
      </div>
    );
  }
);
