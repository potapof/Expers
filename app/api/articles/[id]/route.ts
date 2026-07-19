import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getArticleById } from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();

  const authHeader = request.headers.get("authorization");
  let userId: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    userId = payload?.id ?? null;
  }

  if (dbAvailable) {
    try {
      const article = await getArticleById(id);
      if (article) {
        if (
          article.status === "published" ||
          article.status === "pending_review" ||
          (userId && article.expertId === userId)
        ) {
          return NextResponse.json({ article });
        }
        return NextResponse.json(
          { error: "Статья не найдена" },
          { status: 404 }
        );
      }
    } catch {
      // fall through to mock
    }
  }

  const mock = mockArticles.find((a) => a.id === id);
  if (mock) {
    return NextResponse.json({ article: mock });
  }

  return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
}
