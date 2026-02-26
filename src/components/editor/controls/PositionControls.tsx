"use client";

import { TextOverlayParams } from "@/types/editor";
import { SliderField } from "./SliderField";
import { MoveHorizontal, MoveVertical, RotateCw } from "lucide-react";

interface PositionControlsProps {
  textParams: TextOverlayParams;
  setField: <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => void;
}

export function PositionControls({
  textParams,
  setField,
}: PositionControlsProps) {
  return (
    <div className="space-y-4">
      <SliderField
        label="X Position"
        icon={<MoveHorizontal className="h-3 w-3" />}
        value={textParams.positionX}
        min={0}
        max={100}
        onChange={(v) => setField("positionX", v)}
        suffix="%"
      />

      <SliderField
        label="Y Position"
        icon={<MoveVertical className="h-3 w-3" />}
        value={textParams.positionY}
        min={0}
        max={100}
        onChange={(v) => setField("positionY", v)}
        suffix="%"
      />

      <SliderField
        label="Rotation"
        icon={<RotateCw className="h-3 w-3" />}
        value={textParams.rotation}
        min={-180}
        max={180}
        onChange={(v) => setField("rotation", v)}
        suffix="°"
      />
    </div>
  );
}
