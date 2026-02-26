import { EditorLayout } from "@/components/editor/EditorLayout";
import { Showcase } from "@/components/editor/Showcase";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BehindTheText",
  url: "https://behindthetext.site",
  description:
    "Place text behind any image instantly with AI-powered depth estimation. Free online tool — no signup, no uploads to servers. Works 100% in your browser.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern browser with WebGPU or WASM support",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI-powered depth estimation",
    "Place text behind any image subject",
    "Real-time preview with adjustable controls",
    "High-resolution PNG export",
    "10+ curated fonts",
    "100% client-side processing",
    "No signup required",
    "No image uploads to servers",
  ],
  screenshot: "https://behindthetext.site/og-image.png",
  softwareVersion: "1.0",
  creator: {
    "@type": "Organization",
    name: "BehindTheText",
    url: "https://behindthetext.site",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EditorLayout />
      <Showcase />
    </>
  );
}
