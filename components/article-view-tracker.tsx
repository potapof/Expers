"use client";

import { useEffect } from "react";
import { useViewingHistory } from "@/lib/use-viewing-history";

export function ArticleViewTracker({ articleId }: { articleId: string }) {
  const { addView } = useViewingHistory();

  useEffect(() => {
    addView(articleId);
  }, [articleId, addView]);

  return null;
}
