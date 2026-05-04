import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let buffer: Buffer;
    let extension = "png";
    let contentTypeHeader = "image/png";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      const fileName = file.name;
      const fileExt = fileName.split('.').pop();
      if (fileExt) extension = fileExt;
      contentTypeHeader = file.type || "application/octet-stream";

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

      buffer = Buffer.from(matches[2], 'base64');
      contentTypeHeader = matches[1];

      if (matches[1] === 'image/jpeg') extension = 'jpg';
      else if (matches[1] === 'image/webp') extension = 'webp';
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const filename = `upload_${Date.now()}.${extension}`;

    if (isSupabaseConfigured()) {
      const { error } = await supabase.storage.from("uploads").upload(filename, buffer, {
        contentType: contentTypeHeader,
        upsert: false
      });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(filename);
      return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
    } else {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: imageUrl }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
