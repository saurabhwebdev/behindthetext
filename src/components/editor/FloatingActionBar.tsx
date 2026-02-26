"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImagePlus, RotateCcw } from "lucide-react";
import { ExportButton } from "./ExportButton";

interface FloatingActionBarProps {
  onExport: (withWatermark: boolean) => Promise<void>;
  isExporting: boolean;
  onNewImage: () => void;
  onReset: () => void;
  previewCanvas: HTMLCanvasElement | null;
}

export function FloatingActionBar({
  onExport,
  isExporting,
  onNewImage,
  onReset,
  previewCanvas,
}: FloatingActionBarProps) {
  return (
    <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 lg:bottom-4">
      <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/80 px-2 py-1.5 shadow-xl backdrop-blur-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onNewImage}
              className="rounded-full"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">New image</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Reset</TooltipContent>
        </Tooltip>

        <div className="mx-0.5 h-5 w-px bg-border/40" />

        <ExportButton
          onExport={onExport}
          isExporting={isExporting}
          previewCanvas={previewCanvas}
          compact
        />
      </div>
    </div>
  );
}
