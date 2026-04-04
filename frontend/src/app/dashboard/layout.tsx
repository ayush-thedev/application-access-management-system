"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
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
    } else if (user.role === "admin" && pathname === "/dashboard") {
      router.push("/admin");
    }
  }, [user, pathname, router]);

  if (!user) return null;

  return (
    <DashboardShell variant="dashboard">
      {children}
    </DashboardShell>
  );
}
