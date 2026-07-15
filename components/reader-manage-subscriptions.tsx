"use client";

import Link from "next/link";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { useSectionSubscriptions } from "@/lib/use-section-subscriptions";
import { expertProfiles, industries } from "@/lib/data";
import {
  UserMinus,
  BellOff,
  Users,
  FolderTree,
  Bell,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

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
  const [authorSearch, setAuthorSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const { subscriptions: authorSubs, toggleSubscription: toggleAuthorSub } =
    useSubscriptions();
  const { subscriptions: sectionSubs, toggleSubscription: toggleSectionSub } =
    useSectionSubscriptions();

  const followedExperts = expertProfiles.filter((e) => authorSubs.has(e.id));
  const availableExperts = useMemo(
    () =>
      expertProfiles
        .filter((e) => !authorSubs.has(e.id))
        .filter((e) =>
          authorSearch
            ? e.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
              e.expertise.some((x) =>
                x.toLowerCase().includes(authorSearch.toLowerCase())
              )
            : true
        ),
    [authorSubs, authorSearch]
  );

  const toggleSectionExpand = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const subscribedSectionIds = new Set(sectionSubs);

  const filteredIndustries = useMemo(
    () =>
      sectionSearch
        ? industries
            .map((ind) => ({
              ...ind,
              subsections: ind.subsections
                .map((sub) => ({
                  ...sub,
                  categories: sub.categories.filter(
                    (c) =>
                      c.name
                        .toLowerCase()
                        .includes(sectionSearch.toLowerCase()) ||
                      sub.name
                        .toLowerCase()
                        .includes(sectionSearch.toLowerCase()) ||
                      ind.name
                        .toLowerCase()
                        .includes(sectionSearch.toLowerCase())
                  ),
                }))
                .filter(
                  (sub) =>
                    sub.categories.length > 0 ||
                    sub.name.toLowerCase().includes(sectionSearch.toLowerCase())
                ),
            }))
            .filter(
              (ind) =>
                ind.subsections.length > 0 ||
                ind.name.toLowerCase().includes(sectionSearch.toLowerCase())
            )
        : industries,
    [sectionSearch]
  );

  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-5 w-fit">
        <button
          type="button"
          onClick={() => setTab("authors")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
            tab === "authors"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          )}
        >
          <Users className="h-4 w-4" />
          Авторы
        </button>
        <button
          type="button"
          onClick={() => setTab("sections")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
            tab === "sections"
              ? "bg-white text-[#2C3E50] shadow-sm"
              : "text-gray-500 hover:text-[#2C3E50]"
          )}
        >
          <FolderTree className="h-4 w-4" />
          Разделы и темы
        </button>
      </div>

      {tab === "authors" && (
        <div className="space-y-6">
          {followedExperts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">
                Мои подписки · {followedExperts.length}
              </h3>
              <div className="space-y-2">
                {followedExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
                  >
                    <Link
                      href={`/expert/${expert.id}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-sm font-bold">
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
                      className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-3"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Отписаться
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск авторов..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
                />
              </div>
            </div>
            {availableExperts.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                {authorSearch ? "Ничего не найдено" : "Все авторы добавлены"}
              </p>
            ) : (
              <div className="space-y-2">
                {availableExperts.slice(0, 20).map((expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
                  >
                    <Link
                      href={`/expert/${expert.id}`}
                      className="flex items-center gap-3 min-w-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm font-bold">
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
                        toast.success(`Вы подписались на ${expert.name}`);
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#0039CA] hover:bg-blue-50 transition-colors ml-3"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Подписаться
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "sections" && (
        <div className="space-y-6">
          {subscribedSectionIds.size > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">
                Мои подписки · {subscribedSectionIds.size}
              </h3>
              <div className="space-y-2">
                {[...subscribedSectionIds].map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-gray-200 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#0039CA]">
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
                        toast.success(
                          `Вы отписались от «${getSectionName(id)}»`
                        );
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-3"
                    >
                      <BellOff className="h-3.5 w-3.5" />
                      Отписаться
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск разделов и тем..."
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
              />
            </div>
            <div className="space-y-1 rounded-xl border border-gray-100 bg-white p-3">
              {filteredIndustries.map((industry) => (
                <div key={industry.id}>
                  <button
                    type="button"
                    onClick={() => toggleSectionExpand(industry.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    {expandedSections.has(industry.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className="flex-1 text-left text-[#2C3E50]">
                      {industry.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionSub(industry.id);
                        toast.success(
                          subscribedSectionIds.has(industry.id)
                            ? `Вы отписались от «${industry.name}»`
                            : `Вы подписались на «${industry.name}»`
                        );
                      }}
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                        subscribedSectionIds.has(industry.id)
                          ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                          : "text-[#0039CA] hover:bg-blue-50"
                      )}
                    >
                      {subscribedSectionIds.has(industry.id) ? (
                        <>
                          <BellOff className="h-3.5 w-3.5" />
                          Отписаться
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5" />
                          Подписаться
                        </>
                      )}
                    </button>
                  </button>
                  {expandedSections.has(industry.id) && (
                    <div className="ml-5 border-l border-gray-100 pl-3 space-y-0.5">
                      {industry.subsections.map((subsection) => (
                        <div key={subsection.id}>
                          <button
                            type="button"
                            onClick={() => toggleSectionExpand(subsection.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                          >
                            {expandedSections.has(subsection.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            )}
                            <span className="flex-1 text-left text-gray-600">
                              {subsection.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionSub(subsection.id);
                                toast.success(
                                  subscribedSectionIds.has(subsection.id)
                                    ? `Вы отписались от «${subsection.name}»`
                                    : `Вы подписались на «${subsection.name}»`
                                );
                              }}
                              className={cn(
                                "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                                subscribedSectionIds.has(subsection.id)
                                  ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                                  : "text-[#0039CA] hover:bg-blue-50"
                              )}
                            >
                              {subscribedSectionIds.has(subsection.id) ? (
                                <>
                                  <BellOff className="h-3 w-3" />
                                  Отписаться
                                </>
                              ) : (
                                <>
                                  <Bell className="h-3 w-3" />
                                  Подписаться
                                </>
                              )}
                            </button>
                          </button>
                          {expandedSections.has(subsection.id) && (
                            <div className="ml-5 border-l border-gray-100 pl-3 space-y-0.5">
                              {subsection.categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                                >
                                  <span className="flex-1 text-gray-500">
                                    {category.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleSectionSub(category.id);
                                      toast.success(
                                        subscribedSectionIds.has(category.id)
                                          ? `Вы отписались от «${category.name}»`
                                          : `Вы подписались на «${category.name}»`
                                      );
                                    }}
                                    className={cn(
                                      "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                                      subscribedSectionIds.has(category.id)
                                        ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                                        : "text-[#0039CA] hover:bg-blue-50"
                                    )}
                                  >
                                    {subscribedSectionIds.has(category.id) ? (
                                      <>
                                        <BellOff className="h-3 w-3" />
                                        Отписаться
                                      </>
                                    ) : (
                                      <>
                                        <Bell className="h-3 w-3" />
                                        Подписаться
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
