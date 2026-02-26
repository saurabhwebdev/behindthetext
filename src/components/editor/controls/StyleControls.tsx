"use client";

import { TextOverlayParams } from "@/types/editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { SliderField } from "./SliderField";
import { Layers, Palette, Eye, Blend } from "lucide-react";

interface StyleControlsProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
}

export function StyleControls({ textParams, setField }: StyleControlsProps) {
  return (
    <div className="space-y-4">
      <SliderField
        label="Depth"
        icon={<Layers className="h-3 w-3" />}
        value={Math.round((textParams.depthThreshold / 255) * 100)}
        min={0}
        max={100}
        onChange={(v) =>
          setField("depthThreshold", Math.round((v / 100) * 255))
        }
        suffix="%"
      />

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Palette className="h-3 w-3 text-foreground/60" />
          Color
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textParams.color}
            onChange={(e) => setField("color", e.target.value)}
            className="h-9 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
          />
          <Input
            value={textParams.color}
            onChange={(e) => setField("color", e.target.value)}
            className="h-9 flex-1 font-mono text-xs"
          />
        </div>
      </div>

      <SliderField
        label="Opacity"
        icon={<Eye className="h-3 w-3" />}
        value={Math.round(textParams.opacity * 100)}
        min={0}
        max={100}
        onChange={(v) => setField("opacity", v / 100)}
        suffix="%"
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Toggle
            pressed={textParams.useGradient}
            onPressedChange={(v) => setField("useGradient", v)}
            size="sm"
            className="h-7 px-2 text-xs"
          >
            <Blend className="mr-1 h-3 w-3" />
            Gradient
          </Toggle>
        </div>
        {textParams.useGradient && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textParams.gradientStartColor}
              onChange={(e) => setField("gradientStartColor", e.target.value)}
              className="h-8 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="color"
              value={textParams.gradientEndColor}
              onChange={(e) => setField("gradientEndColor", e.target.value)}
              className="h-8 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
          </div>
        )}
      </div>
    </div>
  );
}
