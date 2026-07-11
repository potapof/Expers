import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getArticleById } from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const article = await getArticleById(id);
      if (article) {
        return NextResponse.json({ article });
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
