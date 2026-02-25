"use client";

import { useReducer } from "react";
import { TextOverlayParams } from "@/types/editor";
import { DEFAULT_TEXT_PARAMS } from "@/lib/constants";

type TextAction =
  | { type: "SET_FIELD"; field: keyof TextOverlayParams; value: TextOverlayParams[keyof TextOverlayParams] }
  | { type: "RESET" };

function textReducer(
  state: TextOverlayParams,
  action: TextAction
): TextOverlayParams {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return DEFAULT_TEXT_PARAMS;
    default:
      return state;
  }
}

export function useTextOverlayState() {
  const [textParams, dispatch] = useReducer(textReducer, DEFAULT_TEXT_PARAMS);

  const setField = <K extends keyof TextOverlayParams>(
    field: K,
    value: TextOverlayParams[K]
  ) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const reset = () => dispatch({ type: "RESET" });

  return { textParams, setField, reset };
}
