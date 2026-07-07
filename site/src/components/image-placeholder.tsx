import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  className?: string;
  aspect?: "wide" | "square" | "portrait" | "hero" | "cover";
  label?: string;
};

const aspectClasses = {
  wide: "aspect-[16/10]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  hero: "aspect-[21/9]",
  cover: "aspect-[2/3]",
};

export function ImagePlaceholder({
  className,
  aspect = "wide",
  label,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "image-placeholder relative overflow-hidden",
        aspectClasses[aspect],
        className,
      )}
      aria-hidden={!label}
      aria-label={label}
    >
    </div>
  );
}
