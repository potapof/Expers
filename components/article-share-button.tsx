"use client";

import { Share2, Link, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getIndustrySlug } from "@/lib/industry-slugs";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-5 w-5", className)}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function VkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-5 w-5", className)}
    >
      <path d="M15.684 0H8.316C2.879 0 0 2.879 0 8.316v7.368C0 21.121 2.879 24 8.316 24h7.368C21.121 24 24 21.121 24 15.684V8.316C24 2.879 21.121 0 15.684 0zm3.173 17.076h-1.715c-.598 0-.79-.471-1.28-1.212-.419-.653-1.019-1.249-1.543-1.37-.42-.097-.706.065-.787.52-.079.453-.157 1.54-.157 1.54a.38.38 0 0 1-.172.325c-.308.08-1.363.167-2.619-.446-1.477-.72-2.578-2.27-3.167-3.774-.66-1.683-1.01-3.358-.94-3.695.073-.36.328-.498.593-.524.224-.02.45-.004.675-.008.307.002.52.003.671.404.21.564.614 1.603.996 2.293.417.754.757.963.96.9.3-.091.37-1.063.37-1.537 0-.99.166-1.514-.546-1.676-.294-.067.197-.665.851-.665h.003c.64-.03 1.048.533 1.096 1.007.073.718.154 1.958-.017 2.485-.09.28.022.642.55.844.329.127.85.039 1.346-.662.479-.677.955-1.706.955-1.706a.444.444 0 0 1 .391-.267h1.85c.591 0 .546.588.546.588-.087.857-1.552 2.916-1.552 2.916-.32.532-.398.737-.005 1.085.386.345 1.097 1.085 1.46 1.589.364.505.73 1.045.756 1.816.03.894-.541 1.15-1.075 1.125z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-5 w-5", className)}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ShareOption({ icon, label, onClick }: ShareOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-[#2C3E50] transition-colors hover:bg-gray-50 hover:border-gray-300 w-full"
    >
      {icon}
      {label}
    </button>
  );
}

export function ArticleShareButton({
  articleId,
  articleTitle,
  industryId,
  slug,
}: {
  articleId: string;
  articleTitle: string;
  industryId?: string;
  slug?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const urlBase =
    industryId && slug
      ? `/${getIndustrySlug(industryId)}/${slug}`
      : `/articles/${articleId}`;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${urlBase}`
      : urlBase;
  const text = `${articleTitle} — читайте на Expers`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ссылка скопирована");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const handleShareTelegram = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareVk = () => {
    const shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(articleTitle)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 text-gray-300 hover:text-[#0039CA] transition-colors"
        aria-label="Поделиться"
      >
        <Share2 className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Поделиться</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <ShareOption
              icon={
                copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Link className="h-5 w-5" />
                )
              }
              label={copied ? "Ссылка скопирована" : "Копировать ссылку"}
              onClick={handleCopyLink}
            />
            <ShareOption
              icon={<TelegramIcon />}
              label="Telegram"
              onClick={handleShareTelegram}
            />
            <ShareOption icon={<VkIcon />} label="VK" onClick={handleShareVk} />
            <ShareOption
              icon={<XIcon />}
              label="Twitter / X"
              onClick={handleShareTwitter}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
