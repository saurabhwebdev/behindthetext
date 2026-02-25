"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => Promise<void>;
  disabled?: boolean;
  isExporting: boolean;
}

export function ExportButton({ onExport, disabled, isExporting }: ExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled || isExporting}
      className="w-full"
      size="lg"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download PNG
        </>
      )}
    </Button>
  );
}
