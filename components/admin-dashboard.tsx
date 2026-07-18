"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalArticles: number;
  pendingReview: number;
  publishedToday: number;
  totalExperts: number;
  payingExperts: number;
  revenueMonth: number;
  publicationsByDay: Array<{ date: string; count: number }>;
  revenueByMonth: Array<{ month: string; total: number }>;
  recentArticles: Array<{
    id: string;
    title: string;
    authorName: string;
    status: string;
    createdAt: string;
  }>;
}

export function AdminDashboard() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!expert || expert.role !== "admin") {
      router.push("/");
      return;
    }

    const token = localStorage.getItem("token");
    fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [expert, authLoading, router]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <div className="text-red-500">Ошибка загрузки данных</div>;
  }

  const cards = [
    {
      label: "Всего статей",
      value: data.totalArticles,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "На модерации",
      value: data.pendingReview,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Опубликовано сегодня",
      value: data.publishedToday,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Экспертов",
      value: data.totalExperts,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Платящих",
      value: data.payingExperts,
      icon: CreditCard,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Выручка за месяц",
      value: `${(data.revenueMonth / 100).toLocaleString("ru-RU")} ₽`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      raw: true,
    },
  ];

  const maxPub = Math.max(1, ...data.publicationsByDay.map((d) => d.count));
  const pubHeight = 120;
  const maxRev = Math.max(1, ...data.revenueByMonth.map((d) => d.total / 100));
  const revHeight = 120;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-sm text-gray-500 mt-1">Общая статистика платформы</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-4 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Публикации по дням (30 дн.)
          </h3>
          <svg
            width="100%"
            height={pubHeight + 40}
            viewBox={`0 0 ${Math.max(data.publicationsByDay.length * 12, 300)} ${pubHeight + 40}`}
          >
            {data.publicationsByDay.map((d, i) => {
              const x = i * 12 + 20;
              const h = (d.count / maxPub) * pubHeight;
              return (
                <g key={d.date}>
                  <rect
                    x={x}
                    y={pubHeight - h + 10}
                    width={8}
                    height={h}
                    rx={2}
                    fill="#0039CA"
                    opacity={0.8}
                  />
                  {i % 7 === 0 && (
                    <text
                      x={x}
                      y={pubHeight + 28}
                      fontSize={8}
                      fill="#9ca3af"
                      textAnchor="start"
                    >
                      {d.date.slice(5)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Выручка по месяцам
          </h3>
          <svg
            width="100%"
            height={revHeight + 40}
            viewBox={`0 0 ${Math.max(data.revenueByMonth.length * 60, 300)} ${revHeight + 40}`}
          >
            {data.revenueByMonth.map((d, i) => {
              const x = i * 60 + 30;
              const h = (d.total / 100 / maxRev) * revHeight;
              return (
                <g key={d.month}>
                  <rect
                    x={x}
                    y={revHeight - h + 10}
                    width={40}
                    height={h}
                    rx={3}
                    fill="#1abc9c"
                    opacity={0.8}
                  />
                  <text
                    x={x + 20}
                    y={revHeight + 28}
                    fontSize={9}
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                  <text
                    x={x + 20}
                    y={revHeight - h + 6}
                    fontSize={8}
                    fill="#059669"
                    textAnchor="middle"
                  >
                    {d.total > 0
                      ? `${(d.total / 100).toLocaleString("ru-RU")}`
                      : ""}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Последние 10 статей
          </h3>
          <Link
            href="/admin/articles"
            className="text-xs text-blue-600 hover:underline"
          >
            Все статьи
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Название</th>
                <th className="pb-2 font-medium">Автор</th>
                <th className="pb-2 font-medium">Статус</th>
                <th className="pb-2 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.recentArticles.map((a) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-2 pr-4 max-w-[300px] truncate">
                    {a.title}
                  </td>
                  <td className="py-2 pr-4">{a.authorName}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-2 text-gray-400">
                    {a.createdAt.split("T")[0]}
                  </td>
                </tr>
              ))}
              {data.recentArticles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    Нет статей
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "outline" | "destructive";
    }
  > = {
    published: { label: "Опубликована", variant: "default" },
    draft: { label: "Черновик", variant: "secondary" },
    pending_review: { label: "На модерации", variant: "outline" },
    pending_payment: { label: "Ожидает оплаты", variant: "outline" },
    archived: { label: "Архив", variant: "secondary" },
  };

  const v = variants[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
