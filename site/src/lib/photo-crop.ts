export type PhotoCropState = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export type PhotoFrame = {
  aspect: number;
  shape: "rounded" | "circle";
  outputWidth: number;
  outputHeight: number;
  previewWidth: number;
};

export const PHOTO_FRAMES = {
  home: {
    aspect: 4 / 5,
    shape: "rounded",
    outputWidth: 880,
    outputHeight: 1100,
    previewWidth: 220,
  },
  about: {
    aspect: 1,
    shape: "circle",
    outputWidth: 520,
    outputHeight: 520,
    previewWidth: 160,
  },
} as const satisfies Record<string, PhotoFrame>;

export function getFrameSize(frame: PhotoFrame) {
  return {
    width: frame.previewWidth,
    height: frame.previewWidth / frame.aspect,
  };
}

export function getBaseScale(naturalWidth: number, naturalHeight: number, frame: PhotoFrame) {
  const { width, height } = getFrameSize(frame);
  return Math.max(width / naturalWidth, height / naturalHeight);
}

export function clampPan(
  offsetX: number,
  offsetY: number,
  naturalWidth: number,
  naturalHeight: number,
  frame: PhotoFrame,
  zoom: number,
) {
  const { width, height } = getFrameSize(frame);
  const baseScale = getBaseScale(naturalWidth, naturalHeight, frame);
  const scale = baseScale * zoom;
  const displayW = naturalWidth * scale;
  const displayH = naturalHeight * scale;

  const maxX = Math.max(0, (displayW - width) / 2);
  const maxY = Math.max(0, (displayH - height) / 2);

  return {
    offsetX: Math.min(maxX, Math.max(-maxX, offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

export async function exportCroppedImage(
  image: HTMLImageElement,
  frame: PhotoFrame,
  crop: PhotoCropState,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = frame.outputWidth;
  canvas.height = frame.outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas");

  const { width, height } = getFrameSize(frame);
  const baseScale = getBaseScale(image.naturalWidth, image.naturalHeight, frame);
  const scale = baseScale * crop.zoom;
  const scaleX = frame.outputWidth / width;
  const scaleY = frame.outputHeight / height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(width / 2 + crop.offsetX, height / 2 + crop.offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2, image.naturalWidth, image.naturalHeight);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not export image"));
        else resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = src;
  });
}
