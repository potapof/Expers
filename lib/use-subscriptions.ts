"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import { toast } from "sonner";

const AUTH_EVENT = "expers-auth-changed";

let subscriptions: Set<string> = new Set();
const emptyServer: Set<string> = new Set();

let loadedToken: string | null | undefined = undefined;
let loading = false;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribeStore(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Set<string> {
  return subscriptions;
}

function getServerSnapshot(): Set<string> {
  return emptyServer;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setSubs(next: Set<string>) {
  subscriptions = next;
  notify();
}

async function load() {
  if (typeof window === "undefined") return;
  const token = getToken();

  if (loading) return;
  if (token === loadedToken) return;

  if (!token) {
    loadedToken = null;
    setSubs(new Set());
    return;
  }

  loading = true;
  try {
    const res = await fetch("/api/subscriptions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      loadedToken = token;
      setSubs(new Set<string>(data.authorIds ?? []));
    } else if (res.status === 401) {
      loadedToken = token;
      setSubs(new Set());
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

async function toggle(authorId: string) {
  const token = getToken();
  if (!token) {
    toast.error("Войдите, чтобы подписаться");
    return;
  }

  const has = subscriptions.has(authorId);
  const next = new Set(subscriptions);
  if (has) next.delete(authorId);
  else next.add(authorId);
  setSubs(next);

  try {
    const res = has
      ? await fetch(
          `/api/subscriptions?authorId=${encodeURIComponent(authorId)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      : await fetch("/api/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ authorId }),
        });

    if (!res.ok) {
      const reverted = new Set(subscriptions);
      if (has) reverted.add(authorId);
      else reverted.delete(authorId);
      setSubs(reverted);
      toast.error("Не удалось обновить подписку");
    }
  } catch {
    const reverted = new Set(subscriptions);
    if (has) reverted.add(authorId);
    else reverted.delete(authorId);
    setSubs(reverted);
    toast.error("Ошибка соединения");
  }
}

export function useSubscriptions() {
  const subs = useSyncExternalStore(
    subscribeStore,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    load();
  }, []);

  const isSubscribed = useCallback((id: string) => subs.has(id), [subs]);

  const toggleSubscription = useCallback((id: string) => {
    toggle(id);
  }, []);

  return {
    subscriptions: subs,
    isSubscribed,
    toggleSubscription,
    subscribedCount: subs.size,
  };
}
