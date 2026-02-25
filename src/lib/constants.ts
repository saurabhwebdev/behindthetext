import { TextOverlayParams } from "@/types/editor";

export const DEFAULT_TEXT =
  process.env.NEXT_PUBLIC_DEFAULT_TEXT || "YOUR TEXT";
export const DEFAULT_FONT_SIZE = Number(
  process.env.NEXT_PUBLIC_DEFAULT_FONT_SIZE || 120
);
export const DEFAULT_FONT_COLOR =
  process.env.NEXT_PUBLIC_DEFAULT_FONT_COLOR || "#ffffff";
export const MAX_FILE_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || 10
);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_DPI_SCALE = 3;

export const DEFAULT_TEXT_PARAMS: TextOverlayParams = {
  text: DEFAULT_TEXT,
  fontFamily: "Anton",
  fontSize: DEFAULT_FONT_SIZE,
  fontWeight: 400,
  letterSpacing: 0,
  color: DEFAULT_FONT_COLOR,
  useGradient: false,
  gradientStartColor: "#ffffff",
  gradientEndColor: "#00a8ff",
  positionX: 50,
  positionY: 50,
  rotation: 0,
  skewX: 0,
  skewY: 0,
  depthThreshold: 128,
  opacity: 1,
  shadowEnabled: false,
  shadowColor: "#000000",
  shadowBlur: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
  strokeEnabled: false,
  strokeColor: "#000000",
  strokeWidth: 2,
};
