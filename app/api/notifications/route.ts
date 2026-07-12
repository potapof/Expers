import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getArticlesByExpert,
  getCommentsByArticle,
  getFollowedAuthorIds,
  getSectionIds,
  getPublishedArticles,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";

interface DerivedNotification {
  id: string;
  type:
    | "comment_on_article"
    | "reply_to_comment"
    | "new_article_author"
    | "new_article_section";
  message: string;
  link: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ notifications: [] });
  }

  const userId = payload.id;
  const byId = new Map<string, DerivedNotification>();

  try {
    const myArticles = await getArticlesByExpert(userId);
    for (const article of myArticles) {
      const comments = await getCommentsByArticle(article.id);
      for (const c of comments) {
        if (c.authorId === userId) continue;
        byId.set(`comment-${c.id}`, {
          id: `comment-${c.id}`,
          type: c.parentId ? "reply_to_comment" : "comment_on_article",
          message: `${c.authorName} оставил комментарий к статье «${article.title}»`,
          link: `/articles/${article.id}`,
          createdAt: c.createdAt,
        });
      }
    }

    const [follows, sections] = await Promise.all([
      getFollowedAuthorIds(userId),
      getSectionIds(userId),
    ]);

    if (follows.length > 0 || sections.length > 0) {
      const published = await getPublishedArticles();
      for (const art of published) {
        if (art.authorId === userId) continue;

        if (follows.includes(art.authorId)) {
          byId.set(`author-article-${art.id}`, {
            id: `author-article-${art.id}`,
            type: "new_article_author",
            message: `Новая статья от ${art.authorName}: ${art.title}`,
            link: `/articles/${art.id}`,
            createdAt: art.createdAt,
          });
        }

        if (
          sections.includes(art.industryId) ||
          (art.subsectionId && sections.includes(art.subsectionId))
        ) {
          byId.set(`section-article-${art.id}`, {
            id: `section-article-${art.id}`,
            type: "new_article_section",
            message: `Новая статья в разделе «${art.industryName}»: ${art.title}`,
            link: `/articles/${art.id}`,
            createdAt: art.createdAt,
          });
        }
      }
    }

    const notifications = Array.from(byId.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);

    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
