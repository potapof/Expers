"use client";

import { useCallback, useSyncExternalStore } from "react";

export type TransactionType = "accrual" | "payout";

export type TransactionStatus = "completed" | "pending" | "cancelled";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  date: string;
}

export type DocType = "invoice" | "act" | "legal";

export interface Document {
  id: string;
  type: DocType;
  number: string;
  title: string;
  date: string;
  amount: number;
  status: "issued" | "paid" | "signed";
  url: string;
}

const STORAGE_KEY = "expers-finance";

interface FinanceData {
  balance: number;
  transactions: Transaction[];
  documents: Document[];
}

function getDefaultData(): FinanceData {
  const today = new Date();
  const d = (offset: number) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - offset);
    return date.toISOString().split("T")[0];
  };

  return {
    balance: 45000,
    transactions: [
      {
        id: "tx-1",
        type: "accrual",
        amount: 15000,
        status: "completed",
        description: "Начисление за публикацию «AI в производстве»",
        date: d(2),
      },
      {
        id: "tx-2",
        type: "accrual",
        amount: 15000,
        status: "completed",
        description: "Начисление за публикацию «Финансовый анализ 2025»",
        date: d(5),
      },
      {
        id: "tx-3",
        type: "payout",
        amount: 20000,
        status: "completed",
        description: "Выплата на расчётный счёт",
        date: d(10),
      },
      {
        id: "tx-4",
        type: "accrual",
        amount: 15000,
        status: "completed",
        description: "Начисление за публикацию «Тренды в IT»",
        date: d(15),
      },
      {
        id: "tx-5",
        type: "accrual",
        amount: 30000,
        status: "completed",
        description: "Начисление за публикацию «Энергетика будущего»",
        date: d(20),
      },
      {
        id: "tx-6",
        type: "payout",
        amount: 10000,
        status: "completed",
        description: "Выплата на карту",
        date: d(25),
      },
      {
        id: "tx-7",
        type: "accrual",
        amount: 15000,
        status: "pending",
        description: "Начисление за публикацию «Управление рисками»",
        date: d(1),
      },
      {
        id: "tx-8",
        type: "accrual",
        amount: 15000,
        status: "completed",
        description: "Начисление за публикацию «Логистика 2025»",
        date: d(30),
      },
    ],
    documents: [
      {
        id: "doc-1",
        type: "invoice",
        number: "СЧ-2025-001",
        title: "Счёт на оплату публикации «AI в производстве»",
        date: d(2),
        amount: 15000,
        status: "paid",
        url: "#",
      },
      {
        id: "doc-2",
        type: "act",
        number: "АКТ-2025-001",
        title: "Акт выполненных работ — «AI в производстве»",
        date: d(2),
        amount: 15000,
        status: "signed",
        url: "#",
      },
      {
        id: "doc-3",
        type: "invoice",
        number: "СЧ-2025-002",
        title: "Счёт на оплату публикации «Финансовый анализ 2025»",
        date: d(5),
        amount: 15000,
        status: "paid",
        url: "#",
      },
      {
        id: "doc-4",
        type: "act",
        number: "АКТ-2025-002",
        title: "Акт выполненных работ — «Финансовый анализ 2025»",
        date: d(5),
        amount: 15000,
        status: "signed",
        url: "#",
      },
      {
        id: "doc-5",
        type: "invoice",
        number: "СЧ-2025-003",
        title: "Счёт на оплату публикации «Тренды в IT»",
        date: d(15),
        amount: 15000,
        status: "paid",
        url: "#",
      },
      {
        id: "doc-6",
        type: "legal",
        number: "Д-2025-001",
        title: "Договор публичной оферты",
        date: "2025-01-01",
        amount: 0,
        status: "signed",
        url: "#",
      },
      {
        id: "doc-7",
        type: "legal",
        number: "Д-2025-002",
        title: "Лицензионный договор",
        date: "2025-01-01",
        amount: 0,
        status: "signed",
        url: "#",
      },
      {
        id: "doc-8",
        type: "legal",
        number: "Д-2025-003",
        title: "Соглашение о конфиденциальности",
        date: "2025-01-01",
        amount: 0,
        status: "signed",
        url: "#",
      },
      {
        id: "doc-9",
        type: "invoice",
        number: "СЧ-2025-004",
        title: "Счёт на оплату публикации «Управление рисками»",
        date: d(1),
        amount: 15000,
        status: "issued",
        url: "#",
      },
    ],
  };
}

function getSnapshot(): FinanceData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FinanceData;
      return parsed;
    }
    const def = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
    return def;
  } catch {
    return getDefaultData();
  }
}

function subscribe(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useFinance() {
  const data = useSyncExternalStore(subscribe, getSnapshot);

  const save = useCallback((newData: FinanceData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  const totalAccruals = data.transactions
    .filter((t) => t.type === "accrual" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = data.transactions
    .filter((t) => t.type === "payout" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAccruals = data.transactions
    .filter((t) => t.type === "accrual" && t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    data,
    totalAccruals,
    totalPayouts,
    pendingAccruals,
    save,
  };
}
