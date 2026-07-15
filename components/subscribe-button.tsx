"use client";

import { useSubscriptions } from "@/lib/use-subscriptions";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export function SubscribeButton({
  expertId,
  expertName,
}: {
  expertId: string;
  expertName: string;
}) {
  const { expert } = useAuth();
  const { isSubscribed, toggleSubscription } = useSubscriptions();
  const subscribed = isSubscribed(expertId);

  if (!expert) {
    return (
      <button
        type="button"
        onClick={() =>
          toast("Подписки доступны после входа", {
            description: "Войдите или зарегистрируйтесь, чтобы подписаться",
          })
        }
        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-300 cursor-not-allowed"
        title="Войдите, чтобы подписаться"
      >
        <BellOff className="h-4 w-4" />
        Подписаться
      </button>
    );
  }

  const handleClick = () => {
    toggleSubscription(expertId);
    if (!subscribed) {
      toast.success(`Вы подписались на ${expertName}`);
    } else {
      toast(`Отписаться от ${expertName}?`, {
        action: {
          label: "Отписаться",
          onClick: () => {
            toggleSubscription(expertId);
            toast.success("Вы отписались");
          },
        },
        cancel: { label: "Отмена", onClick: () => {} },
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        subscribed
          ? "bg-[#1ABC9C] text-white hover:bg-[#16a085]"
          : "border border-[#0039CA] text-[#0039CA] hover:bg-[#0039CA]/10"
      }`}
    >
      {subscribed ? (
        <>
          <Bell className="h-4 w-4" />
          Подписаны
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Подписаться
        </>
      )}
    </button>
  );
}
