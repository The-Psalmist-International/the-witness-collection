"use client";

import { useState } from "react";

type ColorPickerProps = {
  value: { name: string; hex: string }[];
  onChange: (colors: { name: string; hex: string }[]) => void;
};

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFD700" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Grey", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
];

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b };
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  const addColor = () => {
    const name = colorName.trim();
    if (!name) return;
    if (value.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    onChange([...value, { name, hex: colorHex }]);
    setColorName("");
    setColorHex("#000000");
  };

  const removeColor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="colors" value={JSON.stringify(value)} />
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="e.g. Midnight Blue"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor();
              }
            }}
            className="h-10 flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
          <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-neutral-200">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="absolute -inset-1 h-12 w-12 cursor-pointer opacity-0"
            />
            <span
              className="block h-full w-full"
              style={{ backgroundColor: colorHex }}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addColor}
          disabled={!colorName.trim()}
          className="pressable shrink-0 rounded-md bg-purple-950 px-3 text-sm font-medium text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((preset) => {
          const isSelected = value.some(
            (c) => c.hex.toLowerCase() === preset.hex.toLowerCase()
          );
          return (
            <button
              key={preset.hex}
              type="button"
              title={`${preset.name}${isSelected ? " (added)" : ""}`}
              onClick={() => {
                if (!isSelected) {
                  onChange([...value, { ...preset }]);
                }
              }}
              disabled={isSelected}
              className={`pressable relative h-7 w-7 rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-purple-950 opacity-50"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <span
                className="block h-full w-full rounded-full"
                style={{ backgroundColor: preset.hex }}
              />
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {value.map((color, index) => {
            const rgb = hexToRgb(color.hex);
            const isDark = rgb ? luminance(rgb.r, rgb.g, rgb.b) < 0.5 : true;
            return (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium"
              >
                <span
                  className="inline-block h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
                <span
                  className={
                    isDark ? "text-black" : "text-black"
                  }
                >
                  {color.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="pressable ml-0.5 text-neutral-400 hover:text-black"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
