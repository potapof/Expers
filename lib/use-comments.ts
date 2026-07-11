"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";

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

type CommentsMap = Record<string, Comment[]>;

const STORAGE_KEY = "expers-comments";
const LAST_VIEWED_KEY = "expers-author-comments-last-viewed";

let cachedSnapshot: CommentsMap | null = null;
let cachedRaw: string | null = null;

function getSnapshot(): CommentsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw && cachedSnapshot !== null) {
      return cachedSnapshot;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedRaw = raw;
      cachedSnapshot = parsed;
      return parsed;
    }
    if (cachedSnapshot === null) {
      cachedSnapshot = {};
      cachedRaw = null;
    }
    return cachedSnapshot;
  } catch {
    if (cachedSnapshot === null) {
      cachedSnapshot = {};
      cachedRaw = null;
    }
    return cachedSnapshot;
  }
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

function updateComments(next: CommentsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyListeners();
}

export function useComments(articleId: string) {
  const allComments = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const comments = allComments[articleId] ?? [];

  const addComment = useCallback(
    (authorId: string, authorName: string, text: string) => {
      const current = getSnapshot();
      const articleComments = current[articleId] ?? [];
      const newComment: Comment = {
        id: crypto.randomUUID(),
        articleId,
        authorId,
        authorName,
        text,
        createdAt: new Date().toISOString(),
      };
      updateComments({
        ...current,
        [articleId]: [...articleComments, newComment],
      });
      return newComment;
    },
    [articleId]
  );

  const replyComment = useCallback(
    (
      parentId: string,
      authorId: string,
      authorName: string,
      text: string,
      isAuthorReply?: boolean
    ) => {
      const current = getSnapshot();
      const articleComments = current[articleId] ?? [];
      const newComment: Comment = {
        id: crypto.randomUUID(),
        articleId,
        parentId,
        authorId,
        authorName,
        text,
        createdAt: new Date().toISOString(),
        isAuthorReply,
      };
      updateComments({
        ...current,
        [articleId]: [...articleComments, newComment],
      });
      return newComment;
    },
    [articleId]
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      const current = getSnapshot();
      const articleComments = current[articleId] ?? [];
      updateComments({
        ...current,
        [articleId]: articleComments.filter(
          (c) => c.id !== commentId && c.parentId !== commentId
        ),
      });
    },
    [articleId]
  );

  const updateComment = useCallback(
    (commentId: string, text: string) => {
      const current = getSnapshot();
      const articleComments = current[articleId] ?? [];
      updateComments({
        ...current,
        [articleId]: articleComments.map((c) =>
          c.id === commentId ? { ...c, text } : c
        ),
      });
    },
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
  const allComments = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const result: Comment[] = [];
  for (const articleComments of Object.values(allComments)) {
    for (const comment of articleComments) {
      if (comment.authorId === authorId) {
        result.push(comment);
      }
    }
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return result;
}

export function useAuthorComments(articleIds: string[]) {
  const allComments = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const result = useMemo(() => {
    const comments: Comment[] = [];
    for (const articleId of articleIds) {
      const articleComments = allComments[articleId] ?? [];
      for (const comment of articleComments) {
        if (!comment.parentId) {
          comments.push(comment);
        }
      }
    }
    comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return comments;
  }, [allComments, articleIds]);

  const getRepliesForComment = useCallback(
    (articleId: string, parentId: string) => {
      const articleComments = allComments[articleId] ?? [];
      return articleComments.filter((c) => c.parentId === parentId);
    },
    [allComments]
  );

  const replyToComment = useCallback(
    (
      articleId: string,
      parentId: string,
      authorId: string,
      authorName: string,
      text: string,
      isAuthorReply?: boolean
    ) => {
      const current = getSnapshot();
      const articleComments = current[articleId] ?? [];
      const newComment: Comment = {
        id: crypto.randomUUID(),
        articleId,
        parentId,
        authorId,
        authorName,
        text,
        createdAt: new Date().toISOString(),
        isAuthorReply,
      };
      updateComments({
        ...current,
        [articleId]: [...articleComments, newComment],
      });
      return newComment;
    },
    []
  );

  const getArticleCommentCount = useCallback(
    (articleId: string) => {
      const articleComments = allComments[articleId] ?? [];
      return articleComments.length;
    },
    [allComments]
  );

  const getNewCommentCount = useCallback(
    (since: string | null) => {
      if (!since) return 0;
      const sinceTime = new Date(since).getTime();
      let count = 0;
      for (const articleId of articleIds) {
        const articleComments = allComments[articleId] ?? [];
        for (const comment of articleComments) {
          if (!comment.isAuthorReply && comment.authorId !== articleIds[0]) {
            const commentTime = new Date(comment.createdAt).getTime();
            if (commentTime > sinceTime) {
              count++;
            }
          }
        }
      }
      return count;
    },
    [allComments, articleIds]
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
    notifyListeners();
  }, []);

  return { getLastViewed, markViewed };
}
