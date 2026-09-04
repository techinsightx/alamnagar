"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  success: boolean;
  url?: string;
  type?: string;
  error?: string;
}

export async function uploadToCloudinary(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // File ko buffer mein convert karo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary par upload karo
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "alamnagar_posts",
          resource_type: "auto",
        },
        (error: Error | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Upload failed"));
        }
      ).end(buffer);
    });

    return { 
      success: true, 
      url: result.secure_url, 
      type: result.resource_type 
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return { success: false, error: "Upload failed" };
  }
}