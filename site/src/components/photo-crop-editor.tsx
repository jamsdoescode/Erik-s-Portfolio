"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PHOTO_FRAMES,
  clampPan,
  exportCroppedImage,
  getBaseScale,
  getFrameSize,
  loadImage,
  type PhotoCropState,
} from "@/lib/photo-crop";

type PhotoCropEditorProps = {
  src: string;
  purpose: "home" | "about";
  onConfirm: (file: File) => Promise<boolean>;
  onCancel: () => void;
};

export function PhotoCropEditor({ src, purpose, onConfirm, onCancel }: PhotoCropEditorProps) {
  const frame = PHOTO_FRAMES[purpose];
  const frameSize = getFrameSize(frame);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PhotoCropState>({ offsetX: 0, offsetY: 0, zoom: 1 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    let active = true;
    loadImage(src)
      .then((loaded) => {
        if (active) setImage(loaded);
      })
      .catch(() => {
        if (active) setError("Could not load image for cropping.");
      });
    return () => {
      active = false;
    };
  }, [src]);

  const updateCrop = useCallback(
    (next: Partial<PhotoCropState>) => {
      if (!image) return;
      setCrop((current) => {
        const merged = { ...current, ...next };
        const clamped = clampPan(
          merged.offsetX,
          merged.offsetY,
          image.naturalWidth,
          image.naturalHeight,
          frame,
          merged.zoom,
        );
        return { ...merged, ...clamped };
      });
    },
    [frame, image],
  );

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: crop.offsetX,
      offsetY: crop.offsetY,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    updateCrop({
      offsetX: dragStart.current.offsetX + (event.clientX - dragStart.current.x),
      offsetY: dragStart.current.offsetY + (event.clientY - dragStart.current.y),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function onSave() {
    if (!image) return;
    setSaving(true);
    setError("");

    try {
      const blob = await exportCroppedImage(image, frame, crop);
      const file = new File([blob], `${purpose}-photo.jpg`, { type: "image/jpeg" });
      const ok = await onConfirm(file);
      if (!ok) setError("Upload failed. Try again.");
    } catch {
      setError("Could not save cropped image.");
    } finally {
      setSaving(false);
    }
  }

  const baseScale = image ? getBaseScale(image.naturalWidth, image.naturalHeight, frame) : 1;
  const displayScale = baseScale * crop.zoom;
  const displayWidth = image ? image.naturalWidth * displayScale : 0;
  const displayHeight = image ? image.naturalHeight * displayScale : 0;

  return (
    <div className="photo-crop-overlay" role="dialog" aria-modal="true" aria-label="Adjust photo crop">
      <div className="photo-crop-panel admin-card">
        <div className="photo-crop-header">
          <div>
            <h3 className="font-medium">Adjust crop</h3>
            <p className="text-sm text-muted mt-1">
              Drag to reposition. This preview matches how the photo appears on your site.
            </p>
          </div>
          <button type="button" className="admin-button admin-button-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        </div>

        <div className="photo-crop-stage">
          <div
            className={`photo-crop-frame photo-crop-frame-${frame.shape}`}
            style={{ width: frameSize.width, height: frameSize.height }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                draggable={false}
                className="photo-crop-image"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px))`,
                }}
              />
            )}
          </div>
        </div>

        <div className="photo-crop-controls">
          <label className="admin-label" htmlFor={`zoom-${purpose}`}>
            Zoom
          </label>
          <input
            id={`zoom-${purpose}`}
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={crop.zoom}
            onChange={(e) => updateCrop({ zoom: Number(e.target.value) })}
            disabled={!image || saving}
            className="photo-crop-slider"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="button" className="admin-button" onClick={onSave} disabled={!image || saving}>
          {saving ? "Saving..." : "Use this crop"}
        </button>
      </div>
    </div>
  );
}
