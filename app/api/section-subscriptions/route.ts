import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getSectionIds,
  addSection,
  removeSection,
  setSections,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";

const oneSchema = z.object({
  sectionId: z.string().min(1).max(200),
});

const setSchema = z.object({
  sectionIds: z.array(z.string().min(1).max(200)).max(100),
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
    return NextResponse.json({ sectionIds: [] });
  }
  try {
    const sectionIds = await getSectionIds(payload.id);
    return NextResponse.json({ sectionIds });
  } catch {
    return NextResponse.json({ sectionIds: [] });
  }
}

export async function POST(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const parsed = oneSchema.safeParse(await request.json());
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
    await addSection(payload.id, parsed.data.sectionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const parsed = setSchema.safeParse(await request.json());
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
    await setSections(payload.id, parsed.data.sectionIds);
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

  const sectionId = request.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json({ error: "Требуется sectionId" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    await removeSection(payload.id, sectionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
