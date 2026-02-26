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

// Split into two rows for opposing scroll directions
const ROW_1 = SHOWCASE_IMAGES.slice(0, 6);
const ROW_2 = SHOWCASE_IMAGES.slice(6).concat(SHOWCASE_IMAGES.slice(0, 2));

function TickerRow({
  images,
  direction,
  duration,
}: {
  images: ShowcaseItem[];
  direction: "left" | "right";
  duration: string;
}) {
  // Duplicate the set for seamless loop
  const items = [...images, ...images];

  return (
    <div className="showcase-ticker group relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div
        className={`flex w-max gap-3 ${
          direction === "left" ? "showcase-scroll-left" : "showcase-scroll-right"
        } group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: duration }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.src}-${i}`}
            className="w-64 shrink-0 overflow-hidden rounded-xl sm:w-72 lg:w-80"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={800}
              height={533}
              className="h-auto w-full object-cover"
              sizes="320px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
  if (SHOWCASE_IMAGES.length === 0) return null;

  return (
    <section className="w-full overflow-hidden py-8">
      <div className="space-y-3">
        <TickerRow images={ROW_1} direction="left" duration="40s" />
        <TickerRow images={ROW_2} direction="right" duration="35s" />
      </div>
    </section>
  );
}
