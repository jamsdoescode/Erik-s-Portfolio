import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { PageCopy } from "@/lib/page-copy";
import type { ReadingItem } from "@/lib/content";

type ReadingListProps = {
  items: ReadingItem[];
  labels: PageCopy["reading"];
};

export function ReadingCoverGrid({ items, labels }: ReadingListProps) {
  if (items.length === 0) {
    return <p className="empty-state">{labels.empty}</p>;
  }

  const statusLabels: Record<ReadingItem["status"], string> = {
    reading: labels.statusReading,
    finished: labels.statusFinished,
    queue: labels.statusQueue,
  };

  const grouped = {
    reading: items.filter((item) => item.status === "reading"),
    finished: items.filter((item) => item.status === "finished"),
    queue: items.filter((item) => item.status === "queue"),
  };

  return (
    <div className="reading-list">
      {(Object.keys(grouped) as ReadingItem["status"][]).map((status) => {
        const groupItems = grouped[status];
        if (groupItems.length === 0) return null;

        return (
          <section key={status} className="reading-group">
            <h2 className="reading-group-label">{statusLabels[status]}</h2>
            <ul className="reading-rows">
              {groupItems.map((item) => (
                <li key={item.id} className="reading-row">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reading-row-link"
                    >
                      <div className="reading-row-main">
                        <h3 className="reading-row-title">
                          {item.title}
                          <ArrowUpRight size={12} className="reading-row-icon" />
                        </h3>
                        {item.author && <p className="reading-row-author">{item.author}</p>}
                        {item.note && <p className="reading-row-note">{item.note}</p>}
                      </div>
                      <span className="reading-row-status">{statusLabels[status]}</span>
                    </a>
                  ) : (
                    <>
                      <div className="reading-row-main">
                        <h3 className="reading-row-title">{item.title}</h3>
                        {item.author && <p className="reading-row-author">{item.author}</p>}
                        {item.note && <p className="reading-row-note">{item.note}</p>}
                      </div>
                      <span className="reading-row-status">{statusLabels[status]}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
