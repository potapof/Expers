"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReaderNewArticles } from "@/components/reader-new-articles";
import { ReaderFavoriteArticles } from "@/components/reader-favorite-articles";
import { ReaderMyComments } from "@/components/reader-my-comments";
import { ReaderFollowedAuthors } from "@/components/reader-followed-authors";
import { ReaderFollowedArticles } from "@/components/reader-followed-articles";
import { ReaderManageSubscriptions } from "@/components/reader-manage-subscriptions";
import { ReaderViewingHistory } from "@/components/reader-viewing-history";
import { AuthorDashboard } from "@/components/author-dashboard";
import { AuthorArticles } from "@/components/author-articles";
import { AuthorComments } from "@/components/author-comments";
import { AuthorSubscribers } from "@/components/author-subscribers";
import { AuthorProfileEditor } from "@/components/author-profile-editor";
import { AuthorSocialAnalytics } from "@/components/author-social-analytics";
import { AuthorFinance } from "@/components/author-finance";
import {
  BookOpen,
  PenSquare,
  User,
  LogOut,
  Bell,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Wallet,
} from "lucide-react";

type CabinetMode = "reader" | "author";
type ReaderView = "main" | "subscriptions";
type AuthorView =
  | "dashboard"
  | "articles"
  | "comments"
  | "subscribers"
  | "profile"
  | "social"
  | "finance";

const STORAGE_KEY = "expers-cabinet-mode";

export function CabinetClient() {
  const { expert, loading, logout } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<CabinetMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "reader" || saved === "author") return saved;
    }
    return "reader";
  });
  const [readerView, setReaderView] = useState<ReaderView>("main");
  const [authorView, setAuthorView] = useState<AuthorView>("dashboard");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "reader" || saved === "author") {
        setMode(saved);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!loading && !expert) {
      router.replace("/");
    }
  }, [loading, expert, router]);

  const switchMode = (newMode: CabinetMode) => {
    setMode(newMode);
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 max-w-3xl py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100 mb-8" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!expert) {
    return null;
  }

  return (
    <div className="mx-auto px-4 max-w-3xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#2C3E50]">Личный кабинет</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{expert.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
            Выйти
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-8 w-fit">
        <button
          type="button"
          onClick={() => switchMode("reader")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "reader"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          }`}
        >
          <BookOpen className="h-4 w-4" />Я читатель
        </button>
        <button
          type="button"
          onClick={() => switchMode("author")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "author"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          }`}
        >
          <PenSquare className="h-4 w-4" />Я автор
        </button>
      </div>

      {mode === "reader" && readerView === "main" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="h-8 w-8 text-[#3498DB]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#2C3E50]">
                    {expert.name}
                  </h2>
                  <p className="text-sm text-gray-500">{expert.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => setReaderView("subscriptions")}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4FD]">
                <Bell className="h-5 w-5 text-[#3498DB]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#2C3E50]">
                  Управление подписками
                </p>
                <p className="text-xs text-gray-400">
                  Авторы, разделы и темы, на которые вы подписаны
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-300">→</span>
          </button>

          <div>
            <h2 className="mb-1 text-lg font-semibold text-[#2C3E50]">
              Подписанные авторы
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Авторы, на которых вы подписаны
            </p>
            <ReaderFollowedAuthors />
          </div>

          <ReaderFollowedArticles />

          <div>
            <h2 className="mb-1 text-lg font-semibold text-[#2C3E50]">
              Новые статьи
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Свежие публикации по выбранным разделам
            </p>
            <ReaderNewArticles />
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold text-[#2C3E50]">
              Избранные статьи
            </h2>
            <p className="mb-4 text-sm text-gray-400">Сохранённые публикации</p>
            <ReaderFavoriteArticles />
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold text-[#2C3E50]">
              Мои комментарии
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Ваши комментарии к статьям
            </p>
            <ReaderMyComments />
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold text-[#2C3E50]">
              История просмотров
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              Недавно просмотренные статьи
            </p>
            <ReaderViewingHistory />
          </div>
        </div>
      )}

      {mode === "reader" && readerView === "subscriptions" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setReaderView("main")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2C3E50] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад в кабинет
          </button>

          <div>
            <h2 className="text-xl font-bold text-[#2C3E50]">
              Управление подписками
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Все подписки в одном месте. Отпишитесь одним кликом.
            </p>
          </div>

          <ReaderManageSubscriptions />
        </div>
      )}

      {mode === "author" && (
        <div className="space-y-6">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
            <button
              type="button"
              onClick={() => setAuthorView("dashboard")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "dashboard"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Дашборд
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("articles")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "articles"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <FileText className="h-4 w-4" />
              Статьи
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("comments")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "comments"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Комментарии
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("subscribers")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "subscribers"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <Users className="h-4 w-4" />
              Подписчики
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("social")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "social"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("finance")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "finance"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Финансы
            </button>
            <button
              type="button"
              onClick={() => setAuthorView("profile")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                authorView === "profile"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <Settings className="h-4 w-4" />
              Профиль
            </button>
          </div>

          {authorView === "dashboard" && <AuthorDashboard />}
          {authorView === "articles" && <AuthorArticles />}
          {authorView === "comments" && <AuthorComments />}
          {authorView === "subscribers" && <AuthorSubscribers />}
          {authorView === "social" && <AuthorSocialAnalytics />}
          {authorView === "finance" && <AuthorFinance />}
          {authorView === "profile" && <AuthorProfileEditor />}
        </div>
      )}
    </div>
  );
}
