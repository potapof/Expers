import { industries } from "./data";

export const articleIcons = [
  "chart",
  "eye",
  "tool",
  "trending-down",
  "calendar",
  "dollar-sign",
  "target",
  "file-text",
  "video",
  "prescription",
  "prohibited",
  "hospital",
  "scale",
  "ruble",
  "building",
  "store",
  "smartphone",
  "banknote",
];

export function getIndustryById(id: string) {
  return industries.find((i) => i.id === id);
}

export function getSubsection(industryId: string, subsectionId: string) {
  const ind = getIndustryById(industryId);
  return ind?.subsections.find((s) => s.id === subsectionId) ?? null;
}

export function getCategory(industryId: string, categoryId: string) {
  const ind = getIndustryById(industryId);
  if (!ind) return null;
  for (const sub of ind.subsections) {
    const cat = sub.categories.find((c) => c.id === categoryId);
    if (cat) return cat;
  }
  return null;
}

export function estimateReadTime(text: string): string {
  const wordsPerMinute = 150;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  return `${minutes} мин`;
}
