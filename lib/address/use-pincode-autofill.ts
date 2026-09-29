"use client";

import * as React from "react";
import { lookupIndianPincode } from "./lookup-pincode";

/**
 * When `pincode` is 6 digits, looks up city/state (debounced).
 * Also exposes `lookupNow()` for onBlur — useful if the effect was skipped (e.g. strict mode / enabled toggle).
 */
export function usePincodeAutofill(
  pincode: string,
  onFill: (state: string, city: string) => void,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;
  const onFillRef = React.useRef(onFill);
  onFillRef.current = onFill;
  const lastFilledPinRef = React.useRef("");
  const inFlightRef = React.useRef(false);

  const applyLookup = React.useCallback(async (pin: string, force = false) => {
    const clean = pin.replace(/\D/g, "");
    if (clean.length !== 6) return false;
    if (!force && lastFilledPinRef.current === clean) return true;
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    try {
      const result = await lookupIndianPincode(clean);
      if (!result) return false;
      lastFilledPinRef.current = clean;
      onFillRef.current(result.state, result.city);
      return true;
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const lookupNow = React.useCallback(
    () => applyLookup(String(pincode || ""), true),
    [pincode, applyLookup]
  );

  React.useEffect(() => {
    if (!enabled) return;
    const pin = String(pincode || "").replace(/\D/g, "");
    if (pin.length !== 6) {
      lastFilledPinRef.current = "";
      return;
    }
    if (lastFilledPinRef.current === pin) return;

    const timer = window.setTimeout(() => {
      void applyLookup(pin);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [pincode, enabled, applyLookup]);

  return { lookupNow };
}
