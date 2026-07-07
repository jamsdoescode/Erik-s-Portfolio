"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)]";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, name };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push(
      mode === "register"
        ? "/app/onboarding"
        : data.user?.onboarded
          ? "/app"
          : "/app/onboarding"
    );
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="Alex Chen"
          />
        </div>
      )}
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
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
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

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Start free trial"}
      </Button>

      <p className="text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-accent underline underline-offset-2">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Have an account?{" "}
            <Link href="/login" className="text-accent underline underline-offset-2">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
