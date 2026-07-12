"use client";

import { useSyncExternalStore, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export interface AppNotification {
  id: string;
  type:
    | "comment_on_article"
    | "reply_to_comment"
    | "new_article_author"
    | "new_article_section";
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const READ_KEY = "expers-notifications-read";
const LAST_OPEN_KEY = "expers-notifications-last-open";

interface ServerNotification {
  id: string;
  type: AppNotification["type"];
  message: string;
  link: string;
  createdAt: string;
}

let serverNotifs: ServerNotification[] = [];
let readIds: Set<string> = loadReadIds();

const listeners = new Set<() => void>();

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) return new Set<string>(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

function persistReadIds() {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_KEY, JSON.stringify([...readIds]));
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

let snapshotCache: AppNotification[] | null = null;

function buildSnapshot(): AppNotification[] {
  return serverNotifs.map((n) => ({ ...n, read: readIds.has(n.id) }));
}

function getSnapshot(): AppNotification[] {
  if (snapshotCache === null) snapshotCache = buildSnapshot();
  return snapshotCache;
}

const serverEmpty: AppNotification[] = [];
function getServerSnapshot(): AppNotification[] {
  return serverEmpty;
}

function invalidate() {
  snapshotCache = null;
  notify();
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetchNotifications() {
  const token = getToken();
  if (!token) {
    serverNotifs = [];
    invalidate();
    return;
  }
  try {
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      serverNotifs = data.notifications ?? [];
      invalidate();
    }
  } catch {
    // keep previous
  }
}

export function useNotifications() {
  const { expert } = useAuth();

  const notifications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    fetchNotifications();
  }, [expert]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    readIds.add(id);
    persistReadIds();
    invalidate();
  }, []);

  const markAllAsRead = useCallback(() => {
    for (const n of serverNotifs) readIds.add(n.id);
    persistReadIds();
    invalidate();
  }, []);

  const markOpened = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_OPEN_KEY, new Date().toISOString());
    }
  }, []);

  return {
    notifications,
    unreadCount,
    refresh,
    markAsRead,
    markAllAsRead,
    markOpened,
  };
}
