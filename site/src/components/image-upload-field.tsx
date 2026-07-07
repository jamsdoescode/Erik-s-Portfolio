"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoCropEditor } from "@/components/photo-crop-editor";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  purpose: "home" | "about";
};

export function ImageUploadField({ label, value, onChange, purpose }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function openCropper(src: string, revokePrevious = false) {
    if (revokePrevious && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setCropSrc(src);
    setUploadError("");
  }

  function closeCropper() {
    setCropSrc(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  async function uploadFile(file: File): Promise<boolean> {
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      let data: { url?: string; error?: string } = {};
      try {
        data = (await response.json()) as { url?: string; error?: string };
      } catch {
        // Non-JSON error response (e.g. 500 HTML).
      }

      if (!response.ok) {
        setUploadError(data.error || response.statusText || "Upload failed");
        return false;
      }

      if (data.url) onChange(data.url);
      closeCropper();
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Upload failed. Check your connection and try again.";
      setUploadError(message);
      return false;
    } finally {
      setUploading(false);
    }
  }

  function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    openCropper(objectUrl);
    event.target.value = "";
  }

  async function onCropConfirm(file: File) {
    return uploadFile(file);
  }

  const previewClass =
    purpose === "about" ? "admin-upload-preview admin-upload-preview-circle" : "admin-upload-preview admin-upload-preview-home";

  return (
    <>
      <div className="admin-upload-field">
        <label className="admin-label">{label}</label>

        <div className="admin-upload-row">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={previewClass} />
          ) : (
            <div className={`${previewClass} admin-upload-preview-empty`}>No image</div>
          )}

          <div className="admin-upload-actions">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onFileSelect}
              disabled={uploading}
            />
            <button
              type="button"
              className="admin-button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Saving..." : value ? "Replace image" : "Upload image"}
            </button>
            {value && (
              <>
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => openCropper(value)}
                  disabled={uploading}
                >
                  Adjust crop
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => onChange("")}
                  disabled={uploading}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>

        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

        <div className="mt-2">
          <label className="admin-label text-xs">Or paste URL</label>
          <input
            className="admin-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/home.jpg"
          />
        </div>
      </div>

      {cropSrc && (
        <PhotoCropEditor
          src={cropSrc}
          purpose={purpose}
          onConfirm={onCropConfirm}
          onCancel={closeCropper}
        />
      )}
    </>
  );
}
