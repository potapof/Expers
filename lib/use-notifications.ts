"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAllReaderArticles } from "@/lib/reader-data";

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

const STORAGE_KEY = "expers-notifications";
const LAST_OPEN_KEY = "expers-notifications-last-open";

let cachedSnapshot: AppNotification[] | null = null;

function getSnapshot(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AppNotification[] = JSON.parse(raw);
      if (cachedSnapshot && areArraysEqual(cachedSnapshot, parsed)) {
        return cachedSnapshot;
      }
      cachedSnapshot = parsed;
      return parsed;
    }
  } catch {
    /* empty */
  }
  if (!cachedSnapshot) cachedSnapshot = [];
  return cachedSnapshot;
}

function areArraysEqual(a: AppNotification[], b: AppNotification[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
    if (a[i].read !== b[i].read) return false;
    if (a[i].createdAt !== b[i].createdAt) return false;
    if (a[i].message !== b[i].message) return false;
    if (a[i].link !== b[i].link) return false;
    if (a[i].type !== b[i].type) return false;
  }
  return true;
}

function getLastOpen(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LAST_OPEN_KEY) ?? "";
}

const listeners = new Set<() => void>();

function notifyListeners() {
  cachedSnapshot = null;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function persistNotifications(next: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedSnapshot = null;
  notifyListeners();
}

function generateNotificationsForExpert(
  expertId: string,
  _expertName: string
): AppNotification[] {
  const existing = getSnapshot();
  const existingIds = new Set(existing.map((n) => n.id));
  const lastOpen = getLastOpen();
  const fresh: AppNotification[] = [];

  const raw = localStorage.getItem("expers-comments");
  const commentsMap: Record<
    string,
    {
      id: string;
      articleId: string;
      authorId: string;
      authorName: string;
      text: string;
      createdAt: string;
    }[]
  > = raw ? JSON.parse(raw) : {};

  for (const [articleId, comments] of Object.entries(commentsMap)) {
    for (const comment of comments) {
      if (comment.authorId === expertId) continue;

      const nid = `comment-${comment.id}`;
      if (existingIds.has(nid)) continue;

      if (!lastOpen || comment.createdAt > lastOpen) {
        fresh.push({
          id: nid,
          type: "comment_on_article",
          message: `${comment.authorName} оставил комментарий к статье`,
          link: `/articles/${articleId}`,
          read: false,
          createdAt: comment.createdAt,
        });
      }
    }
  }

  const subscriptionsRaw = localStorage.getItem("expers-subscriptions");
  const subscriptions: string[] = subscriptionsRaw
    ? JSON.parse(subscriptionsRaw)
    : [];

  if (subscriptions.length > 0) {
    const allArticles = getAllReaderArticles();
    for (const article of allArticles) {
      if (subscriptions.includes(article.authorId)) {
        const nid = `author-article-${article.id}`;
        if (existingIds.has(nid)) continue;
        if (!lastOpen || article.date > lastOpen.split("T")[0]) {
          fresh.push({
            id: nid,
            type: "new_article_author",
            message: `Новая статья от ${article.authorName}: ${article.title}`,
            link: `/articles/${article.id}`,
            read: false,
            createdAt: article.date + "T00:00:00Z",
          });
        }
      }
    }
  }

  const sectionSubRaw = localStorage.getItem("expers-section-subscriptions");
  const sectionSubs: string[] = sectionSubRaw ? JSON.parse(sectionSubRaw) : [];

  if (sectionSubs.length > 0) {
    const allArticles = getAllReaderArticles();
    for (const article of allArticles) {
      if (
        sectionSubs.includes(article.industryId) ||
        (article.subsectionId && sectionSubs.includes(article.subsectionId))
      ) {
        const nid = `section-article-${article.id}`;
        if (existingIds.has(nid)) continue;
        if (!lastOpen || article.date > lastOpen.split("T")[0]) {
          fresh.push({
            id: nid,
            type: "new_article_section",
            message: `Новая статья в разделе ${article.industryName}: ${article.title}`,
            link: `/articles/${article.id}`,
            read: false,
            createdAt: article.date + "T00:00:00Z",
          });
        }
      }
    }
  }

  if (fresh.length > 0) {
    const merged = [...fresh, ...existing];
    merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    persistNotifications(merged);
  }

  return fresh;
}

export function useNotifications() {
  const { expert } = useAuth();

  const notifications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const refresh = useCallback(() => {
    if (!expert) return;
    generateNotificationsForExpert(expert.id, expert.name);
  }, [expert]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    persistNotifications(next);
  }, []);

  const markAllAsRead = useCallback(() => {
    const current = getSnapshot();
    const next = current.map((n) => ({ ...n, read: true }));
    persistNotifications(next);
  }, []);

  const markOpened = useCallback(() => {
    localStorage.setItem(LAST_OPEN_KEY, new Date().toISOString());
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
