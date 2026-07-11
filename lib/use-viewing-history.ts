"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "expers-viewing-history";
const MAX_ENTRIES = 50;

export interface ViewingHistoryEntry {
  articleId: string;
  viewedAt: string;
}

let cachedSnapshot: ViewingHistoryEntry[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): ViewingHistoryEntry[] {
  if (typeof window === "undefined") return cachedSnapshot;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    if (raw) {
      cachedSnapshot = JSON.parse(raw) as ViewingHistoryEntry[];
    } else {
      cachedSnapshot = [];
    }
  } catch {
    cachedSnapshot = [];
  }
  return cachedSnapshot;
}

const listeners = new Set<() => void>();

function notifyListeners() {
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

function updateHistory(next: ViewingHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyListeners();
}

export function useViewingHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const addView = useCallback((articleId: string) => {
    const current = getSnapshot();
    const filtered = current.filter((e) => e.articleId !== articleId);
    const entry: ViewingHistoryEntry = {
      articleId,
      viewedAt: new Date().toISOString(),
    };
    updateHistory([entry, ...filtered].slice(0, MAX_ENTRIES));
  }, []);

  const clearHistory = useCallback(() => {
    updateHistory([]);
  }, []);

  return { history, addView, clearHistory };
}
