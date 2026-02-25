import { supabase } from "./supabase";
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

function getSessionId(): string {
  const key = "behindthetext_session_id";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export async function saveCreationMetadata(data: CreationMetadata) {
  const sessionId = getSessionId();
  const { error } = await supabase
    .from("creations")
    .insert({ ...data, session_id: sessionId });
  if (error) {
    console.error("Failed to save creation metadata:", error);
  }
}
