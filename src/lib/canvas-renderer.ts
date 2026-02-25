import { TextOverlayParams } from "@/types/editor";
import { MAX_DPI_SCALE } from "./constants";

export interface RenderParams {
  canvas: HTMLCanvasElement;
  originalImage: HTMLImageElement;
  textParams: TextOverlayParams;
  depthMap: Float32Array | null;
  depthWidth: number;
  depthHeight: number;
  dpiScale: number;
  containerWidth: number;
  containerHeight: number;
}

function fitToContainer(
  imgW: number,
  imgH: number,
  containerW: number,
  containerH: number
) {
  const scale = Math.min(containerW / imgW, containerH / imgH, 1);
  return {
    width: Math.round(imgW * scale),
    height: Math.round(imgH * scale),
  };
}

function drawText(
  ctx: CanvasRenderingContext2D,
  params: TextOverlayParams,
  canvasWidth: number,
  canvasHeight: number,
  renderScale: number
) {
  const scaledFontSize = params.fontSize * renderScale;
  const textX = (params.positionX / 100) * canvasWidth;
  const textY = (params.positionY / 100) * canvasHeight;

  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate((params.rotation * Math.PI) / 180);

  if (params.skewX !== 0 || params.skewY !== 0) {
    const skewXRad = (params.skewX * Math.PI) / 180;
    const skewYRad = (params.skewY * Math.PI) / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
  }

  ctx.font = `${params.fontWeight} ${scaledFontSize}px "${params.fontFamily}", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${params.letterSpacing * renderScale}px`;
  ctx.globalAlpha = params.opacity;

  if (params.useGradient) {
    const metrics = ctx.measureText(params.text);
    const halfWidth = metrics.width / 2;
    const gradient = ctx.createLinearGradient(-halfWidth, 0, halfWidth, 0);
    gradient.addColorStop(0, params.gradientStartColor);
    gradient.addColorStop(1, params.gradientEndColor);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = params.color;
  }

  if (params.shadowEnabled) {
    ctx.shadowColor = params.shadowColor;
    ctx.shadowBlur = params.shadowBlur * renderScale;
    ctx.shadowOffsetX = params.shadowOffsetX * renderScale;
    ctx.shadowOffsetY = params.shadowOffsetY * renderScale;
  }

  if (params.strokeEnabled) {
    ctx.strokeStyle = params.strokeColor;
    ctx.lineWidth = params.strokeWidth * renderScale;
    ctx.lineJoin = "round";
    ctx.strokeText(params.text, 0, 0);
  }

  ctx.fillText(params.text, 0, 0);

  ctx.globalAlpha = 1;
  ctx.restore();
}

const REFERENCE_WIDTH = 1000;
const SOFTNESS = 0.06; // transition zone width in normalized depth (0-1)

/**
 * Bilinear sample from a single-channel Float32Array depth map.
 * Gives smooth sub-pixel interpolation when mapping canvas pixels to depth pixels.
 */
function sampleDepthBilinear(
  depthMap: Float32Array,
  dw: number,
  dh: number,
  fx: number,
  fy: number
): number {
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, dw - 1);
  const y1 = Math.min(y0 + 1, dh - 1);
  const dx = fx - x0;
  const dy = fy - y0;

  const tl = depthMap[y0 * dw + x0];
  const tr = depthMap[y0 * dw + x1];
  const bl = depthMap[y1 * dw + x0];
  const br = depthMap[y1 * dw + x1];

  const top = tl + (tr - tl) * dx;
  const bot = bl + (br - bl) * dx;
  return top + (bot - top) * dy;
}

/**
 * Creates an RGBA mask from the depth map at the given canvas dimensions.
 * Uses bilinear sampling for smooth edges and a soft sigmoid-like transition.
 */
function createDepthMask(
  depthMap: Float32Array,
  depthW: number,
  depthH: number,
  canvasW: number,
  canvasH: number,
  threshold: number // 0-255
): ImageData {
  const mask = new ImageData(canvasW, canvasH);
  const data = mask.data;
  const t = threshold / 255;
  const halfSoft = SOFTNESS / 2;

  const scaleX = (depthW - 1) / (canvasW - 1 || 1);
  const scaleY = (depthH - 1) / (canvasH - 1 || 1);

  for (let y = 0; y < canvasH; y++) {
    const srcY = y * scaleY;
    const rowOff = y * canvasW;
    for (let x = 0; x < canvasW; x++) {
      const srcX = x * scaleX;
      const depthVal = sampleDepthBilinear(depthMap, depthW, depthH, srcX, srcY);

      let alpha: number;
      if (depthVal >= t + halfSoft) {
        alpha = 255;
      } else if (depthVal <= t - halfSoft) {
        alpha = 0;
      } else {
        // Smooth hermite interpolation (smoothstep) for clean edges
        const edge = (depthVal - (t - halfSoft)) / SOFTNESS;
        const smooth = edge * edge * (3 - 2 * edge);
        alpha = Math.round(255 * smooth);
      }

      const idx = (rowOff + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  return mask;
}

// Reusable offscreen canvases to avoid GC pressure during real-time slider dragging
let _maskCanvas: HTMLCanvasElement | null = null;
let _fgCanvas: HTMLCanvasElement | null = null;

function getTempCanvas(
  which: "mask" | "fg",
  w: number,
  h: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (which === "mask") {
    if (!_maskCanvas) _maskCanvas = document.createElement("canvas");
    _maskCanvas.width = w;
    _maskCanvas.height = h;
    return [_maskCanvas, _maskCanvas.getContext("2d", { alpha: true })!];
  }
  if (!_fgCanvas) _fgCanvas = document.createElement("canvas");
  _fgCanvas.width = w;
  _fgCanvas.height = h;
  const ctx = _fgCanvas.getContext("2d", { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return [_fgCanvas, ctx];
}

function compositeToCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  originalImage: HTMLImageElement,
  textParams: TextOverlayParams,
  depthMap: Float32Array | null,
  depthW: number,
  depthH: number,
  renderScale: number
) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);

  if (depthMap && depthW > 0 && depthH > 0) {
    // 1. Original image as base
    ctx.drawImage(originalImage, 0, 0, w, h);

    // 2. Draw text on top
    drawText(ctx, textParams, w, h, renderScale);

    // 3. Build depth-masked foreground overlay
    const depthMask = createDepthMask(
      depthMap, depthW, depthH, w, h, textParams.depthThreshold
    );

    const [maskCanvas, maskCtx] = getTempCanvas("mask", w, h);
    maskCtx.clearRect(0, 0, w, h);
    maskCtx.putImageData(depthMask, 0, 0);

    const [fgCanvas, fgCtx] = getTempCanvas("fg", w, h);
    fgCtx.globalCompositeOperation = "source-over";
    fgCtx.clearRect(0, 0, w, h);
    fgCtx.drawImage(originalImage, 0, 0, w, h);

    // Mask the original image with the depth mask
    fgCtx.globalCompositeOperation = "destination-in";
    fgCtx.drawImage(maskCanvas, 0, 0);
    fgCtx.globalCompositeOperation = "source-over";

    // 4. Draw depth-masked foreground on top — covers text where objects are closer
    ctx.drawImage(fgCanvas, 0, 0);
  } else {
    ctx.drawImage(originalImage, 0, 0, w, h);
    drawText(ctx, textParams, w, h, renderScale);
  }
}

export function renderPreview({
  canvas,
  originalImage,
  textParams,
  depthMap,
  depthWidth,
  depthHeight,
  dpiScale,
  containerWidth,
  containerHeight,
}: RenderParams): void {
  const scale = Math.min(dpiScale, MAX_DPI_SCALE);
  const imgW = originalImage.naturalWidth;
  const imgH = originalImage.naturalHeight;
  const fitted = fitToContainer(imgW, imgH, containerWidth, containerHeight);

  canvas.width = fitted.width * scale;
  canvas.height = fitted.height * scale;
  canvas.style.width = `${fitted.width}px`;
  canvas.style.height = `${fitted.height}px`;

  const ctx = canvas.getContext("2d", { alpha: true })!;
  const renderScale = canvas.width / REFERENCE_WIDTH;

  compositeToCanvas(
    ctx, canvas.width, canvas.height,
    originalImage, textParams,
    depthMap, depthWidth, depthHeight,
    renderScale
  );
}

export function exportAsPNG(
  originalImage: HTMLImageElement,
  textParams: TextOverlayParams,
  depthMap: Float32Array | null,
  depthWidth: number,
  depthHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const offscreen = document.createElement("canvas");
    offscreen.width = originalImage.naturalWidth;
    offscreen.height = originalImage.naturalHeight;

    const ctx = offscreen.getContext("2d", { alpha: true })!;
    const renderScale = offscreen.width / REFERENCE_WIDTH;

    // For export, create fresh canvases (not the cached preview ones)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);

    const w = offscreen.width;
    const h = offscreen.height;

    if (depthMap && depthWidth > 0 && depthHeight > 0) {
      ctx.drawImage(originalImage, 0, 0, w, h);
      drawText(ctx, textParams, w, h, renderScale);

      const depthMask = createDepthMask(
        depthMap, depthWidth, depthHeight, w, h, textParams.depthThreshold
      );

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext("2d", { alpha: true })!;
      maskCtx.putImageData(depthMask, 0, 0);

      const fgCanvas = document.createElement("canvas");
      fgCanvas.width = w;
      fgCanvas.height = h;
      const fgCtx = fgCanvas.getContext("2d", { alpha: true })!;
      fgCtx.imageSmoothingEnabled = true;
      fgCtx.imageSmoothingQuality = "high";
      fgCtx.drawImage(originalImage, 0, 0, w, h);
      fgCtx.globalCompositeOperation = "destination-in";
      fgCtx.drawImage(maskCanvas, 0, 0);
      fgCtx.globalCompositeOperation = "source-over";

      ctx.drawImage(fgCanvas, 0, 0);
    } else {
      ctx.drawImage(originalImage, 0, 0, w, h);
      drawText(ctx, textParams, w, h, renderScale);
    }

    offscreen.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export canvas as PNG"));
      },
      "image/png",
      1.0
    );
  });
}
