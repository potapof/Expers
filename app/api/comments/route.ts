import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createComment,
  getCommentsByArticle,
  getCommentsByAuthor,
  getArticleById,
  type Comment,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validation/comments";

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId");
  const authorId = request.nextUrl.searchParams.get("authorId");

  if (!articleId && !authorId) {
    return NextResponse.json(
      { error: "Требуется articleId или authorId" },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ comments: [] });
  }

  try {
    const comments = articleId
      ? await getCommentsByArticle(articleId)
      : await getCommentsByAuthor(authorId as string);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("Failed to get comments:", err);
    return NextResponse.json(
      { error: "Ошибка получения комментариев" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const { articleId, parentId, text } = parsed.data;

  let isAuthorReply = false;
  if (parentId) {
    try {
      const article = await getArticleById(articleId);
      isAuthorReply = !!article && article.authorId === payload.id;
    } catch {
      isAuthorReply = false;
    }
  }

  const comment: Comment = {
    id: `comment-${crypto.randomUUID()}`,
    articleId,
    ...(parentId ? { parentId } : {}),
    authorId: payload.id,
    authorName: payload.name,
    text,
    createdAt: new Date().toISOString(),
    ...(isAuthorReply ? { isAuthorReply: true } : {}),
  };

  try {
    const created = await createComment(comment);
    return NextResponse.json({ comment: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка сохранения комментария" },
      { status: 500 }
    );
  }
}
