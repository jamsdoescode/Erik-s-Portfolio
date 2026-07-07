import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            relay
          </Link>
          <p className="text-sm text-muted">Sign in to your workspace</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
