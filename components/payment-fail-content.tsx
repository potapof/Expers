"use client";

import { useEffect } from "react";
import { XCircle, Loader2 } from "lucide-react";

export function PaymentFailContent() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ action: "payment.fail" }, "*");
    }
    const t = setTimeout(() => {
      window.top?.location.replace("/cabinet");
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">Платёж не прошёл</h1>
      <p className="text-sm text-gray-500 max-w-md text-center">
        Возможно, на карте недостаточно средств или банк отклонил операцию.
        Вы будете перенаправлены в кабинет, где сможете попробовать снова.
      </p>
      <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
    </div>
  );
}
