import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_ROLES = new Set(["event_uploader", "admin", "super_admin"]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // AuthN: must be signed in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AuthZ: must have an upload-capable role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !ALLOWED_ROLES.has(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer;
    let imageType: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      imageType = (file.type || "").toLowerCase();
      if (!ALLOWED_TYPES.has(imageType)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const base64Data = body.image;
      if (!base64Data) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid base64 format" }, { status: 400 });
      }
      imageType = matches[1].toLowerCase();
      if (!ALLOWED_TYPES.has(imageType)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
      }
      buffer = Buffer.from(matches[2], "base64");
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 413 });
    }

    const extension = EXT_BY_TYPE[imageType] || "png";
    const filename = `upload_${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("uploads").upload(filename, buffer, {
      contentType: imageType,
      upsert: false,
    });
    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(filename);
    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
