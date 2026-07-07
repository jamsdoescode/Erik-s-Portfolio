const ITEMS = [
  { title: "send pricing deck to marcus", meta: "YOU · TODAY", urgent: true },
  { title: "sarah — legal team intro", meta: "WAITING · FRI", urgent: false },
  { title: "review contract redlines", meta: "YOU · TOMORROW", urgent: false },
];

export function AppPreview() {
  return (
    <div className="overflow-hidden rounded-md border border-border-strong bg-background shadow-[0_2px_0_0_var(--border-strong),0_12px_32px_-8px_rgba(28,25,23,0.12)]">
      <div className="flex items-center justify-between border-b border-dashed border-border px-4 py-2.5 bg-surface">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          dashboard
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
          3 open
        </span>
      </div>
      <div className="p-4 space-y-0 divide-y divide-border">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                item.urgent ? "bg-accent" : "bg-border-strong"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-snug lowercase">{item.title}</p>
              <p className="font-mono text-[10px] tracking-wider text-muted mt-1">{item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
