"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { ReaderNewArticles } from "@/components/reader-new-articles";
import { ReaderFavoriteArticles } from "@/components/reader-favorite-articles";
import { ReaderMyComments } from "@/components/reader-my-comments";
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
import { AuthorPageWizard } from "@/components/author-page-wizard";
import {
  BookOpen,
  PenSquare,
  User,
  Bell,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Wallet,
  Globe,
  HelpCircle,
  Mail,
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
  | "finance"
  | "authorPage";

const STORAGE_KEY = "expers-cabinet-mode";

export function CabinetClient() {
  const { expert, loading } = useAuth();
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

  const effectiveMode: CabinetMode = mode;

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
      <h1 className="text-2xl font-bold text-[#2C3E50] mb-6">Личный кабинет</h1>

      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-start gap-4 justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-6 w-6 text-[#0039CA]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2C3E50]">
                  {expert.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  {expert.email}
                </div>
                <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mt-3 w-fit">
                  <button
                    type="button"
                    onClick={() => switchMode("reader")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${effectiveMode === "reader" ? "bg-white text-[#2C3E50] shadow-sm" : "text-gray-500 hover:text-[#2C3E50]"}`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />Я читатель
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("author")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${effectiveMode === "author" ? "bg-white text-[#2C3E50] shadow-sm" : "text-gray-500 hover:text-[#2C3E50]"}`}
                  >
                    <PenSquare className="h-3.5 w-3.5" />Я автор
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col shrink-0 border-l border-gray-100 pl-5 ml-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Управление
              </p>
              <button
                type="button"
                onClick={() => {
                  switchMode("author");
                  setAuthorView("finance");
                }}
                className={`flex items-center gap-2 py-1.5 text-xs font-medium transition-colors -ml-5 pl-5 border-l-2 ${authorView === "finance" && effectiveMode === "author" ? "border-[#0039CA] text-[#0039CA]" : "border-transparent text-gray-500 hover:text-[#2C3E50] hover:border-gray-200"}`}
              >
                <Wallet className="h-3.5 w-3.5" />
                Платежи
              </button>
              <button
                type="button"
                onClick={() => {
                  switchMode("author");
                  setAuthorView("profile");
                }}
                className={`flex items-center gap-2 py-1.5 text-xs font-medium transition-colors -ml-5 pl-5 border-l-2 ${authorView === "profile" && effectiveMode === "author" ? "border-[#0039CA] text-[#0039CA]" : "border-transparent text-gray-500 hover:text-[#2C3E50] hover:border-gray-200"}`}
              >
                <Settings className="h-3.5 w-3.5" />
                Профиль
              </button>
              {expert?.hasPaid ? (
                <button
                  type="button"
                  onClick={() => {
                    switchMode("author");
                    setAuthorView("authorPage");
                  }}
                  className={`flex items-center gap-2 py-1.5 text-xs font-medium transition-colors -ml-5 pl-5 border-l-2 ${authorView === "authorPage" && effectiveMode === "author" ? "border-[#0039CA] text-[#0039CA]" : "border-transparent text-gray-500 hover:text-[#2C3E50] hover:border-gray-200"}`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Страница автора
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 py-1.5 text-xs font-medium text-gray-300 cursor-not-allowed -ml-5 pl-5 border-l-2 border-transparent"
                  title="Создание страницы автора доступно после публикации первой статьи"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Страница автора
                  <HelpCircle className="h-3 w-3 text-gray-300" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {effectiveMode === "reader" && readerView === "main" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setReaderView("subscriptions")}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4FD]">
                <Bell className="h-5 w-5 text-[#0039CA]" />
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

      {effectiveMode === "reader" && readerView === "subscriptions" && (
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

      {effectiveMode === "author" && (
        <div className="space-y-6">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setAuthorView("dashboard")}
              className={`flex flex-1 justify-center items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
              className={`flex flex-1 justify-center items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
              className={`flex flex-1 justify-center items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
              className={`flex flex-1 justify-center items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
              className={`flex flex-1 justify-center items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                authorView === "social"
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </button>
          </div>

          {authorView === "dashboard" && <AuthorDashboard />}
          {authorView === "articles" && <AuthorArticles />}
          {authorView === "comments" && <AuthorComments />}
          {authorView === "subscribers" && <AuthorSubscribers />}
          {authorView === "social" && <AuthorSocialAnalytics />}
          {authorView === "finance" && <AuthorFinance />}
          {authorView === "profile" && <AuthorProfileEditor />}
          {authorView === "authorPage" && <AuthorPageWizard />}
        </div>
      )}
    </div>
  );
}
