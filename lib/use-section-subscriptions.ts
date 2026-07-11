"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "expers-section-subscriptions";

let isFirstSnapshot = true;
let cachedSnapshot: Set<string> | null = null;

function getSnapshot(): Set<string> {
  if (typeof window === "undefined") return new Set();
  if (isFirstSnapshot) return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = new Set<string>(JSON.parse(raw));
      if (cachedSnapshot && setsEqual(cachedSnapshot, parsed)) {
        return cachedSnapshot;
      }
      cachedSnapshot = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  if (!cachedSnapshot) cachedSnapshot = new Set();
  return cachedSnapshot;
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
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
  if (isFirstSnapshot) {
    isFirstSnapshot = false;
    setTimeout(callback, 0);
  }
  return () => {
    listeners.delete(callback);
  };
}

function updateSubscriptions(next: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  cachedSnapshot = null;
  notifyListeners();
}

export function useSectionSubscriptions() {
  const subscriptions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const isSubscribed = useCallback(
    (id: string) => subscriptions.has(id),
    [subscriptions]
  );

  const toggleSubscription = useCallback((id: string) => {
    const current = getSnapshot();
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateSubscriptions(next);
  }, []);

  const setSubscriptions = useCallback((ids: string[]) => {
    updateSubscriptions(new Set(ids));
  }, []);

  const subscribedCount = subscriptions.size;

  return {
    subscriptions,
    isSubscribed,
    toggleSubscription,
    setSubscriptions,
    subscribedCount,
  };
}
