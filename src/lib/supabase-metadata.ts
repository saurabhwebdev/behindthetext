import { TextOverlayParams } from "@/types/editor";

interface CreationMetadata {
  image_width: number;
  image_height: number;
  image_format: string;
  text_content: string;
  font_family: string;
  font_size: number;
  font_weight: number;
  text_color: string;
  text_params: TextOverlayParams;
  export_width: number;
  export_height: number;
  dpi_scale: number;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getSessionId(): string {
  const key = "btt_session";
  let sessionId = getCookie(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setCookie(key, sessionId, 365);
  }
  return sessionId;
}

export function hasConsented(): boolean {
  return getCookie("btt_consent") === "yes";
}

export function setConsent(accepted: boolean) {
  setCookie("btt_consent", accepted ? "yes" : "no", 365);
}

async function track(type: string, data: Record<string, unknown>) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  } catch {
    // fire-and-forget
  }
}

export async function saveCreationMetadata(data: CreationMetadata) {
  if (!hasConsented()) return;

  const sessionId = getSessionId();
  await track("creation", { ...data, session_id: sessionId });
}

export async function trackVisit(consent: boolean) {
  const sessionId = getSessionId();
  await track("visit", {
    session_id: sessionId,
    consent,
    referrer: document.referrer || null,
    page_url: window.location.href,
  });
}
