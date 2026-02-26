"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "../../public/lottie-404.json";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="w-full max-w-sm">
        <Lottie animationData={animationData} loop autoplay />
      </div>
      <h1 className="btt-pulse font-[family-name:var(--font-extenda-bold)] text-5xl tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-1 text-base text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to BehindTheText
      </Link>
    </div>
  );
}
