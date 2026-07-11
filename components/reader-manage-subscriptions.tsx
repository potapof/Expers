"use client";

import Link from "next/link";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { useSectionSubscriptions } from "@/lib/use-section-subscriptions";
import { expertProfiles, industries } from "@/lib/data";
import { UserMinus, BellOff, Users, FolderTree, Bell } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Tab = "authors" | "sections";

function getSectionName(id: string): string {
  for (const industry of industries) {
    if (industry.id === id) return industry.name;
    for (const sub of industry.subsections) {
      if (sub.id === id) return sub.name;
      for (const cat of sub.categories) {
        if (cat.id === id) return cat.name;
      }
    }
  }
  return id;
}

function getSectionPath(id: string): string {
  for (const industry of industries) {
    if (industry.id === id) return industry.name;
    for (const sub of industry.subsections) {
      if (sub.id === id) return `${industry.name} → ${sub.name}`;
      for (const cat of sub.categories) {
        if (cat.id === id) {
          const parentSub = industry.subsections.find((s) =>
            s.categories.some((c) => c.id === cat.id)
          );
          if (parentSub) {
            return `${industry.name} → ${parentSub.name} → ${cat.name}`;
          }
        }
      }
    }
  }
  return id;
}

function getSectionType(id: string): string {
  for (const industry of industries) {
    if (industry.id === id) return "Раздел";
    for (const sub of industry.subsections) {
      if (sub.id === id) return "Подраздел";
      for (const cat of sub.categories) {
        if (cat.id === id) return "Категория";
      }
    }
  }
  return "Тема";
}

export function ReaderManageSubscriptions() {
  const [tab, setTab] = useState<Tab>("authors");
  const {
    subscriptions: authorSubs,
    toggleSubscription: toggleAuthorSub,
    subscribedCount: authorCount,
  } = useSubscriptions();
  const {
    subscriptions: sectionSubs,
    toggleSubscription: toggleSectionSub,
    subscribedCount: sectionCount,
  } = useSectionSubscriptions();

  const followedExperts = expertProfiles.filter((e) => authorSubs.has(e.id));
  const totalCount = authorCount + sectionCount;

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Bell className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-500">
          Нет активных подписок
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Подпишитесь на авторов, разделы или темы, чтобы не пропускать новое
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-5 w-fit">
        <button
          type="button"
          onClick={() => setTab("authors")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            tab === "authors"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          }`}
        >
          <Users className="h-4 w-4" />
          Авторы
          {authorCount > 0 && (
            <span className="ml-0.5 rounded-full bg-[#3498DB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {authorCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("sections")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            tab === "sections"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          }`}
        >
          <FolderTree className="h-4 w-4" />
          Разделы и темы
          {sectionCount > 0 && (
            <span className="ml-0.5 rounded-full bg-[#3498DB] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {sectionCount}
            </span>
          )}
        </button>
      </div>

      {tab === "authors" && (
        <div className="space-y-2.5">
          {followedExperts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Нет подписок на авторов
            </p>
          ) : (
            followedExperts.map((expert) => (
              <div
                key={expert.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
              >
                <Link
                  href={`/expert/${expert.id}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3498DB] text-white text-sm font-bold">
                    {expert.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2C3E50] truncate">
                      {expert.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {expert.expertise.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleAuthorSub(expert.id);
                    toast.success(`Вы отписались от ${expert.name}`);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  Отписаться
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "sections" && (
        <div className="space-y-2.5">
          {sectionSubs.size === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Нет подписок на разделы и темы
            </p>
          ) : (
            [...sectionSubs].map((id) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#3498DB]">
                      {getSectionType(id)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#2C3E50] truncate mt-0.5">
                    {getSectionName(id)}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {getSectionPath(id)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleSectionSub(id);
                    toast.success(`Вы отписались от «${getSectionName(id)}»`);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-3"
                >
                  <BellOff className="h-3.5 w-3.5" />
                  Отписаться
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
