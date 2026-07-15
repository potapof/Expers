"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const STORAGE_KEY = "expers-section-subscriptions";

export function SubscribeSectionButton({
  sectionId,
  sectionName,
}: {
  sectionId: string;
  sectionName: string;
}) {
  const { expert } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setHydrated(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const subs = new Set(JSON.parse(raw));
          setSubscribed(subs.has(sectionId));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, [sectionId]);

  if (!hydrated) {
    return <span className="inline-block w-5 h-5 shrink-0" />;
  }

  if (!expert) {
    return (
      <span
        role="button"
        tabIndex={-1}
        aria-disabled="true"
        onClick={(e) => {
          e.stopPropagation();
          toast("Подписки доступны после входа", {
            description: "Войдите или зарегистрируйтесь, чтобы подписаться",
          });
        }}
        className="shrink-0 rounded p-1 text-gray-200 cursor-not-allowed"
        title="Войдите, чтобы подписаться"
      >
        <BellOff className="h-3.5 w-3.5" />
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const subs = new Set(raw ? JSON.parse(raw) : []);
      if (subs.has(sectionId)) {
        subs.delete(sectionId);
        toast.success(`Отписка от «${sectionName}»`);
      } else {
        subs.add(sectionId);
        toast.success(`Подписка на «${sectionName}»`);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...subs]));
      setSubscribed(subs.has(sectionId));
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`shrink-0 rounded p-1 transition-colors cursor-pointer ${
        subscribed
          ? "text-[#1ABC9C] hover:text-[#16a085]"
          : "text-gray-300 hover:text-[#0039CA]"
      }`}
      title={
        subscribed
          ? `Отписаться от ${sectionName}`
          : `Подписаться на ${sectionName}`
      }
    >
      {subscribed ? (
        <Bell className="h-3.5 w-3.5" />
      ) : (
        <BellOff className="h-3.5 w-3.5" />
      )}
    </span>
  );
}
