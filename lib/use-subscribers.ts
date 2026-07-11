"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "expers-subscriptions";

let cachedSnapshot: Set<string> | null = null;

function getSnapshot(): Set<string> {
  if (typeof window === "undefined") return new Set();
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
  return () => {
    listeners.delete(callback);
  };
}

function updateSubscriptions(next: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  cachedSnapshot = null;
  notifyListeners();
}

export function useSubscriptions() {
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

  const subscribedCount = subscriptions.size;

  return { subscriptions, isSubscribed, toggleSubscription, subscribedCount };
}

export interface Subscriber {
  id: string;
  name: string;
  subscribedAt: string;
}

export function useAuthorSubscribers(_expertId?: string) {
  const { subscriptions } = useSubscriptions();
  const subscribers: Subscriber[] = [];
  for (const id of subscriptions) {
    subscribers.push({
      id,
      name: id,
      subscribedAt: new Date().toISOString().split("T")[0],
    });
  }
  return { subscribers };
}

export function getSubscriberGrowthData(
  subscribers: Subscriber[],
  days: number
) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const daily: { date: string; count: number }[] = [];
  const countMap = new Map<string, number>();
  for (const s of subscribers) {
    if (s.subscribedAt >= cutoffStr) {
      countMap.set(s.subscribedAt, (countMap.get(s.subscribedAt) || 0) + 1);
    }
  }
  for (const [date, count] of countMap) {
    daily.push({ date, count });
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));
  return {
    daily,
    total: subscribers.length,
    newThisPeriod: daily.reduce((s, d) => s + d.count, 0),
  };
}

export function getSubscriberChange(subscribers: Subscriber[], days: number) {
  const now = new Date();
  const current = now.getTime() - days * 24 * 60 * 60 * 1000;
  const previous = current - days * 24 * 60 * 60 * 1000;
  const currentStr = new Date(current).toISOString().split("T")[0];
  const previousStr = new Date(previous).toISOString().split("T")[0];
  const currentCount = subscribers.filter(
    (s) => s.subscribedAt >= currentStr
  ).length;
  const previousCount = subscribers.filter(
    (s) => s.subscribedAt >= previousStr && s.subscribedAt < currentStr
  ).length;
  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}
