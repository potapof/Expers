"use client";

import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Eye,
  FileText,
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { Article } from "@/lib/models";

type Period = "7d" | "30d" | "90d" | "1y" | "all";

const PERIODS: { value: Period; label: string; days: number | null }[] = [
  { value: "7d", label: "7 дней", days: 7 },
  { value: "30d", label: "30 дней", days: 30 },
  { value: "90d", label: "90 дней", days: 90 },
  { value: "1y", label: "Год", days: 365 },
  { value: "all", label: "Всё время", days: null },
];

const ARTICLES_KEY = "expers-articles";
const COMMENTS_KEY = "expers-comments";
const SUBSCRIPTIONS_KEY = "expers-subscriptions";
const FAVORITES_KEY = "expers-favorites";

interface DailyViews {
  date: string;
  views: number;
}

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

function generateDailyViews(
  articles: Article[],
  totalDays: number
): DailyViews[] {
  const result: DailyViews[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const articleStartDates = articles.map((a) => {
    const d = new Date(a.createdAt);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  });
  const earliestStart = articleStartDates.length
    ? new Date(Math.min(...articleStartDates.map((d) => d.getTime())))
    : new Date(today.getTime() - 30 * 86400000);

  const startDate = new Date(
    Math.max(earliestStart.getTime(), today.getTime() - totalDays * 86400000)
  );

  const dayCount = Math.ceil(
    (today.getTime() - startDate.getTime()) / 86400000
  );

  const articleAges = articleStartDates.map(
    (d) => Math.ceil((today.getTime() - d.getTime()) / 86400000) || 1
  );

  for (let i = 0; i <= dayCount; i++) {
    const date = new Date(startDate.getTime() + i * 86400000);
    const dateStr = date.toISOString().split("T")[0];

    let totalViews = 0;
    for (let ai = 0; ai < articles.length; ai++) {
      const daysSinceStart = Math.ceil(
        (date.getTime() - articleStartDates[ai].getTime()) / 86400000
      );
      if (daysSinceStart < 0) continue;

      const recency = Math.max(0, 1 - daysSinceStart / articleAges[ai]);
      const seed = ai * 1000 + i;
      const baseViews = 5 + seededRandom(seed) * 45;
      const decayViews = baseViews * (0.3 + recency * 0.7);
      totalViews += Math.round(decayViews);
    }

    result.push({ date: dateStr, views: totalViews });
  }

  return result;
}

function getPeriodDateRange(days: number | null): { start: Date; end: Date } {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  if (days === null) {
    start.setUTCFullYear(start.getUTCFullYear() - 10);
  } else {
    start.setUTCDate(start.getUTCDate() - days);
  }
  start.setUTCHours(0, 0, 0, 0);
  return { start, end };
}

function computeViewsForRange(
  dailyViews: DailyViews[],
  start: Date,
  end: Date
): number {
  return dailyViews
    .filter((dv) => {
      const d = new Date(dv.date + "T00:00:00Z");
      return d >= start && d <= end;
    })
    .reduce((sum, dv) => sum + dv.views, 0);
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}

function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getDateRangeLabel(days: number | null): string {
  if (days === null) return "за всё время";
  if (days === 7) return "за последние 7 дней";
  if (days === 30) return "за последние 30 дней";
  if (days === 90) return "за последние 90 дней";
  if (days === 365) return "за последний год";
  return `за последние ${days} дней`;
}

function getPrevDateRangeLabel(days: number | null): string {
  if (days === null) return "за предыдущий период";
  if (days === 7) return "за предыдущие 7 дней";
  if (days === 30) return "за предыдущие 30 дней";
  if (days === 90) return "за предыдущие 90 дней";
  if (days === 365) return "за предыдущий год";
  return "за предыдущий период";
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  changePercent: number;
  iconBg: string;
  iconColor: string;
}

function MetricCard({
  icon,
  label,
  value,
  changePercent,
  iconBg,
  iconColor,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex items-center gap-0.5">
          {changePercent > 0 && (
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          )}
          {changePercent < 0 && (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          {changePercent === 0 && (
            <Minus className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span
            className={`text-xs font-medium ${
              changePercent > 0
                ? "text-green-600"
                : changePercent < 0
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            {changePercent > 0 ? "+" : ""}
            {changePercent}%
          </span>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-[#2C3E50]">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ViewsChart({
  dailyViews,
  period,
}: {
  dailyViews: DailyViews[];
  period: Period;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    views: number;
    date: string;
  } | null>(null);

  const chartData = useMemo(() => {
    if (!dailyViews.length) return [];

    const info = PERIODS.find((p) => p.value === period)!;

    if (period === "7d" || period === "30d") {
      return dailyViews.slice(-info.days!);
    }

    if (period === "90d") {
      const weekly: { date: string; views: number }[] = [];
      for (let i = 0; i < dailyViews.length; i += 7) {
        const chunk = dailyViews.slice(i, i + 7);
        const date = chunk[0]?.date ?? "";
        const views = chunk.reduce((s, d) => s + d.views, 0);
        weekly.push({ date, views });
      }
      return weekly;
    }

    if (period === "1y" || period === "all") {
      const monthly: { date: string; views: number }[] = [];
      const monthMap = new Map<string, number>();
      for (const dv of dailyViews) {
        const monthKey = dv.date.slice(0, 7);
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + dv.views);
      }
      for (const [date, views] of monthMap) {
        monthly.push({ date, views });
      }
      return monthly;
    }

    return dailyViews;
  }, [dailyViews, period]);

  const maxViews = Math.max(...chartData.map((d) => d.views), 1);

  const formatDate = (dateStr: string) => {
    if (period === "7d" || period === "30d") {
      const d = new Date(dateStr + "T00:00:00Z");
      return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    }
    if (period === "90d") {
      const d = new Date(dateStr + "T00:00:00Z");
      return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    }
    return dateStr.slice(0, 7);
  };

  if (!chartData.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const SVG_W = 800;
  const SVG_H = 200;
  const PAD = 4;
  const innerW = SVG_W - PAD * 2;
  const innerH = SVG_H - PAD * 2;
  const n = chartData.length;
  const gap = n > 100 ? 1 : n > 30 ? 2 : 3;
  const barW = Math.max(2, (innerW - gap * (n - 1)) / n);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3498DB" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#3498DB" stopOpacity={1} />
          </linearGradient>
        </defs>
        {chartData.map((item, i) => {
          const barH = Math.max(1, (item.views / maxViews) * innerH);
          const x = PAD + i * (barW + gap);
          const y = PAD + innerH - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              fill="url(#barGradient)"
              className="cursor-pointer transition-all duration-200 hover:brightness-[0.7]"
              onMouseEnter={(e) => {
                const r = (
                  e.currentTarget as SVGRectElement
                ).getBoundingClientRect();
                const c = containerRef.current;
                if (!c) return;
                const cr = c.getBoundingClientRect();
                setTooltip({
                  x: r.left + r.width / 2 - cr.left,
                  y: r.top - cr.top,
                  views: item.views,
                  date: formatDate(item.date),
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="absolute pointer-events-none whitespace-nowrap bg-[#2C3E50] text-white text-[10px] px-1.5 py-0.5 rounded z-10 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 4 }}
        >
          {tooltip.views} просмотров
          <br />
          <span className="text-gray-300">{tooltip.date}</span>
        </div>
      )}
    </div>
  );
}

export function AuthorDashboard() {
  const { expert } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");

  const dashboardData = useMemo(() => {
    if (!expert) return null;

    const articles = getArticlesFromStorage(expert.id);
    const articleIds = articles.map((a) => a.id);
    const publicationCount = articles.filter(
      (a) => a.status === "published"
    ).length;
    const commentCount = getCommentCountForArticles(articleIds);
    const subscriberCount = getSubscriberCount();
    const favoriteCount = getFavoriteCountForArticles(articleIds);

    const periodConfig = PERIODS.find((p) => p.value === period)!;
    const { start: curStart, end: curEnd } = getPeriodDateRange(
      periodConfig.days
    );

    const prevPeriodDays = periodConfig.days ?? 3650;
    const prevEnd = new Date(curStart.getTime() - 86400000);
    const prevStart = new Date(prevEnd.getTime() - prevPeriodDays * 86400000);

    const allDays = periodConfig.days ?? 3650;
    const dailyViews = generateDailyViews(articles, allDays + prevPeriodDays);

    const currentViews = computeViewsForRange(dailyViews, curStart, curEnd);
    const previousViews = computeViewsForRange(dailyViews, prevStart, prevEnd);

    const reactions = Math.round(currentViews * 0.08);
    const profileVisits = Math.round(currentViews * 0.15);

    const prevReactions = Math.round(previousViews * 0.08);
    const prevProfileVisits = Math.round(previousViews * 0.15);

    const topArticles = [...articles]
      .filter((a) => a.status === "published")
      .sort((a, b) => {
        const aViews = dailyViews
          .filter((dv) => {
            const articleDate = new Date(a.createdAt);
            const dvDate = new Date(dv.date + "T00:00:00Z");
            return dvDate >= articleDate;
          })
          .reduce((s, dv) => s + dv.views, 0);
        const bViews = dailyViews
          .filter((dv) => {
            const articleDate = new Date(b.createdAt);
            const dvDate = new Date(dv.date + "T00:00:00Z");
            return dvDate >= articleDate;
          })
          .reduce((s, dv) => s + dv.views, 0);
        return bViews - aViews;
      })
      .slice(0, 5);

    const currentPeriodViews = computeViewsForRange(
      dailyViews,
      curStart,
      curEnd
    );

    const recentDailyViews = dailyViews.filter((dv) => {
      const d = new Date(dv.date + "T00:00:00Z");
      return d >= curStart && d <= curEnd;
    });

    const getArticleViews = (article: Article) => {
      const ad = new Date(article.createdAt);
      return dailyViews
        .filter((dv) => {
          const dvDate = new Date(dv.date + "T00:00:00Z");
          return dvDate >= ad && dvDate >= curStart && dvDate <= curEnd;
        })
        .reduce((s, dv) => s + dv.views, 0);
    };

    return {
      publicationCount,
      commentCount,
      subscriberCount,
      favoriteCount,
      currentViews,
      previousViews,
      reactions,
      profileVisits,
      prevReactions,
      prevProfileVisits,
      topArticles,
      recentDailyViews,
      currentPeriodViews,
      getArticleViews,
      periodLabel: getDateRangeLabel(periodConfig.days),
      prevPeriodLabel: getPrevDateRangeLabel(periodConfig.days),
    };
  }, [expert, period]);

  if (!expert || !dashboardData) return null;

  const {
    publicationCount,
    commentCount,
    subscriberCount,
    favoriteCount,
    currentViews,
    previousViews,
    reactions,
    profileVisits,
    prevReactions,
    prevProfileVisits,
    topArticles,
    recentDailyViews,
    getArticleViews,
    periodLabel,
  } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">Дашборд</h2>
          <p className="text-sm text-gray-400">{periodLabel}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-white text-[#2C3E50] shadow-sm"
                  : "text-gray-500 hover:text-[#2C3E50]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Просмотры"
          value={formatNumber(currentViews)}
          changePercent={getChangePercent(currentViews, previousViews)}
          iconBg="bg-blue-100"
          iconColor="text-[#3498DB]"
        />
        <MetricCard
          icon={<FileText className="h-4 w-4" />}
          label="Публикации"
          value={publicationCount}
          changePercent={0}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Подписчики"
          value={subscriberCount}
          changePercent={0}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <MetricCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Комментарии"
          value={commentCount}
          changePercent={0}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          icon={<Heart className="h-4 w-4" />}
          label="Реакции"
          value={formatNumber(reactions)}
          changePercent={getChangePercent(reactions, prevReactions)}
          iconBg="bg-pink-100"
          iconColor="text-pink-500"
        />
        <MetricCard
          icon={<Bookmark className="h-4 w-4" />}
          label="Избранное"
          value={favoriteCount}
          changePercent={0}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-500"
        />
        <MetricCard
          icon={<UserPlus className="h-4 w-4" />}
          label="Переходы в профиль"
          value={formatNumber(profileVisits)}
          changePercent={getChangePercent(profileVisits, prevProfileVisits)}
          iconBg="bg-cyan-100"
          iconColor="text-cyan-600"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#2C3E50]">
            График просмотров
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3498DB]" />
              Текущий период
            </span>
          </div>
        </div>
        <ViewsChart dailyViews={recentDailyViews} period={period} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2C3E50] mb-4">
          Лучшие публикации
        </h3>
        {topArticles.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            Нет опубликованных статей
          </div>
        ) : (
          <div className="space-y-3">
            {topArticles.map((article, i) => {
              const views = getArticleViews(article);
              return (
                <div
                  key={article.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/50 p-3 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2C3E50] text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#2C3E50]">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {article.industryName} ·{" "}
                      {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    {views}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
