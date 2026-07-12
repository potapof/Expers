"use client";

import { useCallback, useEffect, useState } from "react";

export type PaymentStatus =
  | "NEW"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELED"
  | "REFUNDED";

export interface PaymentRecord {
  orderId: string;
  articleId: string;
  title: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

const AUTH_EVENT = "expers-auth-changed";

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setPayments([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments ?? []);
      }
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const handler = () => fetchPayments();
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  }, [fetchPayments]);

  const paidPayments = payments.filter((p) => p.status === "CONFIRMED");
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "NEW").length;

  return {
    payments,
    loading,
    totalPaid,
    publishedCount: paidPayments.length,
    pendingCount,
    refresh: fetchPayments,
  };
}
