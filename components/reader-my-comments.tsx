"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  MessageSquare,
  Trash2,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useComments, useAllUserComments } from "@/lib/use-comments";
import { getAllReaderArticles } from "@/lib/reader-data";
import { toast } from "sonner";

type SortMode = "date" | "article";

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

function isEditable(createdAt: string): boolean {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return now - created < 2 * 60 * 60 * 1000;
}

export function ReaderMyComments() {
  const { expert } = useAuth();
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const authorId = expert?.id ?? "";
  const userComments = useAllUserComments(authorId);
  const allArticles = getAllReaderArticles();
  const articleMap = new Map(allArticles.map((a) => [a.id, a.title]));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const sortedComments = [...userComments].sort((a, b) => {
    if (sortMode === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const titleA = articleMap.get(a.articleId) ?? a.articleId;
    const titleB = articleMap.get(b.articleId) ?? b.articleId;
    return titleA.localeCompare(titleB);
  });

  const displayComments = sortedComments.slice(0, 6);

  return (
    <div>
      <Sitebar sortMode={sortMode} setSortMode={setSortMode} />
      {loading ? (
        <CommentListSkeleton count={6} />
      ) : (
        <>
          {displayComments.length > 0 ? (
            <div className="mb-6 space-y-3">
              {displayComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  articleTitle={
                    articleMap.get(comment.articleId) ?? comment.articleId
                  }
                  isEditing={editingId === comment.id}
                  editText={editText}
                  onStartEdit={() => {
                    setEditingId(comment.id);
                    setEditText(comment.text);
                  }}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  onSaveEdit={() => {
                    if (editText.trim()) {
                      setEditingId(null);
                      setEditText("");
                    }
                  }}
                  onEditTextChange={setEditText}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
          {userComments.length > 0 && (
            <div className="flex justify-center">
              <Link href="/cabinet/comments">
                <Button variant="outline" size="sm">
                  Все комментарии
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Sitebar({
  sortMode,
  setSortMode,
}: {
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSortMode(sortMode === "date" ? "article" : "date")}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#2C3E50]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortMode === "date" ? "По дате" : "По статье"}
        </button>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  articleTitle,
  isEditing,
  editText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTextChange,
}: {
  comment: {
    id: string;
    articleId: string;
    text: string;
    createdAt: string;
  };
  articleTitle: string;
  isEditing: boolean;
  editText: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditTextChange: (text: string) => void;
}) {
  const editable = isEditable(comment.createdAt);
  const { deleteComment, updateComment } = useComments(comment.articleId);

  const handleDelete = () => {
    toast("Удалить комментарий?", {
      description: "Это действие нельзя отменить",
      action: {
        label: "Удалить",
        onClick: () => {
          deleteComment(comment.id);
          toast.success("Комментарий удалён");
        },
      },
      cancel: { label: "Отмена", onClick: () => {} },
    });
  };

  const handleSave = () => {
    if (!editText.trim()) return;
    updateComment(comment.id, editText.trim());
    onSaveEdit();
    toast.success("Комментарий обновлён");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2C3E50] outline-none ring-[#0039CA] transition-all focus:border-[#0039CA] focus:ring-2"
            />
          ) : (
            <p className="text-sm leading-relaxed text-gray-700">
              {comment.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        <span>{formatDate(comment.createdAt)}</span>
        <span className="text-gray-300">&middot;</span>
        <span className="truncate max-w-[200px]">{articleTitle}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/articles/${comment.articleId}`}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-[#0039CA] hover:bg-[#0039CA]/10 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Смотреть
        </Link>

        {editable && !isEditing && (
          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Редактировать
          </button>
        )}

        {isEditing && (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editText.trim()}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Отмена
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors ml-auto"
        >
          <Trash2 className="h-3 w-3" />
          Удалить
        </button>
      </div>
    </div>
  );
}

function CommentListSkeleton({ count }: { count: number }) {
  return (
    <div className="mb-6 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-100 bg-white px-5 py-4"
        >
          <div className="h-4 w-full animate-pulse rounded bg-gray-100 mb-2" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 mb-3" />
          <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Нет комментариев</p>
      <p className="mt-1 text-xs text-gray-400">
        Оставьте комментарий под статьёй, и он появится здесь
      </p>
    </div>
  );
}
