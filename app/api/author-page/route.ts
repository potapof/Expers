import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveAuthorPage } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";

const authorPageSchema = z.object({
  name: z.string().min(1).max(200),
  avatar: z.string().optional(),
  bio: z.string().max(2000).optional(),
  credentials: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        organization: z.string().max(200).optional(),
        year: z.string().max(10).optional(),
      })
    )
    .optional(),
  expertise: z
    .array(
      z.object({
        area: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
      })
    )
    .optional(),
  workExperience: z
    .array(
      z.object({
        company: z.string().min(1).max(200),
        position: z.string().min(1).max(200),
        startDate: z.string().max(20),
        endDate: z.string().max(20).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .optional(),
  publications: z
    .array(
      z.object({
        title: z.string().min(1).max(500),
        url: z.string().max(500).optional(),
        date: z.string().max(20).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .optional(),
  achievements: z
    .array(
      z.object({
        title: z.string().min(1).max(500),
        date: z.string().max(20).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .optional(),
  mediaMentions: z
    .array(
      z.object({
        outlet: z.string().min(1).max(200),
        title: z.string().min(1).max(500),
        url: z.string().max(500).optional(),
        date: z.string().max(20).optional(),
      })
    )
    .optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().min(1).max(200),
        url: z.string().max(500),
      })
    )
    .optional(),
  faq: z
    .array(
      z.object({
        question: z.string().min(1).max(500),
        answer: z.string().min(1).max(2000),
      })
    )
    .optional(),
  testimonials: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        role: z.string().max(200).optional(),
        text: z.string().min(1).max(1000),
      })
    )
    .optional(),
  callToAction: z.string().max(500).optional(),
  authorPageSlug: z.string().min(1).max(200),
});

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = authorPageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await saveAuthorPage(payload.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Ошибка сохранения страницы автора:", err);
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}
