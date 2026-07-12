import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getFavoriteArticleIds,
  addFavorite,
  removeFavorite,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";

const bodySchema = z.object({
  articleId: z.string().min(1).max(200),
});

function getPayload(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

export async function GET(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ articleIds: [] });
  }
  try {
    const articleIds = await getFavoriteArticleIds(payload.id);
    return NextResponse.json({ articleIds });
  } catch {
    return NextResponse.json({ articleIds: [] });
  }
}

export async function POST(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    await addFavorite(payload.id, parsed.data.articleId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const articleId = request.nextUrl.searchParams.get("articleId");
  if (!articleId) {
    return NextResponse.json(
      { error: "Требуется articleId" },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    await removeFavorite(payload.id, articleId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
