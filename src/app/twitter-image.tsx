import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const alt =
  "BehindTheText — Place text behind any image with AI depth estimation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const extendaBold = await readFile(
    join(process.cwd(), "public/fonts/Extenda-80-Peta-trial.ttf")
  );
  const extendaLight = await readFile(
    join(process.cwd(), "public/fonts/Extenda-40-Hecto-trial.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "Extenda Light, system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,49,49,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "Extenda Bold",
              fontSize: 140,
              color: "#ff3131",
              letterSpacing: "8px",
              lineHeight: 1,
            }}
          >
            BTT
          </div>
          <div
            style={{
              fontFamily: "Extenda Light",
              fontSize: 36,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "6px",
              marginTop: 12,
            }}
          >
            BEHINDTHETEXT
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.5px",
              marginTop: 20,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Place text behind any image — powered by AI
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            {["Free", "No Signup", "In-Browser", "AI Depth"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: "rgba(255,49,49,0.1)",
                  border: "1px solid rgba(255,49,49,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 15,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          behindthetext.site
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Extenda Bold",
          data: extendaBold,
          style: "normal",
          weight: 400,
        },
        {
          name: "Extenda Light",
          data: extendaLight,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
