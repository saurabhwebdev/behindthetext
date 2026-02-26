"use client";

import Image from "next/image";
import { ImageUploader } from "./ImageUploader";

const EXAMPLE_IMAGES = [
  { src: "/showcase/1.webp", alt: "City skyline" },
  { src: "/showcase/2.webp", alt: "Person jumping" },
  { src: "/showcase/4.webp", alt: "Mountain scene" },
  { src: "/showcase/5.webp", alt: "Zebra in savanna" },
];

interface EmptyStateProps {
  onImageSelected: (file: File) => void;
  onExampleClick: (src: string) => void;
}

export function EmptyState({ onImageSelected, onExampleClick }: EmptyStateProps) {
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

      <div className="text-center">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Or try an example
        </p>
        <div className="flex gap-3">
          {EXAMPLE_IMAGES.map((img) => (
            <button
              key={img.src}
              onClick={() => onExampleClick(img.src)}
              className="group overflow-hidden rounded-lg border border-border/40 transition-all hover:border-foreground/20 hover:shadow-md"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={120}
                height={80}
                className="h-16 w-24 object-cover transition-transform group-hover:scale-105"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
