"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  articleId,
  className,
  size = "sm",
}: {
  articleId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const filled = isFavorite(articleId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(articleId);
  };

  const sizeClass =
    size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "shrink-0 transition-colors",
        filled ? "text-red-500" : "text-gray-300 hover:text-red-400",
        className
      )}
      aria-label={filled ? "Убрать из избранного" : "Добавить в избранное"}
    >
      <Heart className={cn(sizeClass, filled && "fill-current")} />
    </button>
  );
}
