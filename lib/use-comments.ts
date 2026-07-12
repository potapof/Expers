"use client";

import { useSyncExternalStore, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

export interface Comment {
  id: string;
  articleId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  isAuthorReply?: boolean;
}

interface CommentsState {
  byArticle: Record<string, Comment[]>;
}

const LAST_VIEWED_KEY = "expers-author-comments-last-viewed";
const EMPTY: Comment[] = [];

let state: CommentsState = { byArticle: {} };
const serverState: CommentsState = { byArticle: {} };

const loadedArticles = new Set<string>();
const loadingArticles = new Set<string>();
const loadedAuthors = new Set<string>();
const loadingAuthors = new Set<string>();

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

function getSnapshot(): CommentsState {
  return state;
}

function getServerSnapshot(): CommentsState {
  return serverState;
}

function setArticleComments(articleId: string, comments: Comment[]) {
  state = {
    byArticle: { ...state.byArticle, [articleId]: comments },
  };
  notify();
}

function mergeComments(incoming: Comment[]) {
  if (incoming.length === 0) return;
  const next: Record<string, Comment[]> = { ...state.byArticle };
  const touched = new Set<string>();
  for (const comment of incoming) {
    if (!touched.has(comment.articleId)) {
      next[comment.articleId] = [...(next[comment.articleId] ?? [])];
      touched.add(comment.articleId);
    }
    const list = next[comment.articleId];
    const idx = list.findIndex((c) => c.id === comment.id);
    if (idx >= 0) list[idx] = comment;
    else list.push(comment);
  }
  for (const articleId of touched) {
    next[articleId].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  state = { byArticle: next };
  notify();
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function loadArticle(articleId: string) {
  if (
    typeof window === "undefined" ||
    loadedArticles.has(articleId) ||
    loadingArticles.has(articleId)
  ) {
    return;
  }
  loadingArticles.add(articleId);
  try {
    const res = await fetch(
      `/api/comments?articleId=${encodeURIComponent(articleId)}`
    );
    if (res.ok) {
      const data = await res.json();
      loadedArticles.add(articleId);
      setArticleComments(articleId, data.comments ?? []);
    }
  } catch {
    // ignore; will retry on next mount
  } finally {
    loadingArticles.delete(articleId);
  }
}

async function loadAuthor(authorId: string) {
  if (
    typeof window === "undefined" ||
    loadedAuthors.has(authorId) ||
    loadingAuthors.has(authorId)
  ) {
    return;
  }
  loadingAuthors.add(authorId);
  try {
    const res = await fetch(
      `/api/comments?authorId=${encodeURIComponent(authorId)}`
    );
    if (res.ok) {
      const data = await res.json();
      loadedAuthors.add(authorId);
      mergeComments(data.comments ?? []);
    }
  } catch {
    // ignore
  } finally {
    loadingAuthors.delete(authorId);
  }
}

async function apiCreate(articleId: string, text: string, parentId?: string) {
  const token = getToken();
  if (!token) {
    toast.error("Войдите, чтобы оставить комментарий");
    return null;
  }
  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        articleId,
        text,
        ...(parentId ? { parentId } : {}),
      }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      mergeComments([data.comment]);
      return data.comment as Comment;
    }
    toast.error(data.error || "Ошибка добавления комментария");
    return null;
  } catch {
    toast.error("Ошибка соединения");
    return null;
  }
}

async function apiUpdate(id: string, articleId: string, text: string) {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      const list = (state.byArticle[articleId] ?? []).map((c) =>
        c.id === id ? { ...c, text } : c
      );
      setArticleComments(articleId, list);
      return data.comment as Comment;
    }
    toast.error(data.error || "Ошибка обновления");
    return null;
  } catch {
    toast.error("Ошибка соединения");
    return null;
  }
}

async function apiDelete(id: string, articleId: string) {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const list = (state.byArticle[articleId] ?? []).filter(
        (c) => c.id !== id && c.parentId !== id
      );
      setArticleComments(articleId, list);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Ошибка удаления");
    }
  } catch {
    toast.error("Ошибка соединения");
  }
}

export function useComments(articleId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const comments = snapshot.byArticle[articleId] ?? EMPTY;

  useEffect(() => {
    loadArticle(articleId);
  }, [articleId]);

  const addComment = useCallback(
    (_authorId: string, _authorName: string, text: string) =>
      apiCreate(articleId, text),
    [articleId]
  );

  const replyComment = useCallback(
    (
      parentId: string,
      _authorId: string,
      _authorName: string,
      text: string,
      _isAuthorReply?: boolean
    ) => apiCreate(articleId, text, parentId),
    [articleId]
  );

  const deleteComment = useCallback(
    (commentId: string) => apiDelete(commentId, articleId),
    [articleId]
  );

  const updateComment = useCallback(
    (commentId: string, text: string) => apiUpdate(commentId, articleId, text),
    [articleId]
  );

  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );

  const getReplies = useCallback(
    (parentId: string) => comments.filter((c) => c.parentId === parentId),
    [comments]
  );

  return {
    comments,
    topLevelComments,
    getReplies,
    addComment,
    replyComment,
    deleteComment,
    updateComment,
  };
}

export function useAllUserComments(authorId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    loadAuthor(authorId);
  }, [authorId]);

  return useMemo(() => {
    const result: Comment[] = [];
    for (const articleComments of Object.values(snapshot.byArticle)) {
      for (const comment of articleComments) {
        if (comment.authorId === authorId) result.push(comment);
      }
    }
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return result;
  }, [snapshot, authorId]);
}

export function useAuthorComments(articleIds: string[]) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const key = articleIds.join(",");

  useEffect(() => {
    for (const articleId of articleIds) loadArticle(articleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const result = useMemo(() => {
    const comments: Comment[] = [];
    for (const articleId of articleIds) {
      const articleComments = snapshot.byArticle[articleId] ?? [];
      for (const comment of articleComments) {
        if (!comment.parentId) comments.push(comment);
      }
    }
    comments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return comments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, key]);

  const getRepliesForComment = useCallback(
    (articleId: string, parentId: string) =>
      (snapshot.byArticle[articleId] ?? []).filter(
        (c) => c.parentId === parentId
      ),
    [snapshot]
  );

  const replyToComment = useCallback(
    (
      articleId: string,
      parentId: string,
      _authorId: string,
      _authorName: string,
      text: string,
      _isAuthorReply?: boolean
    ) => apiCreate(articleId, text, parentId),
    []
  );

  const getArticleCommentCount = useCallback(
    (articleId: string) => (snapshot.byArticle[articleId] ?? []).length,
    [snapshot]
  );

  const getNewCommentCount = useCallback(
    (since: string | null) => {
      if (!since) return 0;
      const sinceTime = new Date(since).getTime();
      let count = 0;
      for (const articleId of articleIds) {
        const articleComments = snapshot.byArticle[articleId] ?? [];
        for (const comment of articleComments) {
          if (!comment.isAuthorReply) {
            if (new Date(comment.createdAt).getTime() > sinceTime) count++;
          }
        }
      }
      return count;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshot, key]
  );

  return {
    comments: result,
    getRepliesForComment,
    replyToComment,
    getArticleCommentCount,
    getNewCommentCount,
  };
}

export function useLastViewed() {
  const getLastViewed = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LAST_VIEWED_KEY);
  }, []);

  const markViewed = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_VIEWED_KEY, now);
    notify();
  }, []);

  return { getLastViewed, markViewed };
}
