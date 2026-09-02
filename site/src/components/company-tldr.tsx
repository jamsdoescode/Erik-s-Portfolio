"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const TLDR_LINKS = [
  { label: "email me", href: "mailto:ekeitz@colgate.edu", primary: true },
  { label: "linkedin", href: "https://linkedin.com/in/erik-keitz", primary: false },
] as const;

type CompanyTldrProps = {
  slug: string;
  talkingPoints: string[];
};

function tldrStorageKey(slug: string) {
  return `company-tldr:${slug}`;
}

export function CompanyTldr({ slug, talkingPoints }: CompanyTldrProps) {
  const dialogId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    if (talkingPoints.length === 0) return;

    const key = tldrStorageKey(slug);
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");
    setIsOpen(true);
  }, [slug, talkingPoints.length]);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  if (talkingPoints.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className="company-tldr-btn"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
      >
        TL;DR
      </button>

      {isOpen && (
        <div
          className="company-tldr-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            id={dialogId}
            className="company-tldr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
          >
            <div className="company-tldr-modal-header">
              <h2 id={`${dialogId}-title`}>TL;DR</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="company-tldr-modal-close"
                onClick={close}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <ul className="company-tldr-modal-list">
              {talkingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="company-tldr-modal-actions">
              {TLDR_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`company-tldr-modal-btn ${link.primary ? "company-tldr-modal-btn-primary" : ""}`}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </a>
              ))}
              <button type="button" className="company-tldr-modal-btn" onClick={close}>
                read the full page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
