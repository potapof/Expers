import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { approveArticle, getArticleById, getExpertById } from "@/lib/models";
import { sendMail } from "@/lib/mail";
import { articleApprovedEmail } from "@/lib/mail-templates";
import { articleUrl } from "@/lib/routes";

const bodySchema = z.object({
  articleId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const parsed = bodySchema.safeParse(await request.json());
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

  try {
    const article = await getArticleById(parsed.data.articleId);
    if (!article) {
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
    }
    const ok = await approveArticle(parsed.data.articleId);
    if (!ok) {
      return NextResponse.json(
        { error: "Статья не в статусе ожидания проверки" },
        { status: 409 }
      );
    }
    const expert = await getExpertById(article.expertId);
    if (expert?.email) {
      sendMail({
        to: expert.email,
        subject: "Статья опубликована — Expers",
        html: articleApprovedEmail(
          article.title,
          articleUrl({
            id: article.id,
            slug: article.slug ?? undefined,
            industryId: article.industryId,
          })
        ),
      }).catch((err) => console.error("Approval email failed:", err));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approve moderation error:", err);
    return NextResponse.json({ error: "Ошибка одобрения" }, { status: 500 });
  }
}
