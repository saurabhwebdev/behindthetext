"use client";

import { TextOverlayParams } from "@/types/editor";
import { CURATED_FONTS } from "@/lib/font-config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./ExportButton";

interface ControlsPanelProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
  reset: () => void;
  onExport: (withWatermark: boolean) => Promise<void>;
  isExporting: boolean;
  hasImage: boolean;
  hasDepth: boolean;
  onNewImage: () => void;
  previewCanvas: HTMLCanvasElement | null;
}

function S({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-[family-name:var(--font-extenda-light)] text-base">{label}</Label>
        <span className="text-base tabular-nums text-muted-foreground">
          {value}{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step || 1}
        onValueChange={([v]) => onChange(v)}
        className="py-1"
      />
    </div>
  );
}

export function ControlsPanel({
  textParams,
  setField,
  reset,
  onExport,
  isExporting,
  hasImage,
  hasDepth,
  onNewImage,
  previewCanvas,
}: ControlsPanelProps) {
  const disabled = !hasImage || !hasDepth;

  return (
    <div className={`space-y-5 ${disabled ? "pointer-events-none opacity-40" : ""}`}>

      <Input
        value={textParams.text}
        onChange={(e) => setField("text", e.target.value)}
        placeholder="Enter your text..."
        className="h-12 text-lg font-medium"
      />

      <div className="flex gap-2">
        <select
          value={textParams.fontFamily}
          onChange={(e) => setField("fontFamily", e.target.value)}
          className="h-12 flex-1 rounded-md border border-input bg-transparent px-3 text-base outline-none"
        >
          {CURATED_FONTS.map((f) => (
            <option key={f.family} value={f.family}>{f.label}</option>
          ))}
        </select>
        {[
          { l: "R", v: 400 },
          { l: "B", v: 700 },
          { l: "X", v: 900 },
        ].map((w) => (
          <Button
            key={w.v}
            variant={textParams.fontWeight === w.v ? "default" : "outline"}
            className="h-12 w-12 p-0 text-base"
            onClick={() => setField("fontWeight", w.v)}
          >
            {w.l}
          </Button>
        ))}
      </div>

      <S label="Size" value={textParams.fontSize} min={10} max={500} onChange={(v) => setField("fontSize", v)} suffix="px" />
      <S label="Depth" value={Math.round((textParams.depthThreshold / 255) * 100)} min={0} max={100} onChange={(v) => setField("depthThreshold", Math.round((v / 100) * 255))} suffix="%" />

      <div className="flex items-center gap-3">
        <Label className="font-[family-name:var(--font-extenda-light)] text-base">Color</Label>
        <input
          type="color"
          value={textParams.color}
          onChange={(e) => setField("color", e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <Input
          value={textParams.color}
          onChange={(e) => setField("color", e.target.value)}
          className="h-10 w-28 font-mono text-base"
        />
      </div>

      <S label="Opacity" value={Math.round(textParams.opacity * 100)} min={0} max={100} onChange={(v) => setField("opacity", v / 100)} suffix="%" />
      <S label="X" value={textParams.positionX} min={0} max={100} onChange={(v) => setField("positionX", v)} suffix="%" />
      <S label="Y" value={textParams.positionY} min={0} max={100} onChange={(v) => setField("positionY", v)} suffix="%" />
      <S label="Rotate" value={textParams.rotation} min={-180} max={180} onChange={(v) => setField("rotation", v)} suffix="°" />
      <S label="Spacing" value={textParams.letterSpacing} min={-20} max={50} onChange={(v) => setField("letterSpacing", v)} suffix="px" />

      <div className="space-y-3 pt-2">
        <ExportButton onExport={onExport} disabled={disabled} isExporting={isExporting} previewCanvas={previewCanvas} />
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 text-base" onClick={reset}>Reset</Button>
          <Button variant="outline" className="h-12 text-base" onClick={onNewImage}>New Image</Button>
        </div>
      </div>
    </div>
  );
}
