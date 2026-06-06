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
  const session = await verifyAdminSession();

  if (
    !session.isAuthenticated ||
    session.mustResetPassword ||
    !hasPermission(session.role, "products")
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Upload a JPG, PNG, WebP, or GIF image." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller." },
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
}
