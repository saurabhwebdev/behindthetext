export interface TextOverlayParams {
  // Text content
  text: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;

  // Color
  color: string;
  useGradient: boolean;
  gradientStartColor: string;
  gradientEndColor: string;

  // Position & Transform (percentage-based, 0–100)
  positionX: number;
  positionY: number;
  rotation: number;
  skewX: number;
  skewY: number;

  // Depth
  depthThreshold: number; // 0–255, controls where text sits in Z-depth

  // Effects
  opacity: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
}

export interface EditorState {
  originalFile: File | null;
  originalImageUrl: string | null;
  foregroundBlobUrl: string | null;
  isProcessing: boolean;
  processingProgress: number;
  processingStatus: string;
  textParams: TextOverlayParams;
  isExporting: boolean;
}

export interface FontOption {
  family: string;
  label: string;
  weights: number[];
  category: string;
  googleUrl: string;
}
