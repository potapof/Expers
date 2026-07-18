"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  authorName: string;
  industryName: string;
  createdAt: string;
}

export function AdminModeration() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<Article | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function fetchQueue() {
    const token = localStorage.getItem("token");
    fetch("/api/admin/moderation/queue", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setPendingCount(data.pendingCount || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!expert || expert.role !== "admin") {
      router.push("/");
      return;
    }
    fetchQueue();
  }, [expert, authLoading, router]);

  async function handleApprove(articleId: string) {
    const card = articles.find((a) => a.id === articleId);
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    setPendingCount((c) => c - 1);

    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/moderation/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId }),
    });

    if (res.ok) {
      toast.success(`Статья «${card?.title}» одобрена`);
    } else {
      toast.error("Ошибка одобрения");
      fetchQueue();
    }
  }

  async function handleReject() {
    if (!rejecting || !rejectReason.trim()) return;
    const card = { ...rejecting };

    setArticles((prev) => prev.filter((a) => a.id !== card.id));
    setPendingCount((c) => c - 1);
    setRejecting(null);

    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/moderation/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId: card.id, reason: rejectReason }),
    });

    if (res.ok) {
      toast.success(`Статья «${card.title}» отклонена`);
    } else {
      toast.error("Ошибка отклонения");
      fetchQueue();
    }
    setRejectReason("");
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация</h1>
          <p className="text-sm text-gray-500 mt-1">
            На модерации:{" "}
            <Badge variant="outline" className="ml-1">
              {pendingCount}
            </Badge>
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
          <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-400" />
          <p>Нет статей на модерации</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((a) => {
            const isExpanded = expanded.has(a.id);
            return (
              <div key={a.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {a.authorName} · {a.industryName} ·{" "}
                      {a.createdAt.split("T")[0]}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {a.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(a.id)}
                      className="text-gray-400"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(a.id)}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejecting(a);
                        setRejectReason("");
                      }}
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Отклонить
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {a.content || "Контент отсутствует"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!rejecting}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить статью</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Укажите причину отклонения для статьи «{rejecting?.title}»
            </p>
            <Textarea
              placeholder="Причина отклонения..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRejecting(null)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Отклонить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
