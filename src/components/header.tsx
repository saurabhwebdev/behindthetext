"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "TextOverlay";

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <span className="text-lg font-semibold tracking-tight">{appName}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
