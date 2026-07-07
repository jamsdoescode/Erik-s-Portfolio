"use client";

import { usePathname } from "next/navigation";
import { AdminPanelShell } from "@/components/admin-panel-shell";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminPanelShell>{children}</AdminPanelShell>;
}
