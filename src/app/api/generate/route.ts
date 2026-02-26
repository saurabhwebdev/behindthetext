import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/server-renderer";
import { TextOverlayParams } from "@/types/editor";
import { DEFAULT_TEXT_PARAMS } from "@/lib/constants";

export const maxDuration = 300; // 5 min timeout for cold starts (model download)
export const dynamic = "force-dynamic";

interface GenerateRequest {
  imageUrl: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  positionX?: number;
  positionY?: number;
  depthThreshold?: number;
  rotation?: number;
  opacity?: number;
  letterSpacing?: number;
  skewX?: number;
  skewY?: number;
  useGradient?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  strokeEnabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  withWatermark?: boolean;
}

function validateRequest(body: unknown): { data: GenerateRequest; error?: string } {
  if (!body || typeof body !== "object") {
    return { data: {} as GenerateRequest, error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!b.imageUrl || typeof b.imageUrl !== "string") {
    return { data: {} as GenerateRequest, error: "imageUrl is required and must be a string" };
  }

  // Basic URL validation
  try {
    new URL(b.imageUrl);
  } catch {
    return { data: {} as GenerateRequest, error: "imageUrl must be a valid URL" };
  }

  return { data: body as GenerateRequest };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = validateRequest(body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Fetch the image from URL
    const imageRes = await fetch(data.imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BehindTheText/1.0)",
        "Accept": "image/*,*/*",
      },
      redirect: "follow",
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageRes.status} ${imageRes.statusText}` },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Validate it's actually an image by checking with Sharp
    try {
      const meta = await (await import("sharp")).default(imageBuffer).metadata();
      if (!meta.format || !["jpeg", "png", "webp", "jpg"].includes(meta.format)) {
        return NextResponse.json(
          { error: `Unsupported image format: ${meta.format}. Use JPEG, PNG, or WebP.` },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Could not decode image. Make sure the URL points to a valid JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    // Merge provided params with defaults
    const textParams: TextOverlayParams = {
      ...DEFAULT_TEXT_PARAMS,
      ...(data.text !== undefined && { text: data.text }),
      ...(data.fontFamily !== undefined && { fontFamily: data.fontFamily }),
      ...(data.fontSize !== undefined && { fontSize: data.fontSize }),
      ...(data.fontWeight !== undefined && { fontWeight: data.fontWeight }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.positionX !== undefined && { positionX: data.positionX }),
      ...(data.positionY !== undefined && { positionY: data.positionY }),
      ...(data.depthThreshold !== undefined && { depthThreshold: data.depthThreshold }),
      ...(data.rotation !== undefined && { rotation: data.rotation }),
      ...(data.opacity !== undefined && { opacity: data.opacity }),
      ...(data.letterSpacing !== undefined && { letterSpacing: data.letterSpacing }),
      ...(data.skewX !== undefined && { skewX: data.skewX }),
      ...(data.skewY !== undefined && { skewY: data.skewY }),
      ...(data.useGradient !== undefined && { useGradient: data.useGradient }),
      ...(data.gradientStartColor !== undefined && { gradientStartColor: data.gradientStartColor }),
      ...(data.gradientEndColor !== undefined && { gradientEndColor: data.gradientEndColor }),
      ...(data.shadowEnabled !== undefined && { shadowEnabled: data.shadowEnabled }),
      ...(data.shadowColor !== undefined && { shadowColor: data.shadowColor }),
      ...(data.shadowBlur !== undefined && { shadowBlur: data.shadowBlur }),
      ...(data.shadowOffsetX !== undefined && { shadowOffsetX: data.shadowOffsetX }),
      ...(data.shadowOffsetY !== undefined && { shadowOffsetY: data.shadowOffsetY }),
      ...(data.strokeEnabled !== undefined && { strokeEnabled: data.strokeEnabled }),
      ...(data.strokeColor !== undefined && { strokeColor: data.strokeColor }),
      ...(data.strokeWidth !== undefined && { strokeWidth: data.strokeWidth }),
    };

    const pngBuffer = await generateImage({
      imageBuffer,
      textParams,
      withWatermark: data.withWatermark ?? false,
    });

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="behindthetext-${Date.now()}.png"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
