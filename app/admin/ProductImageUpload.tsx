"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminButton } from "@/app/admin/AdminButton";
import { CloudUploadIcon, TrashIcon } from "@/app/admin/AdminIcons";
import { useToast } from "@/app/components/toast/toast-context";

type ProductImageUploadProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultUrl?: string;
};

type UploadResponse = {
  url?: string;
  error?: string;
};

async function readUploadResponse(response: Response): Promise<UploadResponse> {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as UploadResponse;
  } catch {
    return {};
  }
}

function getUploadErrorMessage(response: Response, data: UploadResponse) {
  if (data.error) {
    return data.error;
  }

  switch (response.status) {
    case 401:
      return "Your session has expired. Sign in again and retry the upload.";
    case 403:
      return "You do not have permission to upload product images.";
    case 400:
      return "The selected file is not valid. Use a JPG, PNG, WebP, or GIF under 5 MB.";
    case 413:
      return "This image is too large. Choose a file that is 5 MB or smaller.";
    case 500:
      return "The server could not save your image. Try again in a moment.";
    default:
      return response.ok
        ? "The upload response was incomplete. Try uploading the image again."
        : `The upload could not be completed (error ${response.status}). Try again.`;
  }
}

export function ProductImageUpload({
  id,
  name,
  label,
  required = false,
  defaultUrl = "",
}: ProductImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(defaultUrl);
  const [uploading, setUploading] = useState(false);

  const showUploadError = (description: string) => {
    toast({
      variant: "error",
      title: "Image upload failed",
      description,
      duration: 7000,
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await readUploadResponse(response);

      if (!response.ok || !data.url) {
        throw new Error(getUploadErrorMessage(response, data));
      }

      setImageUrl(data.url);
    } catch (uploadError) {
      setImageUrl("");

      if (uploadError instanceof TypeError) {
        showUploadError(
          "Could not reach the server. Check your internet connection and try again."
        );
        return;
      }

      showUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-widest text-neutral-500"
      >
        {label}
      </label>

      <input type="hidden" name={name} value={imageUrl} required={required} />

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void handleFileChange(file);
          event.target.value = "";
        }}
      />

      {imageUrl ? (
        <div className="relative w-full overflow-hidden rounded-md border border-neutral-200">
          <div className="relative h-40 w-full bg-neutral-100">
            <Image
              src={imageUrl}
              alt={`${label} preview`}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
            <p className="truncate text-xs text-neutral-500">{imageUrl}</p>
            <AdminButton
              variant="ghost"
              className="h-9 shrink-0 px-3 text-xs"
              icon={<TrashIcon className="h-3.5 w-3.5" />}
              onClick={() => setImageUrl("")}
            >
              Remove
            </AdminButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-36 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center transition-colors hover:border-purple-950 hover:bg-purple-50/40 disabled:cursor-not-allowed"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-950">
            <CloudUploadIcon />
          </span>
          <span className="text-sm font-medium text-neutral-700">
            {uploading ? "Uploading image..." : "Choose an image to upload"}
          </span>
          <span className="text-xs text-neutral-400">
            JPG, PNG, WebP, or GIF up to 5 MB
          </span>
        </button>
      )}
    </div>
  );
}
