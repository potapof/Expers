import { articles as staticArticles, industries } from "./data";
import { mockArticles } from "./mock-data";

export interface ReaderArticle {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  date: string;
  industryId: string;
  industryName: string;
  subsectionId: string | null;
  readTime: string;
}

const industryNames = new Map(industries.map((i) => [i.id, i.name]));

function getSubsectionIdByCategory(categoryId: string): string | null {
  for (const ind of industries) {
    for (const sub of ind.subsections) {
      if (sub.categories.some((c) => c.id === categoryId)) {
        return sub.id;
      }
    }
  }
  return null;
}

export function getAllReaderArticles(): ReaderArticle[] {
  const fromStatic: ReaderArticle[] = staticArticles.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    authorId: a.author.id,
    authorName: a.author.name,
    date: a.date,
    industryId: a.industryId,
    industryName: industryNames.get(a.industryId) ?? a.industryId,
    subsectionId: getSubsectionIdByCategory(a.categoryId),
    readTime: a.readTime,
  }));

  const fromMock: ReaderArticle[] = mockArticles
    .filter((a) => a.status === "published")
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      authorId: a.authorId,
      authorName: a.authorName,
      date: a.createdAt.split("T")[0],
      industryId: a.industryId,
      industryName: a.industryName,
      subsectionId: a.subsectionId || null,
      readTime: a.readTime,
    }));

  const seen = new Set<string>();
  const merged = [...fromStatic, ...fromMock].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  merged.sort((a, b) => b.date.localeCompare(a.date));

  return merged;
}

export function getReaderArticlesByIndustry(
  industryId: string
): ReaderArticle[] {
  return getAllReaderArticles().filter((a) => a.industryId === industryId);
}

export function getIndustriesForSelector() {
  return industries.map((i) => ({
    id: i.id,
    name: i.name,
    subsections: i.subsections.map((s) => ({
      id: s.id,
      name: s.name,
    })),
  }));
}
