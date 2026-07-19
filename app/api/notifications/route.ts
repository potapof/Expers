import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getArticlesByExpert,
  getPublishedArticles,
  getCommentsByArticle,
  getFollowedAuthorIds,
  getSectionIds,
} from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { articleUrl } from "@/lib/routes";

const NOTIFICATION_WINDOW_MS = 7 * 24 * 3600 * 1000;
const MAX_RECENT_ARTICLES = 200;

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
          link: articleUrl(
            article as { id: string; slug?: string; industryId: string }
          ),
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
      const recent = published
        .filter((art) => {
          const age = Date.now() - new Date(art.createdAt).getTime();
          return age < NOTIFICATION_WINDOW_MS;
        })
        .slice(0, MAX_RECENT_ARTICLES);
      for (const art of recent) {
        if (art.authorId === userId) continue;

        if (follows.includes(art.authorId)) {
          byId.set(`author-article-${art.id}`, {
            id: `author-article-${art.id}`,
            type: "new_article_author",
            message: `Новая статья от ${art.authorName}: ${art.title}`,
            link: articleUrl(art),
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
            link: articleUrl(art),
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
