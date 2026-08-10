import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      upload_preset: "ml_default", // or leave empty if not required
      folder: "live-docs",
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Error uploading to Cloudinary" },
      { status: 500 }
    );
  }
}
