"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="btt-logo font-[family-name:var(--font-extenda-bold)] text-2xl tracking-wide">
            BTT
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
