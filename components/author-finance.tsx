"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, Clock, XCircle, Wallet } from "lucide-react";
import { usePayments, type PaymentStatus } from "@/lib/use-finance";
import { TbankPaymentDialog } from "./tbank-payment-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PUBLICATION_PRICE = 5000;

function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />;
}

function formatRub(kopecks: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(kopecks / 100));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: "Оплачено",
    className: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  NEW: {
    label: "Ожидает оплаты",
    className: "bg-orange-100 text-orange-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: "Отклонено",
    className: "bg-red-100 text-red-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  CANCELED: {
    label: "Отменено",
    className: "bg-gray-100 text-gray-600",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  REFUNDED: {
    label: "Возврат",
    className: "bg-gray-100 text-gray-600",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export function AuthorFinance() {
  const {
    payments,
    loading,
    totalPaid,
    publishedCount,
    pendingCount,
    refresh,
  } = usePayments();
  const [payDialog, setPayDialog] = useState<{
    paymentUrl: string;
    orderId: string;
  } | null>(null);
  const [payingArticleId, setPayingArticleId] = useState<string | null>(null);
  const [isBuyingRight, setIsBuyingRight] = useState(false);

  async function handlePay(articleId: string) {
    setPayingArticleId(articleId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ articleId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPayDialog({ paymentUrl: data.paymentUrl, orderId: data.orderId });
      } else {
        const err = await res.json();
        toast.error(err.error || "Ошибка инициализации платежа");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setPayingArticleId(null);
    }
  }

  function handlePaymentConfirmed() {
    setPayDialog(null);
    toast.success("Оплата получена! Статья отправлена на модерацию.");
    refresh();
  }

  function handlePaymentRejected(message: string) {
    setPayDialog(null);
    toast.error(message || "Платёж не прошёл.");
    refresh();
  }

  async function handleBuyRight() {
    setIsBuyingRight(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/payments/buy-right", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPayDialog({ paymentUrl: data.paymentUrl, orderId: data.orderId });
      } else {
        const err = await res.json();
        toast.error(err.error || "Ошибка инициализации платежа");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setIsBuyingRight(false);
    }
  }

  function handleRightConfirmed() {
    setPayDialog(null);
    toast.success("Оплата получена! Публикация оплачена.");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#2C3E50]">
          Платежи за публикации
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Публикация статьи на Expers стоит{" "}
          {PUBLICATION_PRICE.toLocaleString("ru-RU")} ₽. Здесь — история ваших
          платежей.
        </p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-[#0039CA]/20 bg-gradient-to-r from-[#0039CA]/5 to-transparent p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2C3E50]">
            {totalPaid === 0
              ? "Право публикации ещё не приобретено"
              : "Оплата публикации"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalPaid === 0
              ? `Оплатите ${PUBLICATION_PRICE.toLocaleString("ru-RU")} ₽, чтобы открыть доступ к GEO-визарду и публикации статей.`
              : `Оплатите ${PUBLICATION_PRICE.toLocaleString("ru-RU")} ₽ за публикацию. Количество оплат не ограничено.`}
          </p>
        </div>
        <Button
          onClick={handleBuyRight}
          disabled={isBuyingRight}
          className="bg-[#0039CA] hover:bg-[#002b8e] text-white shrink-0"
        >
          <CreditCard className="h-4 w-4 mr-1.5" />
          {isBuyingRight
            ? "Загрузка..."
            : `Купить за ${PUBLICATION_PRICE.toLocaleString("ru-RU")} ₽`}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Всего оплачено
            </span>
          </div>
          {loading ? (
            <Bar className="h-8 w-24" />
          ) : (
            <span className="text-2xl font-bold text-[#2C3E50]">
              {formatRub(totalPaid)} ₽
            </span>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Опубликовано
            </span>
          </div>
          {loading ? (
            <Bar className="h-8 w-12" />
          ) : (
            <span className="text-2xl font-bold text-[#2C3E50]">
              {publishedCount}
            </span>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Ожидает оплаты
            </span>
          </div>
          {loading ? (
            <Bar className="h-8 w-12" />
          ) : (
            <span className="text-2xl font-bold text-[#2C3E50]">
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#2C3E50]">
            История платежей
          </h3>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Платежей пока нет</p>
            <Link
              href="/articles/new"
              className="mt-3 text-sm text-[#0039CA] hover:underline"
            >
              Опубликовать статью
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {payments.map((p) => {
              const meta = STATUS_META[p.status];
              return (
                <li
                  key={p.orderId}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/articles/${p.articleId}`}
                      className="text-sm font-medium text-[#2C3E50] hover:text-[#0039CA] transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#2C3E50] whitespace-nowrap">
                    {formatRub(p.amount)} ₽
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                  {p.status === "NEW" && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={payingArticleId === p.articleId}
                      onClick={() => handlePay(p.articleId)}
                      className="h-8 text-xs shrink-0"
                    >
                      {payingArticleId === p.articleId
                        ? "Загрузка..."
                        : "Оплатить"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <TbankPaymentDialog
        open={!!payDialog}
        paymentUrl={payDialog?.paymentUrl || ""}
        orderId={payDialog?.orderId || ""}
        onOpenChange={(open) => {
          if (!open) setPayDialog(null);
        }}
        onConfirmed={
          payDialog?.orderId.startsWith("right-")
            ? handleRightConfirmed
            : handlePaymentConfirmed
        }
        onRejected={handlePaymentRejected}
      />
    </div>
  );
}
