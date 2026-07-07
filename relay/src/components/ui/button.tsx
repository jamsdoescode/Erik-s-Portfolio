import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-900/10",
  secondary:
    "bg-surface border border-border text-foreground hover:bg-stone-50 active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-stone-100 active:scale-[0.98]",
  danger: "bg-danger text-white hover:bg-red-700 active:scale-[0.98]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
