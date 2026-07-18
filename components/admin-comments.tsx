"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface CommentRow {
  id: string;
  articleId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  articleTitle: string;
}

interface CommentsData {
  comments: CommentRow[];
  total: number;
}

export function AdminComments() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CommentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchData = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.set("search", search);

    fetch(`/api/admin/comments?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    if (authLoading) return;
    if (!expert || expert.role !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [expert, authLoading, router, fetchData]);

  async function handleDelete(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/comments?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success("Комментарий удалён");
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Ошибка удаления");
    }
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Комментарии</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data ? `Всего: ${data.total}` : "Загрузка..."}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Поиск по тексту..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Автор</th>
                <th className="px-4 py-3 font-medium">Текст</th>
                <th className="px-4 py-3 font-medium">Статья</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.comments.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">{c.authorName}</td>
                      <td className="px-4 py-3 max-w-[400px]">
                        <p className="truncate">{c.text}</p>
                      </td>
                      <td className="px-4 py-3 text-blue-600 max-w-[200px] truncate">
                        {c.articleTitle}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {c.createdAt.split("T")[0]}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Удалить комментарий?"))
                              handleDelete(c.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              {!loading && data?.comments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Комментарии не найдены
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
