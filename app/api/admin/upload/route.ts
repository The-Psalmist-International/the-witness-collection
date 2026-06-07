import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { uploadProductImage } from "@/app/lib/cloudinary/upload";
import { hasPermission } from "@/app/lib/admin/roles";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The image could not be uploaded to Cloudinary. Try again.";
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();

    if (!session.isAuthenticated) {
      return NextResponse.json(
        { error: "Your session has expired. Sign in again and retry the upload." },
        { status: 401 }
      );
    }

    if (session.mustResetPassword) {
      return NextResponse.json(
        { error: "Set a new password before uploading product images." },
        { status: 403 }
      );
    }

    if (!hasPermission(session.role, "products")) {
      return NextResponse.json(
        { error: "You do not have permission to upload product images." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image was selected. Choose a file and try again." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "This file type is not supported. Upload a JPG, PNG, WebP, or GIF image.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "This image is too large. Choose a file that is 5 MB or smaller." },
        { status: 400 }
      );
    }

    const uploadResult = await uploadProductImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      originalName: file.name,
    });

    return NextResponse.json({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (error) {
    console.error("Product image upload failed:", error);

    return NextResponse.json(
      {
        error: getUploadErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
