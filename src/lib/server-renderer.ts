/**
 * Server-side image compositing using Sharp + SVG.
 * Ports the client-side canvas-renderer.ts and depth-refine.ts to Node.js.
 *
 * Pipeline: original → text SVG → depth-masked foreground overlay → PNG
 */

import sharp from "sharp";
import { TextOverlayParams } from "@/types/editor";

const REFERENCE_WIDTH = 1000;

// ─── Guided Filter Math (ported from depth-refine.ts) ───

function boxFilter(
  src: Float32Array,
  w: number,
  h: number,
  r: number
): Float32Array {
  const dst = new Float32Array(w * h);
  const tmp = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    const off = y * w;
    let cum = 0;
    const pf = new Float32Array(w + 1);
    for (let x = 0; x < w; x++) {
      cum += src[off + x];
      pf[x + 1] = cum;
    }
    for (let x = 0; x < w; x++) {
      const l = Math.max(0, x - r);
      const ri = Math.min(w - 1, x + r);
      tmp[off + x] = pf[ri + 1] - pf[l];
    }
  }

  for (let x = 0; x < w; x++) {
    let cum = 0;
    const pf = new Float32Array(h + 1);
    for (let y = 0; y < h; y++) {
      cum += tmp[y * w + x];
      pf[y + 1] = cum;
    }
    for (let y = 0; y < h; y++) {
      const t = Math.max(0, y - r);
      const b = Math.min(h - 1, y + r);
      dst[y * w + x] = pf[b + 1] - pf[t];
    }
  }

  return dst;
}

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const r = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] * b[i];
  return r;
}

function downsample(
  src: Float32Array,
  sw: number,
  sh: number,
  s: number
): { data: Float32Array; w: number; h: number } {
  const dw = Math.max(1, Math.round(sw / s));
  const dh = Math.max(1, Math.round(sh / s));
  const dst = new Float32Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(Math.round(y * s), sh - 1);
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(Math.round(x * s), sw - 1);
      dst[y * dw + x] = src[sy * sw + sx];
    }
  }
  return { data: dst, w: dw, h: dh };
}

function upsampleBilinear(
  src: Float32Array,
  sw: number,
  sh: number,
  dw: number,
  dh: number
): Float32Array {
  const dst = new Float32Array(dw * dh);
  const scX = (sw - 1) / (dw - 1 || 1);
  const scY = (sh - 1) / (dh - 1 || 1);
  for (let y = 0; y < dh; y++) {
    const fy = y * scY;
    const y0 = Math.floor(fy);
    const y1 = Math.min(y0 + 1, sh - 1);
    const dy = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = x * scX;
      const x0 = Math.floor(fx);
      const x1 = Math.min(x0 + 1, sw - 1);
      const dx = fx - x0;
      dst[y * dw + x] =
        src[y0 * sw + x0] * (1 - dx) * (1 - dy) +
        src[y0 * sw + x1] * dx * (1 - dy) +
        src[y1 * sw + x0] * (1 - dx) * dy +
        src[y1 * sw + x1] * dx * dy;
    }
  }
  return dst;
}

function rgbToGrayFromRaw(
  rgba: Buffer,
  w: number,
  h: number,
  channels: number
): Float32Array {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] =
      (0.299 * rgba[i * channels] +
        0.587 * rgba[i * channels + 1] +
        0.114 * rgba[i * channels + 2]) /
      255;
  }
  return gray;
}

function fastGuidedFilter(
  guide: Float32Array,
  gw: number,
  gh: number,
  depth: Float32Array,
  dw: number,
  dh: number,
  r: number,
  eps: number,
  s: number
): Float32Array {
  const pFull = upsampleBilinear(depth, dw, dh, gw, gh);
  const gSub = downsample(guide, gw, gh, s);
  const pSub = downsample(pFull, gw, gh, s);
  const sw = gSub.w;
  const sh = gSub.h;
  const rSub = Math.max(1, Math.round(r / s));

  const ones = new Float32Array(sw * sh).fill(1);
  const N = boxFilter(ones, sw, sh, rSub);
  const meanI = boxFilter(gSub.data, sw, sh, rSub);
  const meanP = boxFilter(pSub.data, sw, sh, rSub);
  const meanIP = boxFilter(multiply(gSub.data, pSub.data), sw, sh, rSub);
  const meanII = boxFilter(multiply(gSub.data, gSub.data), sw, sh, rSub);

  const a = new Float32Array(sw * sh);
  const b = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const n = N[i];
    const mI = meanI[i] / n;
    const mP = meanP[i] / n;
    const covIP = meanIP[i] / n - mI * mP;
    const varI = meanII[i] / n - mI * mI;
    a[i] = covIP / (varI + eps);
    b[i] = mP - a[i] * mI;
  }

  const meanA_raw = boxFilter(a, sw, sh, rSub);
  const meanB_raw = boxFilter(b, sw, sh, rSub);
  const meanA = new Float32Array(sw * sh);
  const meanB = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    meanA[i] = meanA_raw[i] / N[i];
    meanB[i] = meanB_raw[i] / N[i];
  }

  const aUp = upsampleBilinear(meanA, sw, sh, gw, gh);
  const bUp = upsampleBilinear(meanB, sw, sh, gw, gh);
  const out = new Float32Array(gw * gh);
  for (let i = 0; i < gw * gh; i++) {
    out[i] = Math.max(0, Math.min(1, aUp[i] * guide[i] + bUp[i]));
  }
  return out;
}

function sobelGradient(
  gray: Float32Array,
  w: number,
  h: number
): Float32Array {
  const g = new Float32Array(w * h);
  const px = (x: number, y: number) => gray[y * w + x];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -px(x - 1, y - 1) +
        px(x + 1, y - 1) +
        -2 * px(x - 1, y) +
        2 * px(x + 1, y) +
        -px(x - 1, y + 1) +
        px(x + 1, y + 1);
      const gy =
        -px(x - 1, y - 1) +
        -2 * px(x, y - 1) +
        -px(x + 1, y - 1) +
        px(x - 1, y + 1) +
        2 * px(x, y + 1) +
        px(x + 1, y + 1);
      g[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return g;
}

// ─── Depth Refinement (replaces browser canvas with Sharp raw pixels) ───

async function refineDepthMap(
  imageBuffer: Buffer,
  depthMap: Float32Array,
  depthW: number,
  depthH: number,
  targetW: number,
  targetH: number
): Promise<{ depth: Float32Array; edges: Float32Array }> {
  // Extract guide image pixels using Sharp (replaces document.createElement("canvas"))
  const { data: guideRaw, info } = await sharp(imageBuffer)
    .resize(targetW, targetH, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const guide = rgbToGrayFromRaw(guideRaw, info.width, info.height, info.channels);

  // Two-pass guided filter
  const coarse = fastGuidedFilter(
    guide, targetW, targetH,
    depthMap, depthW, depthH,
    16, 0.04, 8
  );
  const fine = fastGuidedFilter(
    guide, targetW, targetH,
    depthMap, depthW, depthH,
    4, 0.005, 2
  );

  // Edge detection
  const edges = sobelGradient(guide, targetW, targetH);
  let maxE = 0;
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > maxE) maxE = edges[i];
  }
  if (maxE > 0) {
    for (let i = 0; i < edges.length; i++) {
      edges[i] = Math.min(1, edges[i] / maxE);
    }
  }

  // Merge: sharp at edges, smooth in flat areas
  const merged = new Float32Array(targetW * targetH);
  for (let i = 0; i < merged.length; i++) {
    const e = Math.min(1, edges[i] * 3);
    merged[i] = e * fine[i] + (1 - e) * coarse[i];
  }

  return { depth: merged, edges };
}

// ─── Depth Mask Creation ───

function createDepthMaskBuffer(
  refinedDepth: Float32Array,
  edges: Float32Array,
  w: number,
  h: number,
  threshold: number
): Buffer {
  // Create RGBA buffer where alpha = depth mask
  const buf = Buffer.alloc(w * h * 4);
  const t = threshold / 255;
  const BASE_SOFT = 0.06;
  const EDGE_SHARPENING = 0.85;

  for (let i = 0; i < w * h; i++) {
    const depthVal = refinedDepth[i];
    const edgeStrength = edges[i];
    const softness = BASE_SOFT * (1.0 - edgeStrength * EDGE_SHARPENING);
    const halfSoft = softness / 2;

    let alpha: number;
    if (depthVal >= t + halfSoft) {
      alpha = 255;
    } else if (depthVal <= t - halfSoft) {
      alpha = 0;
    } else {
      const e = (depthVal - (t - halfSoft)) / (softness || 0.001);
      alpha = Math.round(255 * e * e * (3 - 2 * e)); // smoothstep
    }

    const idx = i * 4;
    buf[idx] = 255;     // R
    buf[idx + 1] = 255; // G
    buf[idx + 2] = 255; // B
    buf[idx + 3] = alpha;
  }

  return buf;
}

// ─── SVG Text Generation ───

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateTextSVG(
  params: TextOverlayParams,
  width: number,
  height: number,
  renderScale: number
): Buffer {
  const scaledFontSize = params.fontSize * renderScale;
  const textX = (params.positionX / 100) * width;
  const textY = (params.positionY / 100) * height;
  const letterSpacingPx = params.letterSpacing * renderScale;

  const escapedText = escapeXml(params.text);

  // Build transforms
  const transforms: string[] = [];
  transforms.push(`translate(${textX}, ${textY})`);
  if (params.rotation !== 0) {
    transforms.push(`rotate(${params.rotation})`);
  }
  if (params.skewX !== 0 || params.skewY !== 0) {
    transforms.push(`skewX(${params.skewX}) skewY(${params.skewY})`);
  }
  const transformAttr = transforms.join(" ");

  // Build fill
  let fillAttr: string;
  let defsContent = "";
  if (params.useGradient) {
    defsContent = `
      <linearGradient id="textGrad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="${escapeXml(params.gradientStartColor)}" />
        <stop offset="100%" stop-color="${escapeXml(params.gradientEndColor)}" />
      </linearGradient>`;
    fillAttr = "url(#textGrad)";
  } else {
    fillAttr = escapeXml(params.color);
  }

  // Build text style
  const fontStyle = `
    font-family: "${escapeXml(params.fontFamily)}", Impact, sans-serif;
    font-size: ${scaledFontSize}px;
    font-weight: ${params.fontWeight};
    letter-spacing: ${letterSpacingPx}px;
    text-anchor: middle;
    dominant-baseline: central;
    fill: ${fillAttr};
    opacity: ${params.opacity};
  `;

  // Build shadow filter
  let filterDef = "";
  let filterAttr = "";
  if (params.shadowEnabled) {
    const sBlur = params.shadowBlur * renderScale;
    const sOx = params.shadowOffsetX * renderScale;
    const sOy = params.shadowOffsetY * renderScale;
    filterDef = `
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="${sOx}" dy="${sOy}" stdDeviation="${sBlur / 2}" flood-color="${escapeXml(params.shadowColor)}" flood-opacity="1" />
      </filter>`;
    filterAttr = `filter="url(#shadow)"`;
  }

  // Build stroke
  let strokeElements = "";
  if (params.strokeEnabled) {
    const sWidth = params.strokeWidth * renderScale;
    strokeElements = `
      <text
        transform="${transformAttr}"
        style="${fontStyle}"
        stroke="${escapeXml(params.strokeColor)}"
        stroke-width="${sWidth}"
        stroke-linejoin="round"
        fill="none"
        ${filterAttr}
      >${escapedText}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${defsContent}${filterDef}</defs>
  ${strokeElements}
  <text
    transform="${transformAttr}"
    style="${fontStyle}"
    ${filterAttr}
  >${escapedText}</text>
</svg>`;

  return Buffer.from(svg);
}

// ─── Watermark ───

function generateWatermarkSVG(
  width: number,
  height: number,
  siteName: string
): Buffer {
  const fontSize = Math.max(14, Math.round(width * 0.018));
  const padding = Math.round(fontSize * 0.8);
  const x = width - padding;
  const y = height - padding;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wmShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="${fontSize * 0.15}" flood-color="rgba(0,0,0,0.5)" flood-opacity="1" />
    </filter>
  </defs>
  <text
    x="${x}" y="${y}"
    style="font-family: Inter, 'Segoe UI', system-ui, sans-serif; font-size: ${fontSize}px; font-weight: 600;"
    text-anchor="end"
    dominant-baseline="auto"
    fill="white"
    opacity="0.6"
    filter="url(#wmShadow)"
  >${escapeXml(siteName)}</text>
</svg>`;

  return Buffer.from(svg);
}

// ─── Main Compositing Pipeline ───

export interface GenerateOptions {
  imageBuffer: Buffer;
  textParams: TextOverlayParams;
  withWatermark?: boolean;
}

export async function generateImage(
  options: GenerateOptions
): Promise<Buffer> {
  const { imageBuffer, textParams, withWatermark = false } = options;

  // 1. Get original image dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const renderScale = width / REFERENCE_WIDTH;

  // 2. Run depth estimation
  const { estimateDepthFromBuffer } = await import("./server-depth");
  const { depthMap, width: depthW, height: depthH } = await estimateDepthFromBuffer(imageBuffer);

  // 3. Refine depth map using original image as edge guide
  const { depth: refinedDepth, edges } = await refineDepthMap(
    imageBuffer, depthMap, depthW, depthH, width, height
  );

  // 4. Create depth mask (RGBA buffer with alpha = mask)
  const depthMaskBuf = createDepthMaskBuffer(
    refinedDepth, edges, width, height, textParams.depthThreshold
  );

  // 5. Generate text SVG
  const textSvg = generateTextSVG(textParams, width, height, renderScale);

  // 6. Composite: original + text
  let composited = sharp(imageBuffer)
    .resize(width, height) // ensure exact dimensions
    .composite([
      { input: textSvg, top: 0, left: 0 },
    ]);

  // Get the composited buffer (original + text)
  const withTextBuf = await composited.raw().toBuffer();

  // 7. Create foreground overlay: original image masked by depth
  //    Where depth mask alpha > 0, show original (covers text)
  const depthMaskSharp = sharp(depthMaskBuf, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Extract just the alpha channel from depth mask for masking
  const maskAlpha = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    maskAlpha[i] = depthMaskBuf[i * 4 + 3];
  }

  // Original image RGBA with alpha from depth mask = foreground overlay
  const originalRaw = await sharp(imageBuffer)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer();

  // Apply depth mask alpha to original image
  const fgOverlay = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 4;
    fgOverlay[srcIdx] = originalRaw[srcIdx];         // R
    fgOverlay[srcIdx + 1] = originalRaw[srcIdx + 1]; // G
    fgOverlay[srcIdx + 2] = originalRaw[srcIdx + 2]; // B
    fgOverlay[srcIdx + 3] = maskAlpha[i];             // A from depth mask
  }

  const fgOverlayPng = await sharp(fgOverlay, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  // 8. Final composite: (original + text) + foreground overlay on top
  const layers: sharp.OverlayOptions[] = [
    { input: fgOverlayPng, top: 0, left: 0 },
  ];

  if (withWatermark) {
    const watermarkSvg = generateWatermarkSVG(width, height, "BehindTheText");
    layers.push({ input: watermarkSvg, top: 0, left: 0 });
  }

  // Rebuild from the composited-with-text buffer
  const result = await sharp(withTextBuf, {
    raw: { width, height, channels: 3 },
  })
    .composite(layers)
    .png()
    .toBuffer();

  return result;
}
