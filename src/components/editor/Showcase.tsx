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
  { src: "/showcase/8.webp", alt: "SURFER text behind man surfing a wave with his dog" },
  { src: "/showcase/9.webp", alt: "SUNDOWN text behind pink sunset over calm ocean waves" },
  { src: "/showcase/10.webp", alt: "CALM! text behind aerial view of surfers riding ocean waves at sunset" },
  { src: "/showcase/11.webp", alt: "PARTY text behind group of surfers carrying boards on a sandy beach" },
];

export function Showcase() {
  if (SHOWCASE_IMAGES.length === 0) return null;

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 lg:grid-cols-4">
        {SHOWCASE_IMAGES.map((item, i) => (
          <div key={i} className="overflow-hidden">
            <Image
              src={item.src}
              alt={item.alt}
              width={800}
              height={533}
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
