"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  FileText,
  Newspaper,
} from "lucide-react";
import {
  useNotifications,
  type AppNotification,
} from "@/lib/use-notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  switch (type) {
    case "comment_on_article":
    case "reply_to_comment":
      return <MessageSquare className="h-4 w-4 shrink-0 text-[#3498DB]" />;
    case "new_article_author":
      return <FileText className="h-4 w-4 shrink-0 text-[#1ABC9C]" />;
    case "new_article_section":
      return <Newspaper className="h-4 w-4 shrink-0 text-[#27AE60]" />;
  }
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    refresh,
    markAsRead,
    markAllAsRead,
    markOpened,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      markOpened();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, markOpened]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      markOpened();
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#2C3E50] transition-colors"
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-lg z-50 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#2C3E50]">
              Уведомления
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[#3498DB] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Прочитать всё
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="h-8 w-8 mb-2" />
                <p className="text-sm">Нет уведомлений</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.link}
                      onClick={() => {
                        markAsRead(n.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                        !n.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="mt-0.5">
                        <NotificationIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            !n.read
                              ? "font-medium text-[#2C3E50]"
                              : "text-gray-600"
                          )}
                        >
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3498DB]" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
