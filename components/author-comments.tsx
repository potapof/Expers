"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Reply,
  ExternalLink,
  Bell,
  ChevronDown,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useAuthorComments, useLastViewed } from "@/lib/use-comments";
import type { Comment } from "@/lib/use-comments";
import { toast } from "sonner";

const ARTICLES_KEY = "expers-articles";

function getAuthorArticles(expertId: string): { id: string; title: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (!raw) return [];
    const all: { id: string; title: string; expertId: string }[] =
      JSON.parse(raw);
    return all
      .filter((a) => a.expertId === expertId)
      .map((a) => ({ id: a.id, title: a.title }));
  } catch {
    return [];
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return "только что";
    if (diffHours < 24) return `${diffHours} ч. назад`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} д. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
    return `${Math.floor(diffDays / 365)} г. назад`;
  } catch {
    return dateStr;
  }
}

export function AuthorComments() {
  const { expert } = useAuth();
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyArticleId, setReplyArticleId] = useState<string>("");
  const [expandedArticles, setExpandedArticles] = useState<
    Record<string, boolean>
  >({});

  const authorArticles = useMemo(() => {
    if (!expert) return [];
    return getAuthorArticles(expert.id);
  }, [expert]);

  const articleIds = useMemo(
    () => authorArticles.map((a) => a.id),
    [authorArticles]
  );

  const articleMap = useMemo(
    () => new Map(authorArticles.map((a) => [a.id, a.title || "Без названия"])),
    [authorArticles]
  );

  const {
    comments,
    getRepliesForComment,
    replyToComment,
    getArticleCommentCount,
    getNewCommentCount,
  } = useAuthorComments(articleIds);

  const { getLastViewed, markViewed } = useLastViewed();

  const newCommentCount = useMemo(() => {
    const lastViewed = getLastViewed();
    return getNewCommentCount(lastViewed);
  }, [getLastViewed, getNewCommentCount]);

  const groupedByArticle = useMemo(() => {
    const grouped: Record<string, Comment[]> = {};
    for (const comment of comments) {
      if (!grouped[comment.articleId]) {
        grouped[comment.articleId] = [];
      }
      grouped[comment.articleId].push(comment);
    }
    return grouped;
  }, [comments]);

  const sortedArticleIds = useMemo(
    () =>
      Object.entries(groupedByArticle)
        .sort(([, aComments], [, bComments]) => {
          const aLatest = Math.max(
            ...aComments.map((c) => new Date(c.createdAt).getTime())
          );
          const bLatest = Math.max(
            ...bComments.map((c) => new Date(c.createdAt).getTime())
          );
          return bLatest - aLatest;
        })
        .map(([articleId]) => articleId),
    [groupedByArticle]
  );

  const toggleArticle = useCallback((articleId: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  }, []);

  const handleReply = useCallback((commentId: string, articleId: string) => {
    setReplyToId(commentId);
    setReplyArticleId(articleId);
    setReplyText("");
  }, []);

  const handleReplySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = replyText.trim();
      if (!trimmed || !replyToId || !expert) return;

      replyToComment(
        replyArticleId,
        replyToId,
        expert.id,
        expert.name,
        trimmed,
        true
      );
      setReplyText("");
      setReplyToId(null);
      setReplyArticleId("");
      toast.success("Ответ опубликован");
    },
    [replyText, replyToId, replyArticleId, expert, replyToComment]
  );

  useEffect(() => {
    markViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!expert) return null;

  const totalCommentCount = Object.values(groupedByArticle).reduce(
    (sum, comments) => sum + comments.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">
            Комментарии к статьям
          </h2>
          <p className="text-sm text-gray-400">
            {totalCommentCount}{" "}
            {totalCommentCount === 1
              ? "комментарий"
              : totalCommentCount < 5
                ? "комментария"
                : "комментариев"}{" "}
            к {authorArticles.length}{" "}
            {authorArticles.length === 1
              ? "статье"
              : authorArticles.length < 5
                ? "статьям"
                : "статьям"}
          </p>
        </div>
        {newCommentCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-[#3498DB]/10 px-3 py-1.5 text-xs font-medium text-[#3498DB]">
            <Bell className="h-3.5 w-3.5" />+{newCommentCount} новых
          </div>
        )}
      </div>

      {authorArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-[#2C3E50] mb-1">
            Нет статей
          </h3>
          <p className="text-sm text-gray-400">
            Создайте статью, чтобы получать комментарии
          </p>
        </div>
      ) : totalCommentCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-[#2C3E50] mb-1">
            Комментариев пока нет
          </h3>
          <p className="text-sm text-gray-400">
            Когда читатели оставят комментарии к вашим статьям, они появятся
            здесь
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedArticleIds.map((articleId) => {
            const articleComments = groupedByArticle[articleId];
            const articleTitle = articleMap.get(articleId) ?? "Без названия";
            const isExpanded = expandedArticles[articleId] !== false;

            return (
              <div
                key={articleId}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleArticle(articleId)}
                  className="flex w-full items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-[#2C3E50] truncate">
                      {articleTitle}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {getArticleCommentCount(articleId)}{" "}
                      {getArticleCommentCount(articleId) === 1
                        ? "комментарий"
                        : "комментариев"}
                    </span>
                  </div>
                  <Link
                    href={`/articles/${articleId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-[#3498DB] hover:text-[#2980B9] shrink-0 ml-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Открыть
                  </Link>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {articleComments.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-400">
                        Нет комментариев
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {articleComments.map((comment) => {
                          const replies = getRepliesForComment(
                            articleId,
                            comment.id
                          );
                          return (
                            <div key={comment.id} className="px-5 py-4">
                              <div className="mb-1 flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-[#2C3E50]">
                                  {comment.authorName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatRelativeDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-700">
                                {comment.text}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  handleReply(comment.id, articleId)
                                }
                                className="mt-2 flex items-center gap-1 text-xs text-[#3498DB] hover:text-[#2980B9] transition-colors"
                              >
                                <Reply className="h-3 w-3" />
                                Ответить
                              </button>

                              {replies.length > 0 && (
                                <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
                                  {replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="rounded-lg bg-gray-50 px-4 py-3"
                                    >
                                      <div className="mb-1 flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-[#2C3E50]">
                                          {reply.authorName}
                                        </span>
                                        {reply.isAuthorReply && (
                                          <span className="inline-flex items-center rounded-full bg-[#3498DB]/10 px-2 py-0.5 text-[11px] font-medium text-[#3498DB]">
                                            ответ автора
                                          </span>
                                        )}
                                        <span className="text-xs text-gray-400">
                                          {formatRelativeDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm leading-relaxed text-gray-700">
                                        {reply.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {replyToId === comment.id && (
                                <form
                                  onSubmit={handleReplySubmit}
                                  className="mt-3 rounded-lg border border-[#3498DB]/30 bg-blue-50 p-3"
                                >
                                  <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                      setReplyText(e.target.value)
                                    }
                                    placeholder="Напишите ответ..."
                                    rows={2}
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2C3E50] placeholder-gray-400 outline-none ring-[#3498DB] transition-all focus:border-[#3498DB] focus:ring-2"
                                  />
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-[#3498DB]">
                                      Ответ будет отмечен как «ответ автора»
                                    </span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyToId(null);
                                          setReplyText("");
                                        }}
                                        className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                      >
                                        Отмена
                                      </button>
                                      <Button
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        size="sm"
                                        className="gap-1.5 bg-[#3498DB] hover:bg-[#2980B9] text-xs h-7 px-3"
                                      >
                                        <Send className="h-3 w-3" />
                                        Ответить
                                      </Button>
                                    </div>
                                  </div>
                                </form>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
