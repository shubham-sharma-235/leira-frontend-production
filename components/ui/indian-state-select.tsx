"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { INDIAN_STATES_AND_UTS } from "@/lib/address/india-states";

type IndianStateSelectProps = {
  value: string;
  onChange: (state: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
};

export function IndianStateSelect({
  value,
  onChange,
  disabled,
  id,
  className,
  "aria-label": ariaLabel = "State",
}: IndianStateSelectProps) {
  const inList = INDIAN_STATES_AND_UTS.includes(value);
  const selectValue = inList ? value : value ? value : "";

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      value={selectValue}
      onChange={(e) => onChange(e.target.value)}
      className={cn(className)}
    >
      <option value="">Select state</option>
      {value && !inList ? (
        <option value={value}>{value}</option>
      ) : null}
      {INDIAN_STATES_AND_UTS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
