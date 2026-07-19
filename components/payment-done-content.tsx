"use client";

import { useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export function PaymentDoneContent() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ action: "payment.done" }, "*");
    }
    const t = setTimeout(() => {
      window.top?.location.replace("/cabinet");
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">
        Оплата прошла успешно
      </h1>
      <p className="text-sm text-gray-500">
        Сейчас вы будете перенаправлены в личный кабинет...
      </p>
      <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
    </div>
  );
}
