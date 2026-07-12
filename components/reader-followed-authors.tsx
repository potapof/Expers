"use client";

import Link from "next/link";
import { useSubscriptions } from "@/lib/use-subscriptions";
import { expertProfiles } from "@/lib/data";
import { UserMinus, Users } from "lucide-react";
import { toast } from "sonner";

export function ReaderFollowedAuthors() {
  const { subscriptions, toggleSubscription, subscribedCount } =
    useSubscriptions();

  const followedExperts = expertProfiles.filter((e) => subscriptions.has(e.id));

  if (subscribedCount === 0) {
    return (
      <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Нет подписок</p>
        <p className="mt-1 text-xs text-gray-400">
          Подпишитесь на авторов, чтобы следить за их новыми статьями
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
              toast(`Отписаться от ${expert.name}?`, {
                action: {
                  label: "Отписаться",
                  onClick: () => {
                    toggleSubscription(expert.id);
                    toast.success("Вы отписались");
                  },
                },
                cancel: { label: "Отмена", onClick: () => {} },
              });
            }}
            className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Отписаться
          </button>
        </div>
      ))}
    </div>
  );
}
