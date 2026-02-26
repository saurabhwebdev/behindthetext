"use client";

import { forwardRef } from "react";
import { ProcessingOverlay } from "./ProcessingOverlay";

interface CanvasPreviewProps {
  isProcessing: boolean;
  processingProgress: number;
  processingStatus: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasPreview = forwardRef<HTMLCanvasElement, CanvasPreviewProps>(
  function CanvasPreview(
    { isProcessing, processingProgress, processingStatus, containerRef },
    canvasRef
  ) {
    return (
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center bg-muted/10"
      >
        <canvas ref={canvasRef} className="block max-h-full max-w-full" />
        {isProcessing && (
          <ProcessingOverlay
            progress={processingProgress}
            status={processingStatus}
          />
        )}
      </div>
    );
  }
);
