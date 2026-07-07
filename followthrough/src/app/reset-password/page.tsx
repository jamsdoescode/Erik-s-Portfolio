"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo, Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(184,72,31,0.08)]";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Request a new link from the forgot password page.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">Invalid reset link. Request a new one below.</p>
        <Link
          href="/forgot-password"
          className="block text-center text-xs text-accent underline underline-offset-2"
        >
          request reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
          placeholder="Min 8 characters"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Confirm password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          className={inputClass}
          placeholder="Repeat password"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Reset password"}
      </Button>

      <p className="text-center text-xs text-muted">
        <Link href="/login" className="text-accent underline underline-offset-2">
          back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              reset password
            </h1>
            <p className="text-sm text-muted mt-1">Choose a new password for your account</p>
          </div>

          <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
