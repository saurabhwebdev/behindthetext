"use client";

import { useEffect, useState, useRef } from "react";
import { CURATED_FONTS } from "@/lib/font-config";

export function useFontLoader(fontFamily: string, fontWeight: number) {
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const loadedFontsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const key = `${fontFamily}-${fontWeight}`;

    // System fonts don't need loading
    const fontConfig = CURATED_FONTS.find((f) => f.family === fontFamily);
    if (!fontConfig || !fontConfig.googleUrl) {
      setIsFontLoaded(true);
      return;
    }

    // Already loaded
    if (loadedFontsRef.current.has(key)) {
      setIsFontLoaded(true);
      return;
    }

    setIsFontLoaded(false);

    // Inject Google Fonts link tag
    const linkId = `font-${fontFamily.replace(/\s+/g, "-")}`;
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = fontConfig.googleUrl;
      document.head.appendChild(link);
    }

    // Wait for font to be ready
    const fontFace = `${fontWeight} 48px "${fontFamily}"`;
    document.fonts
      .load(fontFace)
      .then(() => {
        loadedFontsRef.current.add(key);
        setIsFontLoaded(true);
      })
      .catch(() => {
        // Fallback: mark as loaded after timeout so rendering isn't blocked
        setTimeout(() => setIsFontLoaded(true), 2000);
      });
  }, [fontFamily, fontWeight]);

  return { isFontLoaded };
}
