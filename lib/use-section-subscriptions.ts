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
    const res = await fetch("/api/section-subscriptions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      loadedToken = token;
      setSubs(new Set<string>(data.sectionIds ?? []));
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

async function toggle(sectionId: string) {
  const token = getToken();
  if (!token) {
    toast.error("Войдите, чтобы подписаться на раздел");
    return;
  }

  const has = subscriptions.has(sectionId);
  const next = new Set(subscriptions);
  if (has) next.delete(sectionId);
  else next.add(sectionId);
  setSubs(next);

  try {
    const res = has
      ? await fetch(
          `/api/section-subscriptions?sectionId=${encodeURIComponent(sectionId)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        )
      : await fetch("/api/section-subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sectionId }),
        });

    if (!res.ok) {
      const reverted = new Set(subscriptions);
      if (has) reverted.add(sectionId);
      else reverted.delete(sectionId);
      setSubs(reverted);
      toast.error("Не удалось обновить подписку");
    }
  } catch {
    const reverted = new Set(subscriptions);
    if (has) reverted.add(sectionId);
    else reverted.delete(sectionId);
    setSubs(reverted);
    toast.error("Ошибка соединения");
  }
}

async function replaceAll(ids: string[]) {
  const token = getToken();
  if (!token) return;
  const prev = subscriptions;
  setSubs(new Set(ids));
  try {
    const res = await fetch("/api/section-subscriptions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sectionIds: ids }),
    });
    if (!res.ok) setSubs(prev);
  } catch {
    setSubs(prev);
  }
}

export function useSectionSubscriptions() {
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

  const setSubscriptions = useCallback((ids: string[]) => {
    replaceAll(ids);
  }, []);

  return {
    subscriptions: subs,
    isSubscribed,
    toggleSubscription,
    setSubscriptions,
    subscribedCount: subs.size,
  };
}
