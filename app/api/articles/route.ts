import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { createArticle, getPublishedArticles } from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";
import { verifyToken } from "@/lib/auth";

const articleSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(40).max(600),
  content: z.string().min(100).max(10000),
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

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const articles = await getPublishedArticles();
      return NextResponse.json({ articles });
    } catch {
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

  const id = `article-${crypto.randomUUID()}`;
  const wordCount = parsed.data.content.split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 150))} мин`;

  const articleData = {
    id,
    authorId: payload.id,
    authorName: payload.name,
    readTime,
    status: "published" as const,
    expertId: payload.id,
    ...parsed.data,
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
