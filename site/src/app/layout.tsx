import type { Metadata } from "next";
import "./globals.css";
import "./color-splash.css";

export const metadata: Metadata = {
  title: {
    default: "Erik",
    template: "%s — Erik",
  },
  description: "Personal site",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
