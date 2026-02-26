"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "@/lib/constants";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelected, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div
      onClick={disabled ? undefined : handleClick}
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 lg:p-16 ${
        isDragging
          ? "border-[#ff3131] bg-[#ff3131]/5"
          : "border-muted-foreground/20 hover:border-[#ff3131]/50 hover:bg-muted/30"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <ImagePlus className={`h-14 w-14 transition-colors duration-300 lg:h-16 lg:w-16 ${
        isDragging ? "text-[#ff3131]" : "text-muted-foreground/40"
      }`} />
      <div className="text-center">
        <p className="font-[family-name:var(--font-extenda-light)] text-xl tracking-tight lg:text-2xl">
          Drop your image here
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          JPEG, PNG, or WebP &middot; Max {MAX_FILE_SIZE_MB}MB
        </p>
      </div>
      <Button
        variant="outline"
        className="h-10 px-6"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Browse Files
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
