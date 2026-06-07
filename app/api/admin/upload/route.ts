import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/app/lib/admin/auth";
import { hasPermission } from "@/app/lib/admin/roles";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;

function getExtension(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  return mimeType.split("/")[1] ?? "bin";
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

    const extension = getExtension(file.type);
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(
      path.join(uploadDir, filename),
      Buffer.from(await file.arrayBuffer())
    );

    return NextResponse.json({
      url: `/uploads/products/${filename}`,
    });
  } catch (error) {
    console.error("Product image upload failed:", error);

    return NextResponse.json(
      {
        error:
          "The server could not save your image. Try again or choose a smaller file.",
      },
      { status: 500 }
    );
  }
}
