"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdminLayout({
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
    } else if (user.role !== "admin" && pathname === "/admin") {
      router.push("/dashboard");
    }
  }, [user, pathname, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <DashboardShell variant="admin">
      {children}
    </DashboardShell>
  );
}
