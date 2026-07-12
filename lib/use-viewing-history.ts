"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";

const AUTH_EVENT = "expers-auth-changed";

export interface ViewingHistoryEntry {
  articleId: string;
  viewedAt: string;
}

let history: ViewingHistoryEntry[] = [];
const emptyServer: ViewingHistoryEntry[] = [];

let loadedToken: string | null | undefined = undefined;
let loading = false;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): ViewingHistoryEntry[] {
  return history;
}

function getServerSnapshot(): ViewingHistoryEntry[] {
  return emptyServer;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setHistory(next: ViewingHistoryEntry[]) {
  history = next;
  notify();
}

async function load() {
  if (typeof window === "undefined") return;
  const token = getToken();

  if (loading) return;
  if (token === loadedToken) return;

  if (!token) {
    loadedToken = null;
    setHistory([]);
    return;
  }

  loading = true;
  try {
    const res = await fetch("/api/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      loadedToken = token;
      setHistory(data.history ?? []);
    } else if (res.status === 401) {
      loadedToken = token;
      setHistory([]);
    }
  } catch {
    // retry on next auth change
  } finally {
    loading = false;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_EVENT, () => {
    loadedToken = undefined;
    load();
  });
}

async function addView(articleId: string) {
  const token = getToken();
  if (!token) return;

  const filtered = history.filter((e) => e.articleId !== articleId);
  setHistory([
    { articleId, viewedAt: new Date().toISOString() },
    ...filtered,
  ]);

  try {
    await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId }),
    });
  } catch {
    // best-effort tracking
  }
}

async function clearHistory() {
  const token = getToken();
  if (!token) return;
  const prev = history;
  setHistory([]);
  try {
    const res = await fetch("/api/history", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) setHistory(prev);
  } catch {
    setHistory(prev);
  }
}

export function useViewingHistory() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    load();
  }, []);

  const addViewCb = useCallback((articleId: string) => {
    addView(articleId);
  }, []);

  const clearHistoryCb = useCallback(() => {
    clearHistory();
  }, []);

  return { history: snapshot, addView: addViewCb, clearHistory: clearHistoryCb };
}
