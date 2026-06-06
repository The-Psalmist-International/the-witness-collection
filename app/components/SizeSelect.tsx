"use client";

import { ChevronPair } from "@/app/components/ChevronPair";

type SizeSelectProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  "aria-label"?: string;
};

export function SizeSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel = "Select size",
}: SizeSelectProps) {
  return (
    <div className="relative inline-flex min-w-[5.5rem]">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full cursor-pointer appearance-none rounded-md border border-neutral-200 bg-white py-0 pl-3 pr-8 text-xs font-medium text-black outline-none transition-colors hover:border-neutral-300 focus:border-black"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <ChevronPair />
    </div>
  );
}
