"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import { toast } from "sonner";

const AUTH_EVENT = "expers-auth-changed";

let favorites: Set<string> = new Set();
const emptyServer: Set<string> = new Set();

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

function getSnapshot(): Set<string> {
  return favorites;
}

function getServerSnapshot(): Set<string> {
  return emptyServer;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setFavorites(next: Set<string>) {
  favorites = next;
  notify();
}

async function load() {
  if (typeof window === "undefined") return;
  const token = getToken();

  if (loading) return;
  if (token === loadedToken) return;

  if (!token) {
    loadedToken = null;
    setFavorites(new Set());
    return;
  }

  loading = true;
  try {
    const res = await fetch("/api/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      loadedToken = token;
      setFavorites(new Set<string>(data.articleIds ?? []));
    } else if (res.status === 401) {
      loadedToken = token;
      setFavorites(new Set());
    }
  } catch {
    // leave as-is; will retry on next auth change
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

async function toggle(articleId: string) {
  const token = getToken();
  if (!token) {
    toast.error("Войдите, чтобы добавить в избранное");
    return;
  }

  const has = favorites.has(articleId);
  const next = new Set(favorites);
  if (has) next.delete(articleId);
  else next.add(articleId);
  setFavorites(next);

  try {
    const res = has
      ? await fetch(
          `/api/favorites?articleId=${encodeURIComponent(articleId)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      : await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId }),
        });

    if (!res.ok) {
      const reverted = new Set(favorites);
      if (has) reverted.add(articleId);
      else reverted.delete(articleId);
      setFavorites(reverted);
      toast.error("Не удалось обновить избранное");
    }
  } catch {
    const reverted = new Set(favorites);
    if (has) reverted.add(articleId);
    else reverted.delete(articleId);
    setFavorites(reverted);
    toast.error("Ошибка соединения");
  }
}

export function useFavorites() {
  const favs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    load();
  }, []);

  const isFavorite = useCallback((id: string) => favs.has(id), [favs]);

  const toggleFavorite = useCallback((id: string) => {
    toggle(id);
  }, []);

  return { favorites: favs, isFavorite, toggleFavorite };
}
