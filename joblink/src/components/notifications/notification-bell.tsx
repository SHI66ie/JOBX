"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Notification03Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  SparklesIcon,
  Briefcase01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import {
  actionGetNotifications,
  actionMarkAsRead,
  actionMarkAllAsRead,
  type NotificationRecord,
} from "@/app/actions/notifications";
import { createClient } from "@/utils/supabase/client";
import { postedAgo } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await actionGetNotifications();
      if (mounted) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
        setIsLoading(false);
      }
    }
    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Supabase Realtime listener for live updates
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationRecord;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleMarkAllRead() {
    startTransition(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await actionMarkAllAsRead();
    });
  }

  function handleNotificationClick(notif: NotificationRecord) {
    if (!notif.read) {
      startTransition(async () => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        await actionMarkAsRead(notif.id);
      });
    }
    setOpen(false);
  }

  function getNotificationIcon(type: string, title: string) {
    const lower = `${type} ${title}`.toLowerCase();
    if (lower.includes("accept") || lower.includes("hire")) {
      return <Icon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600" />;
    }
    if (lower.includes("reject") || lower.includes("decline")) {
      return <Icon icon={Cancel01Icon} size={18} className="text-neutral-400" />;
    }
    if (lower.includes("interview")) {
      return <Icon icon={SparklesIcon} size={18} className="text-violet-600" />;
    }
    if (lower.includes("review") || lower.includes("application")) {
      return <Icon icon={Briefcase01Icon} size={18} className="text-sky-600" />;
    }
    return <Icon icon={Notification03Icon} size={18} className="text-brand" />;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex size-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Icon icon={Notification03Icon} size={20} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10.5px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface p-2 text-neutral-800 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-[14.5px] font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline"
              >
                <Icon icon={Tick02Icon} size={13} />
                Mark all read
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-[380px] divide-y divide-neutral-100 overflow-y-auto py-1">
            {isLoading ? (
              <div className="py-8 text-center text-[13px] text-neutral-400">
                Loading updates...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.type.includes("employer") ? "/employer/applicants" : "/dashboard/applications"}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50",
                    !item.read && "bg-brand/[0.03]"
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    {getNotificationIcon(item.type, item.title)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-[13.5px]", !item.read ? "font-semibold text-neutral-900" : "font-medium text-neutral-700")}>
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11.5px] text-neutral-400">
                        {postedAgo(item.created_at)}
                      </span>
                    </div>
                    {item.message ? (
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-5 text-neutral-500">
                        {item.message}
                      </p>
                    ) : null}
                  </div>
                  {!item.read ? (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <Icon icon={Notification03Icon} size={20} />
                </div>
                <p className="mt-3 text-[14px] font-medium text-neutral-800">No notifications</p>
                <p className="mt-1 max-w-[200px] text-[12.5px] text-neutral-500">
                  You&apos;re all caught up! Updates about applications will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
