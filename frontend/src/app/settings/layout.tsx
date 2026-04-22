"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, pathname, router]);

  if (!user) return null;

  return (
    <DashboardShell variant={user.role === "admin" ? "admin" : "dashboard"}>
      {children}
    </DashboardShell>
  );
}
