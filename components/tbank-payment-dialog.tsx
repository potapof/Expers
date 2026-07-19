"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

const INTEGRATION_SCRIPT_URL =
  "https://integrationjs.t-static.ru/integration.js";

interface IframeIntegrationInstance {
  connect: (el: HTMLIFrameElement) => Promise<void>;
}

interface PaymentIntegrationRoot {
  iframe: {
    create: (name: string) => Promise<IframeIntegrationInstance>;
  };
}

declare global {
  interface Window {
    PaymentIntegration?: {
      init: (config: {
        terminalKey: string;
        product: string;
        features: { iframe: Record<string, never> };
      }) => Promise<PaymentIntegrationRoot>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
let integrationPromise: Promise<PaymentIntegrationRoot> | null = null;

function loadIntegrationScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.PaymentIntegration) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = INTEGRATION_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Не удалось загрузить платёжный скрипт"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

async function getIntegration(
  terminalKey: string
): Promise<PaymentIntegrationRoot> {
  await loadIntegrationScript();
  if (!window.PaymentIntegration) {
    throw new Error("PaymentIntegration недоступен");
  }
  if (!integrationPromise) {
    integrationPromise = window.PaymentIntegration.init({
      terminalKey,
      product: "eacq",
      features: { iframe: {} },
    });
  }
  return integrationPromise;
}

export function TbankPaymentDialog({
  open,
  paymentUrl,
  orderId,
  onOpenChange,
  onConfirmed,
  onRejected,
}: {
  open: boolean;
  paymentUrl: string;
  orderId: string;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
  onRejected: (message: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameReady, setFrameReady] = useState(false);
  const connectedRef = useRef(false);
  const mountKeyRef = useRef(0);

  useEffect(() => {
    if (!open || !paymentUrl) return;
    connectedRef.current = false;
    mountKeyRef.current++;
    const mountKey = mountKeyRef.current;

    let cancelled = false;

    const timer = setTimeout(() => {
      const el = iframeRef.current;
      if (!el || mountKey !== mountKeyRef.current) return;
      el.src = paymentUrl;
      setFrameReady(true);
    }, 50);

    async function connectWidget() {
      const terminalKey = process.env.NEXT_PUBLIC_TBANK_TERMINAL_KEY;
      if (!terminalKey) return;

      try {
        const integration = await getIntegration(terminalKey);
        if (
          cancelled ||
          connectedRef.current ||
          mountKey !== mountKeyRef.current
        )
          return;
        const instance = await integration.iframe.create(`pay-${orderId}`);
        if (cancelled || !iframeRef.current || mountKey !== mountKeyRef.current)
          return;
        await instance.connect(iframeRef.current);
        connectedRef.current = true;
      } catch {
        /* виджет не обязателен: iframe с PaymentURL работает сам по себе */
      }
    }

    connectWidget();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, paymentUrl, orderId]);

  function handleDialogClose(open: boolean) {
    if (!open) {
      connectedRef.current = false;
      setFrameReady(false);
    }
    onOpenChange(open);
  }

  useEffect(() => {
    if (!open || !orderId) return;

    let stopped = false;
    const token = localStorage.getItem("token");

    async function poll() {
      if (stopped) return;
      try {
        const res = await fetch(
          `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const data = await res.json();
          if (stopped) return;
          if (data.status === "CONFIRMED") {
            stopped = true;
            onConfirmed();
            return;
          }
          if (data.status === "REJECTED" || data.status === "CANCELED") {
            stopped = true;
            onRejected(
              data.status === "REJECTED"
                ? "Платёж отклонён банком"
                : "Платёж отменён"
            );
            return;
          }
        }
      } catch {
        /* сеть мигнула — продолжаем опрос */
      }
      if (!stopped) setTimeout(poll, 3000);
    }

    const t = setTimeout(poll, 3000);
    return () => {
      stopped = true;
      clearTimeout(t);
    };
  }, [open, orderId, onConfirmed, onRejected]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle>Оплата права публикации — 5 000 ₽</DialogTitle>
        </DialogHeader>
        <div className="relative bg-gray-50">
          {!frameReady && (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Платёжная форма Т-Банка"
            className="w-full border-0"
            style={{ height: 640, display: frameReady ? "block" : "none" }}
            allow="payment"
          />
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t bg-white">
          <p className="text-xs text-gray-400">
            Безопасная оплата через Т-Банк. Статус обновится автоматически.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gray-500 shrink-0"
            onClick={() => window.open(paymentUrl, "_blank", "noopener")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Открыть отдельно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
