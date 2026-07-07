import { mkdir, writeFile } from "fs/promises";
import path from "node:path";

type StoreImageInput = {
  filename: string;
  bytes: Buffer;
  contentType: string;
};

export async function storeImage({ filename, bytes, contentType }: StoreImageInput): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, bytes, {
      access: "public",
      contentType,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Image uploads require Vercel Blob. In the Vercel dashboard, open Storage, create a Blob store, and connect it to this project.",
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
