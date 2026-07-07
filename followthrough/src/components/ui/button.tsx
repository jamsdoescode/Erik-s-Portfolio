import Link from "next/link";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

const variants = {
  primary:
    "bg-accent text-background hover:bg-accent-hover font-semibold active:scale-[0.98]",
  secondary:
    "bg-transparent text-foreground border border-border-strong hover:bg-surface active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-surface active:scale-[0.98]",
  danger:
    "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/15 active:scale-[0.98]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md transition-[transform,background-color,border-color,color] duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none",
    sizes[size],
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 group", className)}>
      <span className="flex h-5 w-5 shrink-0 -rotate-6 items-center justify-center rounded-[3px] bg-accent text-background">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
          <path
            d="M2.5 6.2L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[15px] font-bold tracking-[-0.02em] text-foreground lowercase">
        followthrough
      </span>
    </Link>
  );
}

export function StampCheck({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] bg-accent text-background",
        className
      )}
    >
      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden>
        <path
          d="M2 5.2L4.2 7.2L8 3.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
