import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getCommentById,
  updateCommentText,
  deleteCommentCascade,
  type Comment,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { updateCommentSchema } from "@/lib/validation/comments";

type AuthResult =
  | { ok: false; response: NextResponse }
  | { ok: true; comment: Comment };

async function authorize(
  request: NextRequest,
  id: string
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Неавторизован" }, { status: 401 }),
    };
  }

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 }
      ),
    };
  }

  if (!(await isDatabaseAvailable())) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "База данных недоступна" },
        { status: 503 }
      ),
    };
  }

  const comment = await getCommentById(id);
  if (!comment) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Комментарий не найден" },
        { status: 404 }
      ),
    };
  }

  if (comment.authorId !== payload.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Нет доступа" }, { status: 403 }),
    };
  }

  return { ok: true, comment };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const auth = await authorize(request, id);
  if (!auth.ok) return auth.response;

  const parsed = updateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const updated = await updateCommentText(id, parsed.data.text);
    return NextResponse.json({ comment: updated });
  } catch {
    return NextResponse.json(
      { error: "Ошибка обновления комментария" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize(request, id);
  if (!auth.ok) return auth.response;

  try {
    await deleteCommentCascade(id, auth.comment.articleId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Ошибка удаления комментария" },
      { status: 500 }
    );
  }
}
