"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  useAuthorSubscribers,
  getSubscriberGrowthData,
  getSubscriberChange,
} from "@/lib/use-subscribers";
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { useSubscriptions } from "@/lib/use-subscriptions";

type Period = "7d" | "30d" | "90d" | "all";

const PERIODS: { value: Period; label: string; days: number }[] = [
  { value: "7d", label: "7 дней", days: 7 },
  { value: "30d", label: "30 дней", days: 30 },
  { value: "90d", label: "90 дней", days: 90 },
  { value: "all", label: "Всё время", days: 9999 },
];

function GrowthChart({
  data,
  period,
}: {
  data: { date: string; count: number }[];
  period: Period;
}) {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    if (period === "7d" || period === "30d") {
      return data;
    }

    if (period === "90d") {
      const weekly: { date: string; count: number }[] = [];
      for (let i = 0; i < data.length; i += 7) {
        const chunk = data.slice(i, i + 7);
        const date = chunk[0]?.date ?? "";
        const count = chunk.reduce((s, d) => s + d.count, 0);
        weekly.push({ date, count });
      }
      return weekly;
    }

    const monthly: { date: string; count: number }[] = [];
    const monthMap = new Map<string, number>();
    for (const d of data) {
      const monthKey = d.date.slice(0, 7);
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + d.count);
    }
    for (const [date, count] of monthMap) {
      monthly.push({ date, count });
    }
    return monthly;
  }, [data, period]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const formatDate = (dateStr: string) => {
    if (period === "7d" || period === "30d" || period === "90d") {
      const d = new Date(dateStr + "T00:00:00Z");
      return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    }
    return dateStr.slice(0, 7);
  };

  if (!chartData.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const barWidth = Math.max(
    4,
    Math.min(40, Math.floor(600 / chartData.length))
  );

  return (
    <div className="flex items-end gap-[3px] h-32">
      {chartData.map((item, i) => {
        const height = Math.max(4, (item.count / maxCount) * 120);
        return (
          <div
            key={i}
            className="relative group flex-1"
            style={{ maxWidth: barWidth }}
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-[#1ABC9C]/60 to-[#1ABC9C] transition-all duration-200 group-hover:from-[#2C3E50]/60 group-hover:to-[#2C3E50] cursor-pointer"
              style={{ height: `${height}px`, minHeight: "4px" }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-[#2C3E50] text-white text-[10px] px-1.5 py-0.5 rounded z-10">
              +{item.count}
              <br />
              <span className="text-gray-300">{formatDate(item.date)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00Z");
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

export function AuthorSubscribers() {
  const { expert } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");
  const { subscribers } = useAuthorSubscribers(expert?.id);
  const { isSubscribed, toggleSubscription } = useSubscriptions();

  const stats = useMemo(() => {
    const periodConfig = PERIODS.find((p) => p.value === period)!;
    const growth = getSubscriberGrowthData(subscribers, periodConfig.days);
    const change = getSubscriberChange(subscribers, periodConfig.days);
    return { ...growth, change };
  }, [subscribers, period]);

  if (!expert) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">Подписчики</h2>
          <p className="text-sm text-gray-400">
            {stats.total}{" "}
            {stats.total === 1
              ? "подписчик"
              : stats.total < 5
                ? "подписчика"
                : "подписчиков"}
          </p>
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

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 mb-2">
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-[#2C3E50]">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-0.5">Всего подписчиков</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 mb-2">
            <UserPlus className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-[#2C3E50]">
            +{stats.newThisPeriod}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Новых за период</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full mb-2 bg-gray-100">
            {stats.change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stats.change < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <p
              className={`text-2xl font-bold ${
                stats.change > 0
                  ? "text-green-600"
                  : stats.change < 0
                    ? "text-red-500"
                    : "text-[#2C3E50]"
              }`}
            >
              {stats.change > 0 ? "+" : ""}
              {stats.change}%
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.change > 0
              ? "Рост"
              : stats.change < 0
                ? "Падение"
                : "Без изменений"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-[#2C3E50] mb-4">
          График прироста подписчиков
        </h3>
        <GrowthChart data={stats.daily} period={period} />
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-[#2C3E50] mb-1">
            Нет подписчиков
          </h3>
          <p className="text-sm text-gray-400">
            Когда читатели подпишутся на вас, они появятся здесь
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#2C3E50]">
            Список подписчиков
          </h3>
          {subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
            >
              <Link
                href={`/expert/${subscriber.id}`}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3498DB] text-white text-sm font-bold">
                  {subscriber.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2C3E50] truncate">
                    {subscriber.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Подписался {formatRelativeDate(subscriber.subscribedAt)}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/expert/${subscriber.id}`}
                  className="flex items-center gap-1 text-xs text-[#3498DB] hover:text-[#2980B9] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Профиль
                </Link>
                {isSubscribed(subscriber.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast(`Отписаться от ${subscriber.name}?`, {
                        action: {
                          label: "Отписаться",
                          onClick: () => {
                            toggleSubscription(subscriber.id);
                            toast.success("Вы отписались");
                          },
                        },
                        cancel: { label: "Отмена", onClick: () => {} },
                      });
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <UserMinus className="h-3 w-3" />
                    Отписаться
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      toggleSubscription(subscriber.id);
                      toast.success(`Вы подписались на ${subscriber.name}`);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#3498DB] hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus className="h-3 w-3" />
                    Подписаться
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
