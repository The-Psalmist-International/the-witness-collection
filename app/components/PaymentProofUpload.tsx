"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

const ACCEPT_ATTRIBUTE =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

type PaymentProofUploadProps = {
  id?: string;
  name?: string;
  error?: string;
};

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function assignFileToInput(input: HTMLInputElement, file: File | null) {
  const dataTransfer = new DataTransfer();

  if (file) {
    dataTransfer.items.add(file);
  }

  input.files = dataTransfer.files;
}

export function PaymentProofUpload({
  id = "paymentProof",
  name = "paymentProof",
  error,
}: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setFile = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setLocalError("");
      if (inputRef.current) {
        assignFileToInput(inputRef.current, null);
      }
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
      setLocalError("Use a JPG, PNG, WEBP, GIF, or PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError("File must be 5 MB or smaller.");
      return;
    }

    setLocalError("");
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    if (inputRef.current) {
      assignFileToInput(inputRef.current, file);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    setFile(file);
  };

  const displayError = error || localError;
  const isPdf = selectedFile?.type === "application/pdf";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
        Proof of payment
      </span>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        required={!selectedFile}
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={handleInputChange}
      />

      {selectedFile ? (
        <div
          className={`overflow-hidden rounded-xl border bg-white ${
            displayError ? "border-red-200" : "border-neutral-200"
          }`}
        >
          {previewUrl && !isPdf ? (
            <div className="relative h-44 w-full bg-neutral-100">
              <Image
                src={previewUrl}
                alt="Payment proof preview"
                fill
                sizes="400px"
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center bg-purple-50/60 text-purple-950">
              <DocumentIcon />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-black">
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {isPdf ? "PDF document" : "Image"} ·{" "}
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="pressable shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:border-black"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`pressable flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
            isDragging
              ? "border-purple-950 bg-purple-50/70"
              : displayError
                ? "border-red-200 bg-red-50/40 hover:border-red-300"
                : "border-neutral-200 bg-neutral-50/80 hover:border-purple-950 hover:bg-purple-50/40"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-950 text-white">
            <UploadIcon />
          </span>
          <span className="text-sm font-medium text-black">
            Tap to upload payment proof
          </span>
          <span className="max-w-xs text-xs leading-5 text-neutral-500">
            Drag and drop a screenshot or receipt here, or browse your files
          </span>
          <span className="text-[11px] uppercase tracking-widest text-neutral-400">
            JPG · PNG · WEBP · GIF · PDF · 5 MB max
          </span>
        </button>
      )}

      {displayError ? (
        <p className="text-xs text-red-600">{displayError}</p>
      ) : (
        <p className="text-xs text-neutral-500">
          Upload a clear screenshot or photo of your payment confirmation.
        </p>
      )}
    </div>
  );
}
