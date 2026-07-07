"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = "Login failed";
        try {
          const data = (await response.json()) as { error?: string };
          message = data.error || message;
        } catch {
          // Non-JSON error response (e.g. 500 HTML). Fall back to status text.
          message = response.statusText || message;
        }
        setError(message);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Network error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4 max-w-md">
      <div>
        <label className="admin-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="admin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="admin-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="admin-button" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
