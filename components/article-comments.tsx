"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  User,
  Reply,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useComments } from "@/lib/use-comments";
import type { Comment } from "@/lib/use-comments";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function CommentItem({
  comment,
  isArticleAuthor,
  articleAuthorId,
  onReply,
  replies,
}: {
  comment: Comment;
  isArticleAuthor: boolean;
  articleAuthorId: string;
  onReply: (parentId: string) => void;
  replies: Comment[];
}) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="mb-1 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-[#2C3E50]">
          {comment.authorName}
        </span>
        {comment.isAuthorReply && (
          <span className="inline-flex items-center rounded-full bg-[#3498DB]/10 px-2 py-0.5 text-[11px] font-medium text-[#3498DB]">
            ответ автора
          </span>
        )}
        {!comment.isAuthorReply &&
          comment.authorId === articleAuthorId &&
          !comment.parentId && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
              автор
            </span>
          )}
        <span className="text-xs text-gray-400">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{comment.text}</p>
      {isArticleAuthor && (
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          className="mt-2 flex items-center gap-1 text-xs text-[#3498DB] hover:text-[#2980B9] transition-colors"
        >
          <Reply className="h-3 w-3" />
          Ответить
        </button>
      )}
      {replies.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-[#2C3E50] transition-colors"
          >
            {showReplies ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {replies.length} {replies.length === 1 ? "ответ" : "ответов"}
          </button>
          {showReplies && (
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100">
              {replies.map((reply) => (
                <div key={reply.id} className="rounded-lg bg-gray-50 px-4 py-3">
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
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {reply.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ArticleComments({
  articleId,
  articleAuthorId,
}: {
  articleId: string;
  articleAuthorId: string;
}) {
  const { expert, loading } = useAuth();
  const { topLevelComments, getReplies, addComment, replyComment } =
    useComments(articleId);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!expert) return;

    setSubmitting(true);
    addComment(expert.id, expert.name, trimmed);
    setText("");
    setSubmitting(false);
    toast.success("Комментарий добавлен");
  };

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
    setReplyText("");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !replyTo || !expert) return;

    const isAuthor = expert.id === articleAuthorId;
    replyComment(replyTo, expert.id, expert.name, trimmed, isAuthor);
    setReplyText("");
    setReplyTo(null);
    toast.success("Ответ отправлен");
  };

  return (
    <section className="mt-12">
      <Separator className="mb-8" />

      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#2C3E50]">
        <MessageSquare className="h-5 w-5 text-[#3498DB]" />
        Комментарии
        {topLevelComments.length > 0 && (
          <span className="text-sm font-normal text-gray-500">
            ({topLevelComments.length})
          </span>
        )}
      </h2>

      {loading ? null : !expert ? (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
          <User className="h-5 w-5 shrink-0 text-gray-400" />
          <span>Войдите, чтобы оставить комментарий</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8">
          <label htmlFor="comment-text" className="sr-only">
            Текст комментария
          </label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишите комментарий..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2C3E50] placeholder-gray-400 outline-none ring-[#3498DB] transition-all focus:border-[#3498DB] focus:ring-2"
          />
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              disabled={!text.trim() || submitting}
              className="gap-2 bg-[#3498DB] hover:bg-[#2980B9]"
            >
              <Send className="h-4 w-4" />
              Отправить
            </Button>
          </div>
        </form>
      )}

      {replyTo && expert && (
        <div className="mb-6 rounded-xl border border-[#3498DB]/30 bg-blue-50 px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[#3498DB]">
              Ответ на комментарий
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Отмена
            </button>
          </div>
          <form onSubmit={handleReplySubmit}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Напишите ответ..."
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#2C3E50] placeholder-gray-400 outline-none ring-[#3498DB] transition-all focus:border-[#3498DB] focus:ring-2"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={!replyText.trim()}
                size="sm"
                className="gap-1.5 bg-[#3498DB] hover:bg-[#2980B9] text-xs h-8"
              >
                <Reply className="h-3 w-3" />
                {expert.id === articleAuthorId
                  ? "Ответить как автор"
                  : "Ответить"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {topLevelComments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Пока нет комментариев. Будьте первым!
        </p>
      ) : (
        <div className="space-y-4">
          {[...topLevelComments].reverse().map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isArticleAuthor={!!expert && expert.id === articleAuthorId}
              articleAuthorId={articleAuthorId}
              onReply={handleReply}
              replies={getReplies(comment.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
