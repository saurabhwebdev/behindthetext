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
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragLeave={handleDragLeave}
      className={`upload-border-glow flex flex-col items-center justify-center gap-5 p-12 lg:p-16 transition-all ${
        isDragging ? "dragging" : ""
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <ImagePlus className="h-14 w-14 text-muted-foreground/60 lg:h-16 lg:w-16" />
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
        onClick={disabled ? undefined : handleClick}
        className="h-10 px-6"
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
