import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/image-placeholder";

type SitePhotoProps = {
  src?: string;
  alt: string;
  className?: string;
  variant?: "rounded" | "circle";
};

export function SitePhoto({ src, alt, className, variant = "rounded" }: SitePhotoProps) {
  if (!src) {
    return (
      <ImagePlaceholder
        aspect={variant === "circle" ? "square" : "portrait"}
        className={cn(
          variant === "circle" ? "site-photo-circle" : "site-photo-rounded",
          className,
        )}
        label={alt}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "object-cover",
        variant === "circle" ? "site-photo-circle" : "site-photo-rounded",
        className,
      )}
    />
  );
}
