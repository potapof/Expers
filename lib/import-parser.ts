import type { ImportArticleData } from "./import-validation";
import type { ArticleSection } from "@/components/section-card-builder";
import { buildContentFromSections } from "@/components/section-card-builder";

export interface ParseResult {
  ok: boolean;
  data?: Record<string, string>;
  error?: string;
  missingFields?: string[];
}

function cleanAiResponse(raw: string): string {
  let text = raw.trim();

  const fenceMatch = text.match(/```(?:markdown|md)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  return text;
}

const VALID_DESIGNS = [
  "text-only",
  "image-only",
  "image-right",
  "image-left",
  "table",
] as const;

function parseTable(md: string): { headers: string[]; rows: string[][] } {
  const lines = md.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headerLine = lines[0];
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);

  const rows: string[][] = [];
  let startIdx = 1;
  if (lines[1] && lines[1].includes("---")) {
    startIdx = 2;
  }
  for (let i = startIdx; i < lines.length; i++) {
    const cells = lines[i]
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return { headers, rows };
}

export function parseIterationMarkdown(
  md: string,
  outputFields: string[],
  optionalFields: string[]
): ParseResult {
  const text = cleanAiResponse(md);

  const iterationStart = text.search(/##\s*Итерация\s+\d+/i);
  if (iterationStart === -1) {
    return {
      ok: false,
      error:
        "Не найден маркер итерации. Ответ должен начинаться с '## Итерация N:'",
    };
  }

  const contentAfterMarker = text.slice(iterationStart);

  const blocks = contentAfterMarker.split(/^###\s+/m).slice(1);

  if (blocks.length === 0) {
    return {
      ok: false,
      error:
        "Не найдены блоки '### Ключ'. Ответ должен содержать блоки вида '### Ключ' + значение.",
    };
  }

  const rawData: Record<string, string> = {};

  for (const block of blocks) {
    const newlineIdx = block.indexOf("\n");
    if (newlineIdx === -1) {
      rawData[block.trim()] = "";
      continue;
    }

    const key = block.slice(0, newlineIdx).trim();
    const value = block.slice(newlineIdx + 1).trim();
    rawData[key] = value;
  }

  const allOutputFields = [...outputFields, ...optionalFields];
  const normalized: Record<string, string> = {};
  const missingFields: string[] = [];

  for (const expectedKey of allOutputFields) {
    const expectedLower = expectedKey.toLowerCase();
    const foundKey = Object.keys(rawData).find(
      (k) => k.toLowerCase() === expectedLower
    );

    if (foundKey) {
      normalized[expectedKey] = rawData[foundKey];
    } else if (outputFields.includes(expectedKey)) {
      missingFields.push(expectedKey);
    } else {
      normalized[expectedKey] = "";
    }
  }

  if (missingFields.length > 0) {
    return {
      ok: false,
      error: `Отсутствуют обязательные поля: ${missingFields.join(", ")}`,
      missingFields,
    };
  }

  return { ok: true, data: normalized };
}

export function buildArticleData(
  parsedIterations: Map<number, Record<string, string>>
): ImportArticleData {
  const i1 = parsedIterations.get(1) || {};
  const i2 = parsedIterations.get(2) || {};
  const i3 = parsedIterations.get(3) || {};
  const i4 = parsedIterations.get(4) || {};
  const i5 = parsedIterations.get(5) || {};
  const i12 = parsedIterations.get(12) || {};

  const sections: ArticleSection[] = [];

  for (let iter = 6; iter <= 11; iter++) {
    const d = parsedIterations.get(iter);
    if (!d) continue;

    const tableData =
      iter === 9 && d.sectionTable
        ? parseTable(d.sectionTable)
        : { headers: [], rows: [] };

    const sectionText =
      iter === 9
        ? [d.sectionText || "", d.sectionTextAfter || ""]
            .filter(Boolean)
            .join("\n\n")
        : d.sectionText || "";

    sections.push({
      id: `section-imported-${iter}`,
      title: d.sectionTitle || `Секция ${iter - 5}`,
      description: d.sectionDescription || "",
      design: VALID_DESIGNS.includes(
        d.sectionDesign as (typeof VALID_DESIGNS)[number]
      )
        ? (d.sectionDesign as ArticleSection["design"])
        : "text-only",
      text: sectionText,
      imageRatio: ["image-right", "image-left"].includes(d.sectionDesign || "")
        ? 45
        : 100,
      imageData: d.imageUrl || undefined,
      tableData,
    });
  }

  const content = buildContentFromSections(sections);

  const faqStr = i12.faq || "";
  const faq = parseFaq(faqStr);

  const todoStr = i12.todo || "";
  const todo = parseTodo(todoStr);

  const keyFactsStr = i12.keyFacts || "";
  const keyFacts = parseKeyFacts(keyFactsStr);

  const howToStr = i12.howTo || "";
  const howTo = parseHowTo(howToStr);

  const sourcesStr = i12.sources || "";
  const sources = parseSources(sourcesStr);

  const expertiseAreasStr = i3.expertiseAreas || "";
  const expertiseAreas = expertiseAreasStr
    ? expertiseAreasStr
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  const crossLinksStr = i4.crossLinks || "";
  let crossLinks: { articleId: string; title: string; industryId: string }[] =
    [];
  try {
    crossLinks = JSON.parse(crossLinksStr);
  } catch (e) {
    console.error("Failed to parse crossLinks JSON:", e);
    crossLinks = [];
  }

  return {
    title: i5.title || "",
    description: i5.introduction || "",
    content,
    slug: i5.slug || undefined,
    industryId: i1.industryId || "none",
    industryName: i1.industryName || "",
    subsectionId: i1.subsectionId || "none",
    subsectionName: i1.subsectionName || "",
    categoryId: i2.categoryId || "none",
    categoryName: i2.categoryName || "",
    customCategory: "",
    expertiseAreas,
    crossLinks,
    tldr: i12.tldr || "",
    keyFacts,
    definition: i12.definition || "",
    featuredSnippet: {
      question: i12.featuredSnippetQuestion || "",
      answer: i12.featuredSnippetAnswer || "",
    },
    problemSolutionResult: {
      problem: i12.problemSolutionProblem || "",
      solution: i12.problemSolutionSolution || "",
      result: i12.problemSolutionResult || "",
    },
    howTo,
    faq,
    todo,
    methodology: i12.methodology || "",
    sources,
  };
}

function parseFaq(raw: string): { question: string; answer: string }[] {
  if (!raw) return [];
  const items = raw.split(/^\s*---\s*$/m);
  return items
    .map((item) => {
      const lines = item.trim().split("\n");
      const question = lines[0]?.trim() || "";
      const answer = lines.slice(1).join(" ").trim();
      return { question, answer };
    })
    .filter((fa) => fa.question && fa.answer);
}

function parseTodo(raw: string): { text: string; done: boolean }[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text, done: false }));
}

const FACT_ICONS = ["chart", "eye", "tool", "zap", "target", "star", "award"];

function parseKeyFacts(raw: string): { icon: string; text: string }[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, idx) => ({
      icon: FACT_ICONS[idx % FACT_ICONS.length],
      text,
    }));
}

function parseHowTo(raw: string): { title: string; description: string }[] {
  if (!raw) return [];
  const items = raw.split(/^\s*---\s*$/m);
  return items
    .map((item) => {
      const lines = item.trim().split("\n");
      const title = lines[0]?.trim() || "";
      const description = lines.slice(1).join(" ").trim();
      return { title, description };
    })
    .filter((h) => h.title);
}

function parseSources(raw: string): { title: string; url: string }[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => {
      const urlMatch = line.match(/^(.*?)\s+(https?:\/\/\S+)$/);
      if (urlMatch) {
        return { title: urlMatch[1].trim(), url: urlMatch[2] };
      }
      const emdashParts = line.split("—");
      if (emdashParts.length >= 2) {
        return {
          title: emdashParts[0].trim(),
          url: emdashParts.slice(1).join("—").trim(),
        };
      }
      const fallbackUrlMatch = line.match(/(https?:\/\/\S+)/);
      if (fallbackUrlMatch) {
        return {
          title:
            line.replace(fallbackUrlMatch[0], "").trim() || fallbackUrlMatch[0],
          url: fallbackUrlMatch[0],
        };
      }
      return { title: line, url: "" };
    })
    .filter((s) => s.title);
}
