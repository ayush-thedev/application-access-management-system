"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { Bell, CheckCircle2, XCircle, FileText, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  request_id: number | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "request_approved":
      return <CheckCircle2 className="size-4 text-green-500 shrink-0" />;
    case "request_rejected":
      return <XCircle className="size-4 text-red-500 shrink-0" />;
    case "request_submitted":
      return <FileText className="size-4 text-blue-500 shrink-0" />;
    default:
      return <Bell className="size-4 text-muted-foreground shrink-0" />;
  }
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        api.getNotifications(user.username),
        api.getUnreadCount(user.username),
      ]);
      setNotifications(notifs);
      setUnreadCount(count.count);
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [open, loadData]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.markAllAsRead(user.username);
      loadData();
    } catch {
      // silently fail
    }
  };

  const handleMarkRead = async (id: number) => {
    if (!user) return;
    try {
      await api.markAsRead(id, user.username);
      loadData();
    } catch {
      // silently fail
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex size-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 size-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="py-8">
              <Empty>
                <EmptyTitle>No notifications</EmptyTitle>
                <EmptyDescription>You're all caught up.</EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-200 cursor-pointer ${
                    n.is_read
                      ? "bg-background"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-background ring-1 ring-border">
                      <NotificationIcon type={n.type} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
