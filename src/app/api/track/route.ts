import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || null;

    if (type === "creation") {
      await supabase.from("creations").insert({
        ...data,
        ip_address: ip,
        user_agent: userAgent,
        country,
      });
    } else if (type === "visit") {
      await supabase.from("visitors").insert({
        session_id: data.session_id,
        consent: data.consent ?? false,
        referrer: data.referrer || null,
        page_url: data.page_url || null,
        ip_address: ip,
        user_agent: userAgent,
        country,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
