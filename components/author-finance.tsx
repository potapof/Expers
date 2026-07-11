"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Receipt,
  Scale,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useFinance, type Transaction, type Document } from "@/lib/use-finance";

type FinanceView = "overview" | "accruals" | "payouts" | "invoices" | "legal";

function formatAmount(amount: number): string {
  return amount.toLocaleString("ru-RU") + " ₽";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TRANSACTION_STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  completed: {
    label: "Завершена",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-green-600",
  },
  pending: {
    label: "Ожидает",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-amber-600",
  },
  cancelled: {
    label: "Отменена",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "text-red-500",
  },
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  invoice: "Счёт",
  act: "Акт",
  legal: "Юридический документ",
};

const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  issued: "Выставлен",
  paid: "Оплачен",
  signed: "Подписан",
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const statusCfg = TRANSACTION_STATUS_CONFIG[tx.status];
  const isCredited = tx.type === "accrual";

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/50 p-3 hover:bg-gray-100/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isCredited ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isCredited ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2C3E50]">
            {tx.description}
          </p>
          <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 ml-3">
        <span
          className={`text-sm font-semibold ${
            isCredited ? "text-green-600" : "text-red-500"
          }`}
        >
          {isCredited ? "+" : "-"}
          {formatAmount(tx.amount)}
        </span>
        <span className={`flex items-center gap-1 text-xs ${statusCfg.color}`}>
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type];

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/50 p-3 hover:bg-gray-100/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
          {doc.type === "invoice" ? (
            <Receipt className="h-4 w-4 text-[#3498DB]" />
          ) : doc.type === "act" ? (
            <FileText className="h-4 w-4 text-teal-600" />
          ) : (
            <Scale className="h-4 w-4 text-purple-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#2C3E50]">
            {doc.title}
          </p>
          <p className="text-xs text-gray-400">
            {typeLabel} · {doc.number} · {formatDate(doc.date)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 ml-3">
        {doc.amount > 0 && (
          <span className="text-sm text-gray-500">
            {formatAmount(doc.amount)}
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {DOCUMENT_STATUS_LABELS[doc.status]}
        </span>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
          onClick={() => {}}
        >
          <Download className="h-3 w-3" />
          Скачать
        </button>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data, totalAccruals, totalPayouts, pendingAccruals } = useFinance();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-3 mb-1">
          <Wallet className="h-5 w-5 text-[#3498DB]" />
          <span className="text-sm text-gray-500">Текущий баланс</span>
        </div>
        <p className="text-3xl font-bold text-[#2C3E50] mt-1">
          {formatAmount(data.balance)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Всего начислено</p>
            <p className="text-sm font-semibold text-green-600">
              +{formatAmount(totalAccruals)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Всего выплачено</p>
            <p className="text-sm font-semibold text-red-500">
              -{formatAmount(totalPayouts)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ожидают начисления</p>
            <p className="text-sm font-semibold text-amber-600">
              +{formatAmount(pendingAccruals)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">
          Последние транзакции
        </h3>
        <div className="space-y-2">
          {data.transactions.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionList({ type }: { type: "accrual" | "payout" }) {
  const { data } = useFinance();
  const transactions = data.transactions.filter((tx) => tx.type === type);
  const total = transactions
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          {type === "accrual" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-500">
            {type === "accrual" ? "Всего начислено" : "Всего выплачено"}
          </span>
          <span
            className={`ml-auto text-lg font-bold ${
              type === "accrual" ? "text-green-600" : "text-red-500"
            }`}
          >
            {type === "accrual" ? "+" : "-"}
            {formatAmount(total)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            {type === "accrual" ? "Нет начислений" : "Нет выплат"}
          </div>
        ) : (
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}

function InvoicesTab() {
  const { data } = useFinance();
  const invoices = data.documents.filter(
    (doc) => doc.type === "invoice" || doc.type === "act"
  );

  if (invoices.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        Нет счетов и актов
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

function LegalTab() {
  const { data } = useFinance();
  const legalDocs = data.documents.filter((doc) => doc.type === "legal");

  if (legalDocs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        Нет юридических документов
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {legalDocs.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

export function AuthorFinance() {
  const [view, setView] = useState<FinanceView>("overview");

  const tabs: { value: FinanceView; label: string; icon: React.ReactNode }[] = [
    {
      value: "overview",
      label: "Баланс",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      value: "accruals",
      label: "Начисления",
      icon: <ArrowUpRight className="h-4 w-4" />,
    },
    {
      value: "payouts",
      label: "Выплаты",
      icon: <ArrowDownRight className="h-4 w-4" />,
    },
    {
      value: "invoices",
      label: "Счета и акты",
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      value: "legal",
      label: "Юридические документы",
      icon: <Scale className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#2C3E50]">
          Финансы и документы
        </h2>
        <p className="text-sm text-gray-400">
          Баланс, начисления, выплаты, счета, акты и юридические документы
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setView(tab.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              view === tab.value
                ? "bg-white text-[#2C3E50] shadow-sm"
                : "text-gray-500 hover:text-[#2C3E50]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {view === "overview" && <OverviewTab />}
      {view === "accruals" && <TransactionList type="accrual" />}
      {view === "payouts" && <TransactionList type="payout" />}
      {view === "invoices" && <InvoicesTab />}
      {view === "legal" && <LegalTab />}
    </div>
  );
}
