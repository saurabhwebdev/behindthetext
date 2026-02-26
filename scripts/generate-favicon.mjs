import sharp from "sharp";

// Create a 256x256 SVG with "BTT" in red on dark background
const svg = `
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="48" fill="#0a0a0a"/>
  <text x="128" y="170" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="120" letter-spacing="4" fill="#ff3131">BTT</text>
</svg>
`;

// Generate ICO-compatible PNG at multiple sizes then combine into favicon
await sharp(Buffer.from(svg))
  .resize(48, 48)
  .png()
  .toFile("C:/webdevpersonal/textoverlay/src/app/favicon.ico");

// Also generate apple-touch-icon
await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile("C:/webdevpersonal/textoverlay/public/apple-touch-icon.png");

// And a 192x192 for PWA
await sharp(Buffer.from(svg))
  .resize(192, 192)
  .png()
  .toFile("C:/webdevpersonal/textoverlay/public/icon-192.png");

// And 512x512 for PWA
await sharp(Buffer.from(svg))
  .resize(512, 512)
  .png()
  .toFile("C:/webdevpersonal/textoverlay/public/icon-512.png");

console.log("Favicons generated!");
