"use client";

import { useState, type ReactNode } from "react";

type AccountSettingsRowProps = {
  label: string;
  description?: string;
  value: ReactNode;
  editContent?: ReactNode;
  defaultOpen?: boolean;
};

export function AccountSettingsRow({
  label,
  description,
  value,
  editContent,
  defaultOpen = false,
}: AccountSettingsRowProps) {
  const [isEditing, setIsEditing] = useState(defaultOpen);

  return (
    <div className="border-b border-dashed border-neutral-200 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-black">{label}</p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              {description}
            </p>
          ) : null}
          {!isEditing ? (
            <div className="mt-3 text-sm text-neutral-700">{value}</div>
          ) : null}
        </div>
        {editContent ? (
          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-purple-950 hover:text-purple-950"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        ) : null}
      </div>
      {isEditing && editContent ? (
        <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
          {editContent}
        </div>
      ) : null}
    </div>
  );
}
