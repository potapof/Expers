"use client";

import { useState, useEffect } from "react";

export interface Subscriber {
  id: string;
  name: string;
  subscribedAt: string;
}

export function useAuthorSubscribers(expertId?: string) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    if (!expertId || typeof window === "undefined") {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    let cancelled = false;
    fetch(`/api/subscriptions?authorId=${encodeURIComponent(expertId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { subscribers: [] }))
      .then((data) => {
        if (!cancelled) setSubscribers(data.subscribers ?? []);
      })
      .catch(() => {
        if (!cancelled) setSubscribers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [expertId]);

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
