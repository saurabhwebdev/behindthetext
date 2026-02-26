"use client";

import { TextOverlayParams } from "@/types/editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SliderField } from "./SliderField";
import { Droplets, PenLine, ChevronDown } from "lucide-react";

interface EffectsControlsProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
}

export function EffectsControls({
  textParams,
  setField,
}: EffectsControlsProps) {
  return (
    <div className="space-y-3">
      {/* Shadow */}
      <Collapsible open={textParams.shadowEnabled}>
        <div className="flex items-center justify-between">
          <Toggle
            pressed={textParams.shadowEnabled}
            onPressedChange={(v) => setField("shadowEnabled", v)}
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
          >
            <Droplets className="h-3 w-3" />
            Shadow
          </Toggle>
          {textParams.shadowEnabled && (
            <CollapsibleTrigger className="text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5" />
            </CollapsibleTrigger>
          )}
        </div>
        <CollapsibleContent className="mt-3 space-y-3 pl-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <input
              type="color"
              value={textParams.shadowColor}
              onChange={(e) => setField("shadowColor", e.target.value)}
              className="h-7 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <Input
              value={textParams.shadowColor}
              onChange={(e) => setField("shadowColor", e.target.value)}
              className="h-7 flex-1 font-mono text-xs"
            />
          </div>
          <SliderField
            label="Blur"
            value={textParams.shadowBlur}
            min={0}
            max={50}
            onChange={(v) => setField("shadowBlur", v)}
            suffix="px"
          />
          <SliderField
            label="Offset X"
            value={textParams.shadowOffsetX}
            min={-50}
            max={50}
            onChange={(v) => setField("shadowOffsetX", v)}
            suffix="px"
          />
          <SliderField
            label="Offset Y"
            value={textParams.shadowOffsetY}
            min={-50}
            max={50}
            onChange={(v) => setField("shadowOffsetY", v)}
            suffix="px"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Stroke */}
      <Collapsible open={textParams.strokeEnabled}>
        <div className="flex items-center justify-between">
          <Toggle
            pressed={textParams.strokeEnabled}
            onPressedChange={(v) => setField("strokeEnabled", v)}
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
          >
            <PenLine className="h-3 w-3" />
            Stroke
          </Toggle>
          {textParams.strokeEnabled && (
            <CollapsibleTrigger className="text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5" />
            </CollapsibleTrigger>
          )}
        </div>
        <CollapsibleContent className="mt-3 space-y-3 pl-1">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <input
              type="color"
              value={textParams.strokeColor}
              onChange={(e) => setField("strokeColor", e.target.value)}
              className="h-7 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
            <Input
              value={textParams.strokeColor}
              onChange={(e) => setField("strokeColor", e.target.value)}
              className="h-7 flex-1 font-mono text-xs"
            />
          </div>
          <SliderField
            label="Width"
            value={textParams.strokeWidth}
            min={1}
            max={20}
            onChange={(v) => setField("strokeWidth", v)}
            suffix="px"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
