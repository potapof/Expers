"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Eye,
  MessageSquare,
  Heart,
  Bookmark,
  UserPlus,
  Repeat,
  BookOpen,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlarmClock,
  BarChart3,
} from "lucide-react";
import type { Article } from "@/lib/models";

const ARTICLES_KEY = "expers-articles";
const COMMENTS_KEY = "expers-comments";
const SUBSCRIPTIONS_KEY = "expers-subscriptions";
const FAVORITES_KEY = "expers-favorites";

function getArticlesFromStorage(expertId: string): Article[] {
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

function getCommentCountForArticles(articleIds: string[]): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return 0;
    const all: Record<string, unknown[]> = JSON.parse(raw);
    let count = 0;
    for (const id of articleIds) {
      if (all[id]) count += all[id].length;
    }
    return count;
  } catch {
    return 0;
  }
}

function getSubscriberCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!raw) return 0;
    const subs: string[] = JSON.parse(raw);
    return subs.length;
  } catch {
    return 0;
  }
}

function getFavoriteCountForArticles(articleIds: string[]): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return 0;
    const favs: string[] = JSON.parse(raw);
    return articleIds.filter((id) => favs.includes(id)).length;
  } catch {
    return 0;
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-[#2C3E50]">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-gray-300 mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  label,
  sublabel,
  color,
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#2C3E50] font-medium truncate mr-2">
          {label}
        </span>
        <span className="text-xs text-gray-400 shrink-0">{sublabel}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AuthorSocialAnalytics() {
  const { expert } = useAuth();

  const analyticsData = useMemo(() => {
    if (!expert) return null;

    const articles = getArticlesFromStorage(expert.id);
    const publishedArticles = articles.filter((a) => a.status === "published");
    const articleIds = publishedArticles.map((a) => a.id);

    const totalViews = publishedArticles.reduce((sum, a, i) => {
      const seed = i * 777 + 42;
      return sum + Math.round(100 + seededRandom(seed) * 900);
    }, 0);

    const reads = Math.round(totalViews * (0.45 + seededRandom(1) * 0.2));
    const readThroughs = Math.round(reads * (0.55 + seededRandom(2) * 0.15));
    const commentCount = getCommentCountForArticles(articleIds);
    const reactions = Math.round(totalViews * 0.08);
    const favoriteCount = getFavoriteCountForArticles(articleIds);
    const subscriberCount = getSubscriberCount();
    const reposts = Math.round(totalViews * (0.03 + seededRandom(3) * 0.04));

    const conversionRate =
      totalViews > 0
        ? ((subscriberCount / totalViews) * 100).toFixed(2)
        : "0.00";

    const readRate =
      totalViews > 0 ? Math.round((reads / totalViews) * 100) : 0;

    const readThroughRate =
      reads > 0 ? Math.round((readThroughs / reads) * 100) : 0;

    const timeSlots = [
      { hour: "8:00", label: "8 утра", seed: 10 },
      { hour: "10:00", label: "10 утра", seed: 20 },
      { hour: "12:00", label: "12 дня", seed: 30 },
      { hour: "14:00", label: "2 дня", seed: 40 },
      { hour: "16:00", label: "4 дня", seed: 50 },
      { hour: "18:00", label: "6 вечера", seed: 60 },
      { hour: "20:00", label: "8 вечера", seed: 70 },
      { hour: "22:00", label: "10 вечера", seed: 80 },
    ];

    const daySlots = [
      { day: "Пн", label: "Понедельник", seed: 100 },
      { day: "Вт", label: "Вторник", seed: 200 },
      { day: "Ср", label: "Среда", seed: 150 },
      { day: "Чт", label: "Четверг", seed: 180 },
      { day: "Пт", label: "Пятница", seed: 220 },
      { day: "Сб", label: "Суббота", seed: 90 },
      { day: "Вс", label: "Воскресенье", seed: 70 },
    ];

    const timeData = timeSlots.map((slot) => {
      const engagement =
        publishedArticles.length > 0
          ? publishedArticles.reduce((sum, a, i) => {
              const s = slot.seed + i * 50 + new Date(a.createdAt).getDate();
              return sum + Math.round(30 + seededRandom(s) * 70);
            }, 0)
          : Math.round(30 + seededRandom(slot.seed) * 70);
      return { ...slot, engagement };
    });

    const dayData = daySlots.map((slot) => {
      const engagement =
        publishedArticles.length > 0
          ? publishedArticles.reduce((sum, a, i) => {
              const s = slot.seed + i * 30 + new Date(a.createdAt).getDate();
              return sum + Math.round(30 + seededRandom(s) * 70);
            }, 0)
          : Math.round(30 + seededRandom(slot.seed) * 70);
      return { ...slot, engagement };
    });

    const maxTimeEngagement = Math.max(...timeData.map((t) => t.engagement), 1);
    const maxDayEngagement = Math.max(...dayData.map((d) => d.engagement), 1);

    const bestTimeSlot = [...timeData].sort(
      (a, b) => b.engagement - a.engagement
    )[0];

    const bestDaySlot = [...dayData].sort(
      (a, b) => b.engagement - a.engagement
    )[0];

    const topicEngagement = publishedArticles.map((a) => {
      const seed = a.id.length + a.createdAt.length;
      const topicViews = Math.round(50 + seededRandom(seed) * 200);
      const topicComments = Math.round(seededRandom(seed + 10) * 15);
      const topicFavs = Math.round(seededRandom(seed + 20) * 10);
      const topicEng = Math.round(
        topicViews * 0.3 + topicComments * 5 + topicFavs * 3
      );
      return {
        id: a.id,
        title: a.title,
        industryName: a.industryName,
        categoryName: a.categoryName,
        expertiseAreas: a.expertiseAreas,
        views: topicViews,
        comments: topicComments,
        favorites: topicFavs,
        engagement: topicEng,
      };
    });

    topicEngagement.sort((a, b) => b.engagement - a.engagement);

    const topTopics = topicEngagement.slice(0, 5);
    const maxTopicEngagement = topTopics.length
      ? Math.max(...topTopics.map((t) => t.engagement), 1)
      : 1;

    return {
      totalViews,
      reads,
      readThroughs,
      commentCount,
      reactions,
      favoriteCount,
      subscriberCount,
      reposts,
      conversionRate,
      readRate,
      readThroughRate,
      timeData,
      dayData,
      maxTimeEngagement,
      maxDayEngagement,
      bestTimeSlot,
      bestDaySlot,
      topTopics,
      maxTopicEngagement,
      publishedCount: publishedArticles.length,
    };
  }, [expert]);

  if (!expert || !analyticsData) return null;

  const {
    totalViews,
    reads,
    readThroughs,
    commentCount,
    reactions,
    favoriteCount,
    subscriberCount,
    reposts,
    conversionRate,
    readRate,
    readThroughRate,
    timeData,
    dayData,
    maxTimeEngagement,
    maxDayEngagement,
    bestTimeSlot,
    bestDaySlot,
    topTopics,
    maxTopicEngagement,
    publishedCount,
  } = analyticsData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#2C3E50]">
          Социальная аналитика
        </h2>
        <p className="text-sm text-gray-400">
          Метрики вовлечённости и конверсии
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Просмотры"
          value={formatNumber(totalViews)}
          iconBg="bg-blue-100"
          iconColor="text-[#0039CA]"
        />
        <MetricCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Чтения"
          value={formatNumber(reads)}
          sublabel={`${readRate}% от просмотров`}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Дочитывания"
          value={formatNumber(readThroughs)}
          sublabel={`${readThroughRate}% от чтений`}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Комментарии"
          value={commentCount}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          icon={<Heart className="h-4 w-4" />}
          label="Реакции"
          value={formatNumber(reactions)}
          iconBg="bg-pink-100"
          iconColor="text-pink-500"
        />
        <MetricCard
          icon={<Bookmark className="h-4 w-4" />}
          label="Избранное"
          value={favoriteCount}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-500"
        />
        <MetricCard
          icon={<UserPlus className="h-4 w-4" />}
          label="Подписки"
          value={subscriberCount}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          icon={<Repeat className="h-4 w-4" />}
          label="Репосты"
          value={formatNumber(reposts)}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-600"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-[#0039CA]" />
          <h3 className="text-sm font-semibold text-[#2C3E50]">
            Конверсия статья → подписка
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50/50 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Всего просмотров</p>
            <p className="text-3xl font-bold text-[#2C3E50]">
              {formatNumber(totalViews)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50/50 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Подписок</p>
            <p className="text-3xl font-bold text-[#2C3E50]">
              {subscriberCount}
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-[#0039CA]/10 to-[#2C3E50]/10 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Конверсия</p>
            <p className="text-3xl font-bold text-[#0039CA]">
              {conversionRate}%
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              просмотры → подписки
            </p>
          </div>
        </div>

        {publishedCount > 0 && (
          <div className="mt-4 rounded-lg bg-gray-50/50 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">В среднем на статью</span>
              <span className="text-[#2C3E50] font-medium">
                {subscriberCount > 0 && publishedCount > 0
                  ? (subscriberCount / publishedCount).toFixed(1)
                  : "0"}{" "}
                подписок
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ArrowRight className="h-3 w-3" />
              <span>
                {publishedCount} опубликованных статей · {subscriberCount}{" "}
                подписчиков
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlarmClock className="h-4 w-4 text-[#0039CA]" />
            <h3 className="text-sm font-semibold text-[#2C3E50]">
              Лучшее время публикации
            </h3>
          </div>

          <div className="space-y-2.5">
            {timeData.map((slot) => (
              <div key={slot.hour} className="flex items-center gap-2">
                <span className="w-12 text-xs text-gray-400 shrink-0">
                  {slot.hour}
                </span>
                <div className="flex-1 h-5 rounded bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${
                      slot.hour === bestTimeSlot.hour
                        ? "bg-gradient-to-r from-[#0039CA] to-[#2C3E50]"
                        : "bg-[#0039CA]/40"
                    }`}
                    style={{
                      width: `${(slot.engagement / maxTimeEngagement) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] text-gray-400 shrink-0">
                  {slot.engagement}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[#0039CA]/5 border border-[#0039CA]/10">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#0039CA]">
              <TrendingUp className="h-3.5 w-3.5" />
              Лучшее время: {bestTimeSlot.label} ({bestTimeSlot.hour})
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-medium text-[#2C3E50] mb-2">
              По дням недели
            </h4>
            <div className="grid grid-cols-7 gap-1.5">
              {dayData.map((slot) => (
                <div key={slot.day} className="text-center">
                  <div
                    className="w-full rounded bg-gray-100 mx-auto mb-1"
                    style={{
                      height: `${(slot.engagement / maxDayEngagement) * 80}px`,
                      minHeight: "8px",
                    }}
                  >
                    <div
                      className={`w-full rounded transition-all ${
                        slot.day === bestDaySlot.day
                          ? "bg-gradient-to-t from-[#0039CA] to-[#2C3E50]"
                          : "bg-[#0039CA]/40"
                      }`}
                      style={{
                        height: `${(slot.engagement / maxDayEngagement) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{slot.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Лучший день: {bestDaySlot.label}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[#0039CA]" />
            <h3 className="text-sm font-semibold text-[#2C3E50]">
              Самые вовлекающие темы
            </h3>
          </div>

          {topTopics.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              Нет опубликованных статей
            </div>
          ) : (
            <div className="space-y-3">
              {topTopics.map((topic, i) => (
                <div key={topic.id}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2C3E50] text-[10px] font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2C3E50]">
                        {topic.title}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {topic.industryName} · {topic.categoryName}
                      </p>
                    </div>
                  </div>
                  <ProgressBar
                    value={topic.engagement}
                    max={maxTopicEngagement}
                    label={topic.expertiseAreas.slice(0, 2).join(", ")}
                    sublabel={`${topic.comments} комм. · ${topic.favorites} избр. · ${topic.views} просм.`}
                    color="bg-gradient-to-r from-[#0039CA] to-[#2C3E50]"
                  />
                </div>
              ))}
            </div>
          )}

          {topTopics.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50/50 border border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-[#2C3E50]">
                  Самый вовлекающий:{" "}
                </span>
                {topTopics[0].title}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
