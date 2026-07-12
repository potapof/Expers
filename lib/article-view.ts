import { isDatabaseAvailable } from "./db";
import {
  getArticleById,
  getPublishedArticles,
  getExpertById,
  type Article as DbArticle,
  type Expert,
} from "./models";
import {
  articles as staticArticles,
  getArticleContentById,
  getRelatedArticles,
  type Article as StaticArticle,
  type ArticleContent,
} from "./data";

export interface CatalogArticle {
  id: string;
  title: string;
  description: string;
  industryId: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  date: string;
  readTime: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  industryId: string;
  authorName?: string;
  date?: string;
}

export interface ArticleViewAuthor {
  id: string;
  name: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: { platform: string; url: string }[];
}

export interface ArticleView {
  id: string;
  title: string;
  description: string;
  content: string;
  industryId: string;
  date: string;
  readTime: string;
  author: ArticleViewAuthor;
  tldr: string;
  keyFacts: { icon: string; text: string }[];
  definition: string;
  featuredSnippet: { question: string; answer: string };
  problemSolutionResult: { problem: string; solution: string; result: string };
  howTo: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  methodology: string;
  sources: { title: string; url: string }[];
  reviews?: { author: string; role: string; text: string; rating: number }[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
  };
  related: RelatedArticle[];
}

function toDisplayDate(iso: string): string {
  return iso.split("T")[0];
}

function staticToCard(a: StaticArticle): CatalogArticle {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    industryId: a.industryId,
    categoryId: a.categoryId,
    authorId: a.author.id,
    authorName: a.author.name,
    date: a.date,
    readTime: a.readTime,
  };
}

function dbToCard(a: DbArticle): CatalogArticle {
  return {
    id: a.id,
    title: a.title,
    description: a.description || a.tldr || "",
    industryId: a.industryId,
    categoryId: a.categoryId,
    authorId: a.authorId,
    authorName: a.authorName,
    date: toDisplayDate(a.createdAt),
    readTime: a.readTime,
  };
}

export async function getCatalogArticles(): Promise<CatalogArticle[]> {
  const byId = new Map<string, CatalogArticle>();

  for (const a of staticArticles) {
    byId.set(a.id, staticToCard(a));
  }

  if (await isDatabaseAvailable()) {
    try {
      const published = await getPublishedArticles();
      for (const a of published) {
        byId.set(a.id, dbToCard(a));
      }
    } catch {
      // fall back to static seed only
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function staticToView(sc: ArticleContent): ArticleView {
  return {
    id: sc.id,
    title: sc.title,
    description: sc.description,
    content: sc.content,
    industryId: sc.industryId,
    date: sc.date,
    readTime: sc.readTime,
    author: {
      id: sc.author.id,
      name: sc.author.name,
      bio: sc.author.bio,
      expertise: sc.author.expertise,
      credentials: sc.author.credentials,
      socialLinks: sc.author.socialLinks,
    },
    tldr: sc.tldr,
    keyFacts: sc.keyFacts,
    definition: sc.definition,
    featuredSnippet: sc.featuredSnippet,
    problemSolutionResult: sc.problemSolutionResult,
    howTo: sc.howTo,
    faq: sc.faq,
    methodology: sc.methodology,
    sources: sc.sources,
    reviews: sc.reviews,
    aggregateRating: sc.aggregateRating,
    related: getRelatedArticles(sc.id).map((r) => ({
      id: r.id,
      title: r.title,
      industryId: r.industryId,
      authorName: r.author.name,
      date: r.date,
    })),
  };
}

function dbToView(a: DbArticle, expert: Expert | null): ArticleView {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    content: a.content,
    industryId: a.industryId,
    date: toDisplayDate(a.createdAt),
    readTime: a.readTime,
    author: {
      id: a.authorId,
      name: expert?.name || a.authorName,
      bio: expert?.bio,
      expertise: expert?.expertise,
      credentials: expert?.credentials,
      socialLinks: expert?.socialLinks,
    },
    tldr: a.tldr,
    keyFacts: a.keyFacts,
    definition: a.definition,
    featuredSnippet: a.featuredSnippet,
    problemSolutionResult: a.problemSolutionResult,
    howTo: a.howTo,
    faq: a.faq,
    methodology: a.methodology,
    sources: a.sources,
    related: (a.crossLinks ?? []).map((cl) => ({
      id: cl.articleId,
      title: cl.title,
      industryId: cl.industryId,
    })),
  };
}

export async function getArticleView(id: string): Promise<ArticleView | null> {
  if (await isDatabaseAvailable()) {
    try {
      const article = await getArticleById(id);
      if (article && article.status !== "archived") {
        let expert: Expert | null = null;
        try {
          expert = await getExpertById(article.authorId);
        } catch {
          expert = null;
        }
        return dbToView(article, expert);
      }
    } catch {
      // fall back to static content
    }
  }

  const staticContent = getArticleContentById(id);
  if (staticContent) {
    return staticToView(staticContent);
  }

  return null;
}
