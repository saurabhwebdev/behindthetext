"use client";

import { Loader2 } from "lucide-react";

interface ProcessingOverlayProps {
  progress: number;
  status: string;
}

export function ProcessingOverlay({ progress, status }: ProcessingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="w-64 text-center">
        <p className="mb-2 text-sm font-medium">{status}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
      </div>
    </div>
  );
}
