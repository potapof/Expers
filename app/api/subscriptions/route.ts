import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getFollowedAuthorIds,
  getSubscribersOf,
  addSubscription,
  removeSubscription,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";

const bodySchema = z.object({
  authorId: z.string().min(1).max(200),
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

  const authorId = request.nextUrl.searchParams.get("authorId");

  if (!(await isDatabaseAvailable())) {
    return authorId
      ? NextResponse.json({ subscribers: [] })
      : NextResponse.json({ authorIds: [] });
  }

  try {
    if (authorId) {
      if (authorId !== payload.id) {
        return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
      }
      const subscribers = await getSubscribersOf(authorId);
      return NextResponse.json({ subscribers });
    }
    const authorIds = await getFollowedAuthorIds(payload.id);
    return NextResponse.json({ authorIds });
  } catch {
    return authorId
      ? NextResponse.json({ subscribers: [] })
      : NextResponse.json({ authorIds: [] });
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
    await addSubscription(payload.id, payload.name, parsed.data.authorId);
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

  const authorId = request.nextUrl.searchParams.get("authorId");
  if (!authorId) {
    return NextResponse.json({ error: "Требуется authorId" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    await removeSubscription(payload.id, authorId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
