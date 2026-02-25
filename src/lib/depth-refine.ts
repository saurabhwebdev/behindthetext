/**
 * Fast Guided Filter for edge-aware depth map refinement.
 * Uses the original RGB image to sharpen depth boundaries so they
 * snap precisely to real object edges in the photograph.
 */

/** O(1) box filter via prefix sums. Single-channel Float32Array. */
function boxFilter(
  src: Float32Array,
  w: number,
  h: number,
  r: number
): Float32Array {
  const dst = new Float32Array(w * h);
  const tmp = new Float32Array(w * h);

  // Horizontal pass
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

  // Vertical pass
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

function rgbToGray(imageData: ImageData): Float32Array {
  const { width: w, height: h, data: rgba } = imageData;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] =
      (0.299 * rgba[i * 4] +
        0.587 * rgba[i * 4 + 1] +
        0.114 * rgba[i * 4 + 2]) /
      255;
  }
  return gray;
}

/**
 * Fast Guided Filter — refines a low-res depth map using the
 * high-res original image as an edge guide.
 */
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

/** Sobel gradient magnitude for edge detection. */
function sobelGradient(
  gray: Float32Array,
  w: number,
  h: number
): Float32Array {
  const g = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -src(gray, w, x - 1, y - 1) +
        src(gray, w, x + 1, y - 1) +
        -2 * src(gray, w, x - 1, y) +
        2 * src(gray, w, x + 1, y) +
        -src(gray, w, x - 1, y + 1) +
        src(gray, w, x + 1, y + 1);
      const gy =
        -src(gray, w, x - 1, y - 1) +
        -2 * src(gray, w, x, y - 1) +
        -src(gray, w, x + 1, y - 1) +
        src(gray, w, x - 1, y + 1) +
        2 * src(gray, w, x, y + 1) +
        src(gray, w, x + 1, y + 1);
      g[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return g;
}

function src(a: Float32Array, w: number, x: number, y: number): number {
  return a[y * w + x];
}

// ─── Cache for refined depth (only recomputed when image/depth changes) ───

let _cachedRefined: Float32Array | null = null;
let _cachedGuide: Float32Array | null = null;
let _cachedEdges: Float32Array | null = null;
let _cachedW = 0;
let _cachedH = 0;
let _cacheKey = "";

/**
 * Main entry point: refines a raw depth map using the original image as guide.
 * Returns the refined depth map and edge map at the target canvas dimensions.
 * Results are cached — only recomputes when the image/depth/size changes.
 */
export function refineDepthMap(
  originalImage: HTMLImageElement,
  depthMap: Float32Array,
  depthW: number,
  depthH: number,
  targetW: number,
  targetH: number
): { depth: Float32Array; edges: Float32Array; w: number; h: number } {
  const key = `${depthW}:${depthH}:${targetW}:${targetH}`;
  if (key === _cacheKey && _cachedRefined && _cachedGuide && _cachedEdges) {
    return {
      depth: _cachedRefined,
      edges: _cachedEdges,
      w: _cachedW,
      h: _cachedH,
    };
  }

  // Get guide from original image at target resolution
  const tc = document.createElement("canvas");
  tc.width = targetW;
  tc.height = targetH;
  const tctx = tc.getContext("2d")!;
  tctx.drawImage(originalImage, 0, 0, targetW, targetH);
  const imgData = tctx.getImageData(0, 0, targetW, targetH);
  const guide = rgbToGray(imgData);

  // Two-pass guided filter for multi-scale refinement:
  // Pass 1: large radius for global structure
  const coarse = fastGuidedFilter(
    guide, targetW, targetH,
    depthMap, depthW, depthH,
    16, 0.04, 8
  );

  // Pass 2: small radius for fine edge detail
  const fine = fastGuidedFilter(
    guide, targetW, targetH,
    depthMap, depthW, depthH,
    4, 0.005, 2
  );

  // Compute edge map from guide for adaptive blending
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

  // Merge: at image edges use fine (sharp), in flat areas use coarse (stable)
  const merged = new Float32Array(targetW * targetH);
  for (let i = 0; i < merged.length; i++) {
    const e = Math.min(1, edges[i] * 3); // amplify edge signal
    merged[i] = e * fine[i] + (1 - e) * coarse[i];
  }

  _cachedRefined = merged;
  _cachedGuide = guide;
  _cachedEdges = edges;
  _cachedW = targetW;
  _cachedH = targetH;
  _cacheKey = key;

  return { depth: merged, edges, w: targetW, h: targetH };
}

/**
 * Creates an edge-adaptive depth mask with variable softness.
 * Sharp transitions at object edges, smooth transitions elsewhere.
 */
export function createEdgeAdaptiveDepthMask(
  refinedDepth: Float32Array,
  edges: Float32Array,
  w: number,
  h: number,
  threshold: number // 0-255
): ImageData {
  const mask = new ImageData(w, h);
  const data = mask.data;
  const t = threshold / 255;
  const BASE_SOFT = 0.06;
  const EDGE_SHARPENING = 0.85;

  for (let i = 0; i < w * h; i++) {
    const depthVal = refinedDepth[i];
    const edgeStrength = edges[i];

    // At image edges: sharper depth cut. In flat areas: softer blending.
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
    data[idx] = 255;
    data[idx + 1] = 255;
    data[idx + 2] = 255;
    data[idx + 3] = alpha;
  }

  return mask;
}
