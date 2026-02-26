"use client";

import { ImageUploader } from "./ImageUploader";

interface EmptyStateProps {
  onImageSelected: (file: File) => void;
}

export function EmptyState({ onImageSelected }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="btt-pulse font-[family-name:var(--font-extenda-light)] text-4xl tracking-tight lg:text-5xl">
          Place text behind any image
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground lg:text-lg">
          AI-powered depth estimation. Free. No signup. 100% in your browser.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <ImageUploader onImageSelected={onImageSelected} />
      </div>
    </div>
  );
}
