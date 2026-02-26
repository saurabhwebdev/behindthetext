"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExportButtonProps {
  onExport: (withWatermark: boolean) => Promise<void>;
  disabled?: boolean;
  isExporting: boolean;
  previewCanvas: HTMLCanvasElement | null;
  compact?: boolean;
}

export function ExportButton({
  onExport,
  disabled,
  isExporting,
  previewCanvas,
  compact,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<"watermark" | "clean" | null>(null);

  const thumbnailUrl = previewCanvas
    ? previewCanvas.toDataURL("image/jpeg", 0.6)
    : null;

  const handleDownload = async (withWatermark: boolean) => {
    setExportType(withWatermark ? "watermark" : "clean");
    try {
      await onExport(withWatermark);
    } finally {
      setExportType(null);
      setOpen(false);
    }
  };

  return (
    <>
      {compact ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(true)}
              disabled={disabled || isExporting}
              className="rounded-full"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Download PNG</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          disabled={disabled || isExporting}
          className="h-12 w-full text-base"
          size="lg"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Download Image</DialogTitle>
            <DialogDescription>Choose your download option</DialogDescription>
          </DialogHeader>

          {thumbnailUrl && (
            <div className="overflow-hidden rounded-lg border border-border/50">
              <img
                src={thumbnailUrl}
                alt="Preview"
                className="w-full object-contain"
                style={{ maxHeight: 220 }}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <Button
              onClick={() => handleDownload(false)}
              disabled={isExporting}
              className="h-12 w-full text-base"
              size="lg"
            >
              {exportType === "clean" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Without Watermark
                </>
              )}
            </Button>

            <Button
              onClick={() => handleDownload(true)}
              disabled={isExporting}
              variant="outline"
              className="h-12 w-full text-base"
              size="lg"
            >
              {exportType === "watermark" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download With Watermark
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
