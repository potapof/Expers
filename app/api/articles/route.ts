import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import {
  createArticle,
  getPublishedArticles,
  getArticlesByExpert,
  isSlugTaken,
  hasConfirmedPayment,
  getExpertById,
} from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";
import { verifyToken } from "@/lib/auth";

const articleSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(40).max(600),
  content: z.string().min(100).max(150000),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  industryId: z.string().min(1),
  industryName: z.string().min(1),
  subsectionId: z.string().min(1),
  subsectionName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  customCategory: z.string().max(200).optional().default(""),
  expertiseAreas: z.array(z.string()).min(1).max(5),
  crossLinks: z
    .array(
      z.object({
        articleId: z.string(),
        title: z.string(),
        industryId: z.string(),
      })
    )
    .max(8)
    .default([]),
  tldr: z.string().min(20).max(500),
  keyFacts: z
    .array(z.object({ icon: z.string(), text: z.string().min(1) }))
    .min(1)
    .max(7),
  definition: z.string().min(20).max(500),
  featuredSnippet: z.object({
    question: z.string().min(10),
    answer: z.string().min(20),
  }),
  problemSolutionResult: z.object({
    problem: z.string().min(20),
    solution: z.string().min(20),
    result: z.string().min(20),
  }),
  howTo: z
    .array(
      z.object({ title: z.string().min(1), description: z.string().min(1) })
    )
    .min(1),
  faq: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .max(5)
    .default([]),
  todo: z
    .array(
      z.object({ text: z.string().min(1), done: z.boolean().default(false) })
    )
    .default([]),
  methodology: z.string().min(20).max(1000),
  sources: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
    .default([]),
});

export async function GET(request: NextRequest) {
  const mine = request.nextUrl.searchParams.get("mine") === "true";

  if (mine) {
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
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ articles: [] });
    }
    try {
      const articles = await getArticlesByExpert(payload.id);
      return NextResponse.json({ articles });
    } catch (err) {
      console.error("Failed to get articles by expert:", err);
      return NextResponse.json(
        { error: "Ошибка получения статей" },
        { status: 500 }
      );
    }
  }

  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const articles = await getPublishedArticles();
      return NextResponse.json({ articles });
    } catch (err) {
      console.error("Failed to get published articles:", err);
      return NextResponse.json({ articles: mockArticles });
    }
  }

  return NextResponse.json({ articles: mockArticles });
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

  const dbAvailable = await isDatabaseAvailable();

  const parsed = articleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { slug, ...articleFields } = parsed.data;

  if (slug && dbAvailable) {
    const taken = await isSlugTaken(articleFields.industryId, slug);
    if (taken) {
      return NextResponse.json(
        { error: "URL статьи уже занят в этой отрасли" },
        { status: 409 }
      );
    }
  }

  const id = `article-${crypto.randomUUID()}`;
  const wordCount = articleFields.content.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 150))} мин`;

  let authorName = payload.name;
  if (dbAvailable) {
    try {
      const expert = await getExpertById(payload.id);
      if (expert) authorName = expert.name;
    } catch {
      // fall back to token name
    }
  }

  let hasPaid = false;
  if (dbAvailable) {
    try {
      hasPaid = await hasConfirmedPayment(payload.id);
    } catch {
      hasPaid = false;
    }
  }

  const articleData = {
    id,
    authorId: payload.id,
    authorName,
    readTime,
    status: hasPaid
      ? ("pending_review" as const)
      : ("pending_payment" as const),
    expertId: payload.id,
    ...(slug ? { slug } : {}),
    ...articleFields,
  };

  if (!dbAvailable) {
    return NextResponse.json(
      {
        error: "База данных недоступна",
        article: { ...articleData, id },
      },
      { status: 503 }
    );
  }

  try {
    const article = await createArticle(articleData);
    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка сохранения статьи" },
      { status: 500 }
    );
  }
}
