"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface ArticleRow {
  id: string;
  title: string;
  authorName: string;
  industryName: string;
  status: string;
  createdAt: string;
  readTime: string;
}

interface ArticlesData {
  articles: ArticleRow[];
  total: number;
}

export function AdminArticles() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ArticlesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [publications, setPublications] = useState<
    Array<{ date: string; count: number }>
  >([]);
  const pageSize = 20;

  const fetchData = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort,
      order,
    });
    if (status) params.set("status", status);

    fetch(`/api/admin/articles?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));

    fetch(`/api/admin/articles/stats?days=30`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setPublications(d.publicationsByDay || []));
  }, [page, status, sort, order]);

  useEffect(() => {
    if (authLoading) return;
    if (!expert || expert.role !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [expert, authLoading, router, fetchData]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const maxPub = Math.max(1, ...publications.map((d) => d.count));
  const barWidth = Math.max(publications.length * 14, 300);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Статьи</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `Всего: ${data.total}` : "Загрузка..."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const csv = data?.articles
              .map((a) =>
                [
                  a.title,
                  a.authorName,
                  a.industryName,
                  a.status,
                  a.createdAt.split("T")[0],
                ].join(",")
              )
              .join("\n");
            if (csv) {
              const blob = new Blob(
                ["Название,Автор,Отрасль,Статус,Дата\n" + csv],
                { type: "text/csv" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "articles.csv";
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          CSV
        </Button>
      </div>

      {publications.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Публикации по дням (30 дн.)
          </h3>
          <svg width="100%" height={140} viewBox={`0 0 ${barWidth} 140`}>
            {publications.map((d, i) => {
              const x = i * 14 + 15;
              const h = (d.count / maxPub) * 100;
              return (
                <g key={d.date}>
                  <rect
                    x={x}
                    y={110 - h}
                    width={10}
                    height={h}
                    rx={2}
                    fill="#0039CA"
                    opacity={0.8}
                  />
                  {i % 7 === 0 && (
                    <text x={x} y={130} fontSize={8} fill="#9ca3af">
                      {d.date.slice(5)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="">Все статусы</option>
          <option value="published">Опубликованы</option>
          <option value="draft">Черновики</option>
          <option value="pending_review">На модерации</option>
          <option value="pending_payment">Ожидают оплаты</option>
          <option value="archived">Архив</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="created_at">По дате</option>
          <option value="title">По названию</option>
          <option value="read_time">По времени чтения</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="desc">Сначала новые</option>
          <option value="asc">Сначала старые</option>
        </select>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Автор</th>
                <th className="px-4 py-3 font-medium">Отрасль</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Время чтения</th>
                <th className="px-4 py-3 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.articles.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 max-w-[300px] truncate font-medium">
                        {a.title}
                      </td>
                      <td className="px-4 py-3">{a.authorName}</td>
                      <td className="px-4 py-3">{a.industryName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400">{a.readTime}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {a.createdAt.split("T")[0]}
                      </td>
                    </tr>
                  ))}
              {!loading && data?.articles.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Статьи не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
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
