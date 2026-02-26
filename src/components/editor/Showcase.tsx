"use client";

import Image from "next/image";

interface ShowcaseItem {
  src: string;
  alt: string;
}

const SHOWCASE_IMAGES: ShowcaseItem[] = [
  { src: "/showcase/1.webp", alt: "CITY text behind New York skyline and Brooklyn Bridge" },
  { src: "/showcase/2.webp", alt: "JUMP text behind person leaping over fence with blue sky" },
  { src: "/showcase/3.webp", alt: "JUMP text in red behind person mid-air over fence" },
  { src: "/showcase/4.webp", alt: "MOUNTAIN text behind snowy Alps with red funicular train" },
  { src: "/showcase/5.webp", alt: "Hieee text behind zebra standing by a tree in African savanna" },
  { src: "/showcase/6.webp", alt: "Hello text behind zebra and tree in green grassland" },
  { src: "/showcase/7.webp", alt: "CITY text behind Toronto skyline with CN Tower at sunset" },
];

export function Showcase() {
  if (SHOWCASE_IMAGES.length === 0) return null;

  return (
    <section className="w-full border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="btt-pulse text-center font-[family-name:var(--font-extenda-light)] text-3xl tracking-tight">
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
                width={800}
                height={533}
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
