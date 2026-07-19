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
  const i8 = parsedIterations.get(8) || {};

  const sections: ArticleSection[] = [];

  for (let iter = 2; iter <= 7; iter++) {
    const d = parsedIterations.get(iter);
    if (!d) continue;

    const tableData =
      iter === 5 && d.sectionTable
        ? parseTable(d.sectionTable)
        : { headers: [], rows: [] };

    const sectionText =
      iter === 5
        ? [d.sectionText || "", d.sectionTextAfter || ""]
            .filter(Boolean)
            .join("\n\n")
        : d.sectionText || "";

    sections.push({
      id: `section-imported-${iter}`,
      title: d.sectionTitle || `Секция ${iter - 1}`,
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

  const faqStr = i8.faq || "";
  const faq = parseFaq(faqStr);

  const todoStr = i8.todo || "";
  const todo = parseTodo(todoStr);

  const keyFactsStr = i8.keyFacts || "";
  const keyFacts = parseKeyFacts(keyFactsStr);

  const howToStr = i8.howTo || "";
  const howTo = parseHowTo(howToStr);

  const sourcesStr = i8.sources || "";
  const sources = parseSources(sourcesStr);

  return {
    title: i1.title || "",
    description: i1.introduction || "",
    content,
    slug: i1.slug || undefined,
    industryId: "none",
    industryName: "Без отрасли",
    subsectionId: "none",
    subsectionName: "Без подсектора",
    categoryId: "none",
    categoryName: "Без категории",
    customCategory: "",
    expertiseAreas: [
      "Общая экспертиза",
      "Бизнес-консалтинг",
      "Стратегическое планирование",
    ],
    crossLinks: [],
    tldr: i8.tldr || "",
    keyFacts,
    definition: i8.definition || "",
    featuredSnippet: {
      question: i8.featuredSnippetQuestion || "",
      answer: i8.featuredSnippetAnswer || "",
    },
    problemSolutionResult: {
      problem: i8.problemSolutionProblem || "",
      solution: i8.problemSolutionSolution || "",
      result: i8.problemSolutionResult || "",
    },
    howTo,
    faq,
    todo,
    methodology: i8.methodology || "",
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

export function parseAllIterations(
  fullChat: string
): Map<number, Record<string, string>> {
  const result = new Map<number, Record<string, string>>();
  const sections = fullChat.split(/(?=##\s*Итерация\s+\d+)/i);

  for (const section of sections) {
    const match = section.match(/##\s*Итерация\s+(\d+)/i);
    if (!match) continue;
    const iterNum = Number(match[1]);

    const fields: Record<string, string> = {};
    const blocks = section.split(/^###\s+/m).slice(1);

    for (const block of blocks) {
      const newlineIdx = block.indexOf("\n");
      if (newlineIdx === -1) {
        fields[block.trim().toLowerCase()] = "";
        continue;
      }
      const key = block.slice(0, newlineIdx).trim();
      const value = block.slice(newlineIdx + 1).trim();
      fields[key.toLowerCase()] = value;
    }

    if (Object.keys(fields).length > 0) {
      result.set(iterNum, fields);
    }
  }

  return result;
}
