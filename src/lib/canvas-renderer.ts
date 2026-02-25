import { TextOverlayParams } from "@/types/editor";
import { MAX_DPI_SCALE } from "./constants";
import { refineDepthMap, createEdgeAdaptiveDepthMask } from "./depth-refine";

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

// Reusable offscreen canvases for preview (avoid GC during slider drag)
let _maskCanvas: HTMLCanvasElement | null = null;
let _fgCanvas: HTMLCanvasElement | null = null;

function getTemp(
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

function compositeWithDepth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  originalImage: HTMLImageElement,
  textParams: TextOverlayParams,
  depthMap: Float32Array,
  depthW: number,
  depthH: number,
  renderScale: number,
  useCache: boolean
) {
  // Refine depth map using original image as edge guide (cached internally)
  const refined = refineDepthMap(
    originalImage,
    depthMap,
    depthW,
    depthH,
    w,
    h
  );

  // Create edge-adaptive depth mask
  const depthMask = createEdgeAdaptiveDepthMask(
    refined.depth,
    refined.edges,
    w,
    h,
    textParams.depthThreshold
  );

  // 1. Original image as base
  ctx.drawImage(originalImage, 0, 0, w, h);

  // 2. Text on top
  drawText(ctx, textParams, w, h, renderScale);

  // 3. Build foreground overlay from depth mask
  let maskCanvas: HTMLCanvasElement;
  let maskCtx: CanvasRenderingContext2D;
  let fgCanvas: HTMLCanvasElement;
  let fgCtx: CanvasRenderingContext2D;

  if (useCache) {
    [maskCanvas, maskCtx] = getTemp("mask", w, h);
    [fgCanvas, fgCtx] = getTemp("fg", w, h);
  } else {
    maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    maskCtx = maskCanvas.getContext("2d", { alpha: true })!;
    fgCanvas = document.createElement("canvas");
    fgCanvas.width = w;
    fgCanvas.height = h;
    fgCtx = fgCanvas.getContext("2d", { alpha: true })!;
    fgCtx.imageSmoothingEnabled = true;
    fgCtx.imageSmoothingQuality = "high";
  }

  maskCtx.clearRect(0, 0, w, h);
  maskCtx.putImageData(depthMask, 0, 0);

  fgCtx.globalCompositeOperation = "source-over";
  fgCtx.clearRect(0, 0, w, h);
  fgCtx.drawImage(originalImage, 0, 0, w, h);
  fgCtx.globalCompositeOperation = "destination-in";
  fgCtx.drawImage(maskCanvas, 0, 0);
  fgCtx.globalCompositeOperation = "source-over";

  // 4. Foreground overlay covers text where objects are closer
  ctx.drawImage(fgCanvas, 0, 0);
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
  renderScale: number,
  useCache: boolean
) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);

  if (depthMap && depthW > 0 && depthH > 0) {
    compositeWithDepth(
      ctx, w, h, originalImage, textParams,
      depthMap, depthW, depthH, renderScale, useCache
    );
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
    renderScale, true
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

    compositeToCanvas(
      ctx, offscreen.width, offscreen.height,
      originalImage, textParams,
      depthMap, depthWidth, depthHeight,
      renderScale, false
    );

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
