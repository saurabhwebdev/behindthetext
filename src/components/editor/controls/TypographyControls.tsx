"use client";

import { TextOverlayParams } from "@/types/editor";
import { CURATED_FONTS } from "@/lib/font-config";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SliderField } from "./SliderField";
import { Type, ALargeSmall, Space } from "lucide-react";

interface TypographyControlsProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
}

export function TypographyControls({
  textParams,
  setField,
}: TypographyControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          value={textParams.fontFamily}
          onValueChange={(v) => setField("fontFamily", v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURATED_FONTS.map((f) => (
              <SelectItem key={f.family} value={f.family}>
                <span style={{ fontFamily: f.family }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1.5">
          {[
            { l: "R", v: 400 },
            { l: "B", v: 700 },
            { l: "X", v: 900 },
          ].map((w) => (
            <Button
              key={w.v}
              variant={textParams.fontWeight === w.v ? "default" : "outline"}
              className="h-9 flex-1 text-sm"
              onClick={() => setField("fontWeight", w.v)}
            >
              {w.l}
            </Button>
          ))}
        </div>
      </div>

      <SliderField
        label="Size"
        icon={<Type className="h-3 w-3" />}
        value={textParams.fontSize}
        min={10}
        max={500}
        onChange={(v) => setField("fontSize", v)}
        suffix="px"
      />

      <SliderField
        label="Spacing"
        icon={<Space className="h-3 w-3" />}
        value={textParams.letterSpacing}
        min={-20}
        max={50}
        onChange={(v) => setField("letterSpacing", v)}
        suffix="px"
      />
    </div>
  );
}
