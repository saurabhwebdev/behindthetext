"use client";

import { useState } from "react";
import { TextOverlayParams } from "@/types/editor";
import { CURATED_FONTS } from "@/lib/font-config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./ExportButton";
import { ChevronDown } from "lucide-react";

interface ControlsPanelProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
  reset: () => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
  hasImage: boolean;
  hasDepth: boolean;
  onNewImage: () => void;
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/50 bg-card/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex-1">{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-2.5 px-3 pb-3">{children}</div>}
    </div>
  );
}

function SliderRow({
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
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px]">{label}</Label>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step || 1}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function ColorPick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="min-w-12 text-[11px]">{label}</Label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-[72px] font-mono text-[11px]"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-[11px] font-medium">{label}</span>
    </label>
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
}: ControlsPanelProps) {
  const disabled = !hasImage || !hasDepth;

  return (
    <div
      className={`space-y-2 ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {/* ── Text ── */}
      <Input
        value={textParams.text}
        onChange={(e) => setField("text", e.target.value)}
        placeholder="Enter your text..."
        className="h-9 font-medium"
      />

      {/* ── Font + Size (compact row) ── */}
      <div className="flex gap-2">
        <select
          value={textParams.fontFamily}
          onChange={(e) => setField("fontFamily", e.target.value)}
          className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-xs outline-none"
        >
          {CURATED_FONTS.map((font) => (
            <option key={font.family} value={font.family}>
              {font.label}
            </option>
          ))}
        </select>
        <div className="flex gap-0.5">
          {[
            { label: "R", value: 400 },
            { label: "B", value: 700 },
            { label: "X", value: 900 },
          ].map((w) => (
            <Button
              key={w.value}
              variant={textParams.fontWeight === w.value ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-[11px]"
              onClick={() => setField("fontWeight", w.value)}
            >
              {w.label}
            </Button>
          ))}
        </div>
      </div>

      <SliderRow
        label="Size"
        value={textParams.fontSize}
        min={10}
        max={500}
        onChange={(v) => setField("fontSize", v)}
        suffix="px"
      />

      {/* ── Depth ── */}
      <SliderRow
        label="Depth"
        value={Math.round((textParams.depthThreshold / 255) * 100)}
        min={0}
        max={100}
        onChange={(v) => setField("depthThreshold", Math.round((v / 100) * 255))}
        suffix="%"
      />

      {/* ── Style (color + effects combined) ── */}
      <Section title="Style">
        <ColorPick
          label="Color"
          value={textParams.color}
          onChange={(v) => setField("color", v)}
        />

        <Toggle
          label="Gradient"
          checked={textParams.useGradient}
          onChange={(v) => setField("useGradient", v)}
        />
        {textParams.useGradient && (
          <div className="ml-2 space-y-1.5 border-l-2 border-border pl-2">
            <ColorPick
              label="Start"
              value={textParams.gradientStartColor}
              onChange={(v) => setField("gradientStartColor", v)}
            />
            <ColorPick
              label="End"
              value={textParams.gradientEndColor}
              onChange={(v) => setField("gradientEndColor", v)}
            />
          </div>
        )}

        <SliderRow
          label="Opacity"
          value={Math.round(textParams.opacity * 100)}
          min={0}
          max={100}
          onChange={(v) => setField("opacity", v / 100)}
          suffix="%"
        />

        <Toggle
          label="Shadow"
          checked={textParams.shadowEnabled}
          onChange={(v) => setField("shadowEnabled", v)}
        />
        {textParams.shadowEnabled && (
          <div className="ml-2 space-y-1.5 border-l-2 border-border pl-2">
            <ColorPick
              label="Color"
              value={textParams.shadowColor}
              onChange={(v) => setField("shadowColor", v)}
            />
            <SliderRow
              label="Blur"
              value={textParams.shadowBlur}
              min={0}
              max={50}
              onChange={(v) => setField("shadowBlur", v)}
            />
          </div>
        )}

        <Toggle
          label="Stroke"
          checked={textParams.strokeEnabled}
          onChange={(v) => setField("strokeEnabled", v)}
        />
        {textParams.strokeEnabled && (
          <div className="ml-2 space-y-1.5 border-l-2 border-border pl-2">
            <ColorPick
              label="Color"
              value={textParams.strokeColor}
              onChange={(v) => setField("strokeColor", v)}
            />
            <SliderRow
              label="Width"
              value={textParams.strokeWidth}
              min={0}
              max={20}
              onChange={(v) => setField("strokeWidth", v)}
              suffix="px"
            />
          </div>
        )}
      </Section>

      {/* ── Position (advanced, collapsed by default) ── */}
      <Section title="Position">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <SliderRow
            label="X"
            value={textParams.positionX}
            min={0}
            max={100}
            onChange={(v) => setField("positionX", v)}
            suffix="%"
          />
          <SliderRow
            label="Y"
            value={textParams.positionY}
            min={0}
            max={100}
            onChange={(v) => setField("positionY", v)}
            suffix="%"
          />
          <SliderRow
            label="Rotate"
            value={textParams.rotation}
            min={-180}
            max={180}
            onChange={(v) => setField("rotation", v)}
            suffix="°"
          />
          <SliderRow
            label="Spacing"
            value={textParams.letterSpacing}
            min={-20}
            max={50}
            onChange={(v) => setField("letterSpacing", v)}
            suffix="px"
          />
          <SliderRow
            label="Tilt X"
            value={textParams.skewX}
            min={-45}
            max={45}
            onChange={(v) => setField("skewX", v)}
            suffix="°"
          />
          <SliderRow
            label="Tilt Y"
            value={textParams.skewY}
            min={-45}
            max={45}
            onChange={(v) => setField("skewY", v)}
            suffix="°"
          />
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="space-y-2 pt-1">
        <ExportButton
          onExport={onExport}
          disabled={disabled}
          isExporting={isExporting}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={onNewImage}
          >
            New Image
          </Button>
        </div>
      </div>
    </div>
  );
}
