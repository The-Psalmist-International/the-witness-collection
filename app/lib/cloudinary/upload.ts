import {
  CLOUDINARY_UPLOAD_PRESET,
  getCloudinaryUploadUrl,
} from "@/app/lib/cloudinary/config";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  error?: { message?: string };
};

type UploadProductImageOptions = {
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
};

export async function uploadCloudinaryFile({
  buffer,
  mimeType,
  originalName = "upload.jpg",
}: UploadProductImageOptions) {
  const body = new FormData();
  const blob = new Blob([Uint8Array.from(buffer)], { type: mimeType });

  body.append("file", blob, originalName);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: "POST",
    body,
  });

  const rawBody = await response.text();
  let result: CloudinaryUploadResponse = {};

  if (rawBody.trim()) {
    try {
      result = JSON.parse(rawBody) as CloudinaryUploadResponse;
    } catch {
      throw new Error("Cloudinary returned an invalid response. Try again.");
    }
  }

  if (!response.ok || !result.secure_url) {
    throw new Error(
      result.error?.message ||
        "Cloudinary could not upload this image. Check the file and try again."
    );
  }

  return {
    url: result.secure_url,
    publicId: result.public_id ?? "",
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    mimeType,
  };
}

export async function uploadProductImage(options: UploadProductImageOptions) {
  return uploadCloudinaryFile({
    ...options,
    originalName: options.originalName ?? "product-image.jpg",
  });
}

export async function uploadPaymentProof(options: UploadProductImageOptions) {
  return uploadCloudinaryFile({
    ...options,
    originalName: options.originalName ?? "payment-proof.jpg",
  });
}
