import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let buffer: Buffer;
    let extension = "png";

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

    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      const base64Data = body.image; // Expects "data:image/png;base64,iVBORw0KGgo..."
      
      if (!base64Data) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }
      
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid base64 format" }, { status: 400 });
      }
      
      buffer = Buffer.from(matches[2], 'base64');
      
      if (matches[1] === 'image/jpeg') extension = 'jpg';
      else if (matches[1] === 'image/webp') extension = 'webp';
      // defaults to png
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `upload_${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, filename);
    
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: imageUrl }, { status: 201 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
