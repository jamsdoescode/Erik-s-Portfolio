"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(184,72,31,0.08)]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setMessage(data.message);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-lg items-center px-5">
          <Logo />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold lowercase tracking-tight">
              forgot password
            </h1>
            <p className="text-sm text-muted mt-1">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>

          {message ? (
            <div className="space-y-4">
              <p className="text-sm text-success">{message}</p>
              <Link
                href="/login"
                className="block text-center text-xs text-accent underline underline-offset-2"
              >
                back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@company.com"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-xs text-muted">
                <Link href="/login" className="text-accent underline underline-offset-2">
                  back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
