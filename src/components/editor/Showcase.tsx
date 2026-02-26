"use client";

import Image from "next/image";

export interface ShowcaseItem {
  src: string;
  alt: string;
}

const SHOWCASE_IMAGES: ShowcaseItem[] = [
  // Add images here: { src: "/showcase/1.png", alt: "Text behind mountains" }
];

export function Showcase() {
  if (SHOWCASE_IMAGES.length === 0) return null;

  return (
    <section className="w-full border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center font-[family-name:var(--font-extenda-light)] text-3xl tracking-tight">
          Showcase
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Made with BehindTheText
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SHOWCASE_IMAGES.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border/40"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={400}
                height={400}
                className="h-auto w-full object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
