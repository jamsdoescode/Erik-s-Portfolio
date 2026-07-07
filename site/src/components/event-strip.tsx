type EventStripProps = {
  items: string[];
};

export function EventStrip({ items }: EventStripProps) {
  return (
    <section className="event-strip">
      <div className="event-strip-inner">
        <p className="section-kicker pt-1">Now</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <div key={item} className="min-w-0">
              <p className="font-display text-lg leading-snug text-ink">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
