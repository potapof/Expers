"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ExpertRow {
  id: string;
  name: string;
  email: string;
  role: string;
  articleCount: number;
  hasPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminExperts() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [regs, setRegs] = useState<Array<{ month: string; count: number }>>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!expert || expert.role !== "admin") {
      router.push("/");
      return;
    }

    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/admin/experts", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/admin/experts/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([data, stats]) => {
        setExperts(data.experts || []);
        setRegs(stats.registrationsByMonth || []);
      })
      .finally(() => setLoading(false));
  }, [expert, authLoading, router]);

  const maxReg = Math.max(1, ...regs.map((d) => d.count));
  const barWidth = Math.max(regs.length * 60, 300);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const totalArticles = experts.reduce((s, e) => s + e.articleCount, 0);
  const payingCount = experts.filter((e) => e.hasPaid).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Эксперты</h1>
        <p className="text-sm text-gray-500 mt-1">
          Всего: {experts.length} · Статей: {totalArticles} · Платящих:{" "}
          {payingCount} · Конверсия:{" "}
          {experts.length > 0
            ? `${((payingCount / experts.length) * 100).toFixed(1)}%`
            : "0%"}
        </p>
      </div>

      {regs.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Регистрации по месяцам
          </h3>
          <svg width="100%" height={140} viewBox={`0 0 ${barWidth} 140`}>
            {regs.map((d, i) => {
              const x = i * 60 + 30;
              const h = (d.count / maxReg) * 100;
              return (
                <g key={d.month}>
                  <rect
                    x={x}
                    y={110 - h}
                    width={40}
                    height={h}
                    rx={3}
                    fill="#7c3aed"
                    opacity={0.8}
                  />
                  <text
                    x={x + 20}
                    y={130}
                    fontSize={10}
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                  {d.count > 0 && (
                    <text
                      x={x + 20}
                      y={106 - h}
                      fontSize={9}
                      fill="#6d28d9"
                      textAnchor="middle"
                    >
                      {d.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Статей</th>
                <th className="px-4 py-3 font-medium">Платящий</th>
                <th className="px-4 py-3 font-medium">Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {experts.map((e) => (
                <tr
                  key={e.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500">{e.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        e.role === "admin"
                          ? "destructive"
                          : e.role === "expert"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {e.role === "admin"
                        ? "Админ"
                        : e.role === "expert"
                          ? "Эксперт"
                          : "Читатель"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{e.articleCount}</td>
                  <td className="px-4 py-3">
                    {e.hasPaid ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Да
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {e.createdAt.split("T")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
