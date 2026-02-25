import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BehindTheText — Place Text Behind Any Image",
    short_name: "BehindTheText",
    description:
      "Place text behind any image instantly with AI-powered depth estimation. Free, no signup, works in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "any",
    categories: ["photo", "design", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
