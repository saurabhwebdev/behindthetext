"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ReactNode } from "react";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  icon?: ReactNode;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  icon,
}: SliderFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon && <span className="text-foreground/60">{icon}</span>}
          {label}
        </Label>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs tabular-nums text-foreground">
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
