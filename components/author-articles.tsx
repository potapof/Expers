"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Article } from "@/lib/models";
import {
  Eye,
  MessageSquare,
  Heart,
  Plus,
  Edit,
  Archive,
  Trash2,
  Copy,
  Globe,
  GlobeOff,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ArticleStatus = "draft" | "published" | "archived" | "pending_payment";

const ARTICLES_KEY = "expers-articles";
const PUBLISHED_KEY = "expers-published";
const COMMENTS_KEY = "expers-comments";
const FAVORITES_KEY = "expers-favorites";
const VIEWS_KEY = "expers-article-views";

function getStorageArticles(expertId: string): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (!raw) return [];
    const all: Article[] = JSON.parse(raw);
    return all.filter((a) => a.expertId === expertId);
  } catch {
    return [];
  }
}

function saveStorageArticles(expertId: string, articles: Article[]): void {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    const all: Article[] = raw ? JSON.parse(raw) : [];
    const others = all.filter((a) => a.expertId !== expertId);
    localStorage.setItem(
      ARTICLES_KEY,
      JSON.stringify([...others, ...articles])
    );
  } catch {
    /* ignore */
  }
}

function syncFromPublished(expertId: string, expertName: string): void {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return;
    const published: Record<string, unknown>[] = JSON.parse(raw);

    const existing = getStorageArticles(expertId);
    const existingIds = new Set(existing.map((a) => a.id));

    let changed = false;
    for (const item of published) {
      const id = (item.id as string) || "";
      if (!id || existingIds.has(id)) continue;

      const full = (item as Record<string, unknown>)._full as
        | Record<string, unknown>
        | undefined;

      const now = new Date().toISOString();
      const article: Article = {
        id,
        title: (item.title as string) || "",
        description: (item.description as string) || "",
        content: "",
        authorId: expertId,
        authorName: expertName,
        industryId: (item.industryId as string) || "",
        industryName: "",
        subsectionId: "",
        subsectionName: "",
        categoryId: (item.categoryId as string) || "",
        categoryName: "",
        customCategory: "",
        expertiseAreas: [],
        crossLinks: [],
        tldr: "",
        keyFacts: [],
        definition: "",
        featuredSnippet: { question: "", answer: "" },
        problemSolutionResult: { problem: "", solution: "", result: "" },
        howTo: [],
        faq: [],
        todo: [],
        methodology: "",
        sources: [],
        readTime: (item.readTime as string) || "",
        status: "published",
        expertId,
        createdAt: now,
        updatedAt: now,
      };

      if (full) {
        article.title = (full.title as string) || article.title;
        article.description =
          (full.description as string) || article.description;
        article.content = (full.content as string) || "";
        article.industryId = (full.industryId as string) || article.industryId;
        article.industryName =
          (full.industryName as string) || article.industryName;
        article.subsectionId =
          (full.subsectionId as string) || article.subsectionId;
        article.subsectionName =
          (full.subsectionName as string) || article.subsectionName;
        article.categoryId = (full.categoryId as string) || article.categoryId;
        article.categoryName =
          (full.categoryName as string) || article.categoryName;
        article.customCategory =
          (full.customCategory as string) || article.customCategory;
        article.expertiseAreas = (full.expertiseAreas as string[]) || [];
        article.crossLinks = (full.crossLinks as Article["crossLinks"]) || [];
        article.tldr = (full.tldr as string) || "";
        article.keyFacts = (full.keyFacts as Article["keyFacts"]) || [];
        article.definition = (full.definition as string) || "";
        article.featuredSnippet =
          (full.featuredSnippet as Article["featuredSnippet"]) || {
            question: "",
            answer: "",
          };
        article.problemSolutionResult =
          (full.problemSolutionResult as Article["problemSolutionResult"]) || {
            problem: "",
            solution: "",
            result: "",
          };
        article.howTo = (full.howTo as Article["howTo"]) || [];
        article.faq = (full.faq as Article["faq"]) || [];
        article.todo = (full.todo as Article["todo"]) || [];
        article.methodology = (full.methodology as string) || "";
        article.sources = (full.sources as Article["sources"]) || [];
        article.readTime = (full.readTime as string) || article.readTime;
        article.createdAt =
          (full.createdAt as string) || (item.date as string) || now;
        article.updatedAt = now;
      }

      existing.push(article);
      existingIds.add(id);
      changed = true;
    }

    if (changed) {
      saveStorageArticles(expertId, existing);
    }
  } catch {
    /* ignore */
  }
}

function getCommentCountForArticle(articleId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return 0;
    const all: Record<string, unknown[]> = JSON.parse(raw);
    return all[articleId]?.length ?? 0;
  } catch {
    return 0;
  }
}

function getFavoriteCountForArticle(articleId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return 0;
    const favs: string[] = JSON.parse(raw);
    return favs.filter((id) => id === articleId).length;
  } catch {
    return 0;
  }
}

function getArticleViews(articleId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return 0;
    const views: Record<string, number> = JSON.parse(raw);
    return views[articleId] ?? 0;
  } catch {
    return 0;
  }
}

function simulateViewCount(articleId: string, createdAt: string): number {
  const seed = articleId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const daysSinceCreation = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
  );
  return Math.max(10, Math.round(seed * daysSinceCreation * 0.5 + 20));
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

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  archived: "Архивировано",
  pending_payment: "Ожидает оплаты",
};

const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  archived: "bg-amber-100 text-amber-700",
  pending_payment: "bg-orange-100 text-orange-700",
};

interface ArticleCardProps {
  article: Article;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string) => void;
}

function ArticleCard({
  article,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onDuplicate,
  onEdit,
}: ArticleCardProps) {
  const commentCount = getCommentCountForArticle(article.id);
  const favoriteCount = getFavoriteCountForArticle(article.id);
  const views =
    getArticleViews(article.id) ||
    simulateViewCount(article.id, article.createdAt);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[article.status]}`}
            >
              {STATUS_LABELS[article.status]}
            </span>
            {article.readTime && (
              <span className="text-xs text-gray-400">{article.readTime}</span>
            )}
          </div>

          <h3 className="text-base font-semibold text-[#2C3E50] leading-snug line-clamp-2">
            {article.title || "Без названия"}
          </h3>

          {article.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {article.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatRelativeDate(article.updatedAt)}
            </span>
            <span className="flex items-center gap-1" title="Просмотры">
              <Eye className="h-3.5 w-3.5" />
              {views}
            </span>
            <span className="flex items-center gap-1" title="Комментарии">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
            </span>
            <span className="flex items-center gap-1" title="Избранное">
              <Heart className="h-3.5 w-3.5" />
              {favoriteCount}
            </span>
          </div>
        </div>

        {article.industryName && (
          <div className="shrink-0">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-[#3498DB]">
              {article.industryName}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(article.id)}
          className="h-8 px-2 text-xs text-gray-500 hover:text-[#2C3E50]"
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          Редактировать
        </Button>

        {article.status === "draft" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPublish(article.id)}
            className="h-8 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            Опубликовать
          </Button>
        )}

        {article.status === "published" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUnpublish(article.id)}
            className="h-8 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            <GlobeOff className="h-3.5 w-3.5 mr-1" />
            Снять с публикации
          </Button>
        )}

        {article.status !== "archived" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(article.id)}
            className="h-8 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            <Archive className="h-3.5 w-3.5 mr-1" />
            Архивировать
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(article.id)}
          className="h-8 px-2 text-xs text-gray-500 hover:text-[#2C3E50]"
        >
          <Copy className="h-3.5 w-3.5 mr-1" />
          Дублировать
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(article.id)}
          className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Удалить
        </Button>
      </div>
    </div>
  );
}

export function AuthorArticles() {
  const { expert } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">(
    "all"
  );
  const [articles, setArticles] = useState<Article[]>(() => {
    if (!expert) return [];
    const stored = getStorageArticles(expert.id);
    if (stored.length === 0) {
      syncFromPublished(expert.id, expert.name);
      return getStorageArticles(expert.id);
    }
    return stored;
  });

  const persistArticles = useCallback(
    (updated: Article[]) => {
      if (!expert) return;
      setArticles(updated);
      saveStorageArticles(expert.id, updated);
    },
    [expert]
  );

  const filteredArticles = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((a) => a.status === statusFilter);
  }, [articles, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: articles.length,
      draft: 0,
      published: 0,
      archived: 0,
      pending_payment: 0,
    };
    for (const a of articles) {
      if (a.status in counts) counts[a.status]++;
    }
    return counts;
  }, [articles]);

  const handlePublish = useCallback(
    (id: string) => {
      const updated = articles.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "published" as const,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      persistArticles(updated);
      toast.success("Статья опубликована");
    },
    [articles, persistArticles]
  );

  const handleUnpublish = useCallback(
    (id: string) => {
      const updated = articles.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "draft" as const,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      persistArticles(updated);
      toast.success("Статья снята с публикации");
    },
    [articles, persistArticles]
  );

  const handleArchive = useCallback(
    (id: string) => {
      const updated = articles.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "archived" as const,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      persistArticles(updated);
      toast.success("Статья архивирована");
    },
    [articles, persistArticles]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const article = articles.find((a) => a.id === id);
      if (!article) return;

      toast(`Удалить «${article.title || "Без названия"}»?`, {
        action: {
          label: "Удалить",
          onClick: () => {
            const updated = articles.filter((a) => a.id !== id);
            persistArticles(updated);
            toast.success("Статья удалена");
          },
        },
        cancel: {
          label: "Отмена",
          onClick: () => {},
        },
      });
    },
    [articles, persistArticles]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const source = articles.find((a) => a.id === id);
      if (!source) return;

      const now = new Date().toISOString();
      const newArticle: Article = {
        ...source,
        id: `article-${crypto.randomUUID()}`,
        title: `${source.title} (копия)`,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };

      const updated = [...articles, newArticle];
      persistArticles(updated);
      toast.success("Статья дублирована");
    },
    [articles, persistArticles]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/articles/new?id=${id}`);
    },
    [router]
  );

  const handleCreate = useCallback(() => {
    if (!expert) return;

    const now = new Date().toISOString();
    const newArticle: Article = {
      id: `article-${crypto.randomUUID()}`,
      title: "",
      description: "",
      content: "",
      authorId: expert.id,
      authorName: expert.name,
      industryId: "",
      industryName: "",
      subsectionId: "",
      subsectionName: "",
      categoryId: "",
      categoryName: "",
      customCategory: "",
      expertiseAreas: [],
      crossLinks: [],
      tldr: "",
      keyFacts: [],
      definition: "",
      featuredSnippet: { question: "", answer: "" },
      problemSolutionResult: { problem: "", solution: "", result: "" },
      howTo: [],
      faq: [],
      todo: [],
      methodology: "",
      sources: [],
      readTime: "",
      status: "draft",
      expertId: expert.id,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...articles, newArticle];
    persistArticles(updated);
    router.push(`/articles/new?id=${newArticle.id}`);
  }, [expert, articles, persistArticles, router]);

  const filters: { value: ArticleStatus | "all"; label: string }[] = [
    { value: "all", label: `Все (${statusCounts.all})` },
    { value: "draft", label: `Черновики (${statusCounts.draft})` },
    { value: "published", label: `Опубликовано (${statusCounts.published})` },
    { value: "archived", label: `Архив (${statusCounts.archived})` },
  ];

  if (!expert) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">
            Управление статьями
          </h2>
          <p className="text-sm text-gray-400">
            {articles.length}{" "}
            {articles.length === 1
              ? "статья"
              : articles.length < 5
                ? "статьи"
                : "статей"}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#3498DB] hover:bg-[#2C3E50] text-white text-sm h-9 px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Создать статью
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-white text-[#2C3E50] shadow-sm"
                : "text-gray-500 hover:text-[#2C3E50]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <FileText className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-[#2C3E50] mb-1">
            {statusFilter === "all"
              ? "У вас пока нет статей"
              : `Нет статей со статусом «${STATUS_LABELS[statusFilter as ArticleStatus]}»`}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {statusFilter === "all"
              ? "Создайте первую статью, чтобы начать"
              : "Измените фильтр или создайте новую статью"}
          </p>
          {statusFilter === "all" && (
            <Button
              onClick={handleCreate}
              className="bg-[#3498DB] hover:bg-[#2C3E50] text-white text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Создать первую статью
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
