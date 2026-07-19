import { z } from "zod";

z.setErrorMap(((issue: any, _ctx: any) => {
  if (issue.code === "too_small") {
    if (issue.type === "string" && typeof issue.minimum === "number") {
      return { message: `Минимум ${issue.minimum} символов` };
    }
    return { message: `Минимум ${issue.minimum ?? ""}` };
  }
  if (issue.code === "too_big") {
    if (issue.type === "string" && typeof issue.maximum === "number") {
      return { message: `Максимум ${issue.maximum} символов` };
    }
    return { message: `Максимум ${issue.maximum ?? ""}` };
  }
  if (issue.code === "invalid_format" || issue.code === "invalid_string") {
    return {
      message:
        "Некорректный формат. Допустимы только латинские буквы, цифры и дефисы",
    };
  }
  return { message: "Некорректное значение" };
}) as any);

export const iterationSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    title: z.string().min(10).max(200),
    introduction: z.string().min(40).max(600),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9-]+$/)
      .optional()
      .or(z.literal("")),
  }),
  2: z.object({
    sectionTitle: z.string().min(5).max(200),
    section1Title: z.string().min(5).max(200),
    section1Description: z.string().max(500).optional().or(z.literal("")),
    section1Design: z.literal("image-only"),
    section1ImageUrl: z.string().min(1),
    section1Text: z.string().optional().or(z.literal("")),
    section2Title: z.string().min(5).max(200),
    section2Design: z.literal("text-only"),
    section2Text: z.string().min(5000),
  }),
  3: z.object({
    sectionTitle: z.string().min(5).max(200),
    sectionDescription: z.string().max(500).optional().or(z.literal("")),
    sectionDesign: z.literal("text-only"),
    sectionText: z.string().min(5000),
  }),
  4: z.object({
    sectionTitle: z.string().min(5).max(200),
    sectionDescription: z.string().max(500).optional().or(z.literal("")),
    sectionDesign: z.literal("image-right"),
    imageUrl: z.string().min(1),
    sectionText: z.string().min(5000),
  }),
  5: z.object({
    sectionTitle: z.string().min(5).max(200),
    sectionDescription: z.string().max(500).optional().or(z.literal("")),
    sectionDesign: z.literal("text-only"),
    sectionText: z.string().min(5000),
  }),
  6: z.object({
    sectionTitle: z.string().min(5).max(200),
    section1Title: z.string().min(5).max(200),
    section1Description: z.string().max(500).optional().or(z.literal("")),
    section1Design: z.literal("image-only"),
    section1ImageUrl: z.string().min(1),
    section1Text: z.string().optional().or(z.literal("")),
    section2Title: z.string().min(5).max(200),
    section2Design: z.literal("text-only"),
    section2Text: z.string().min(5000),
  }),
  7: z.object({
    sectionTitle: z.string().min(5).max(200),
    sectionDescription: z.string().max(500).optional().or(z.literal("")),
    sectionDesign: z.literal("text-only"),
    sectionText: z.string().min(5000),
  }),
  8: z.object({
    faq: z.string().min(1),
    todo: z.string().min(1),
    tldr: z.string().min(20).max(500),
    keyFacts: z.string().min(1),
    definition: z.string().min(20).max(500),
    featuredSnippetQuestion: z.string().min(10),
    featuredSnippetAnswer: z.string().min(20),
    problemSolutionProblem: z.string().min(20),
    problemSolutionSolution: z.string().min(20),
    problemSolutionResult: z.string().min(20),
    howTo: z.string().min(1),
    methodology: z.string().min(20).max(1000),
    sources: z.string().min(1),
  }),
};

export const importArticleSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(40).max(600),
  content: z.string().min(100).max(150000),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .or(z.literal("")),
  industryId: z.string().min(1),
  industryName: z.string().min(1),
  subsectionId: z.string().min(1),
  subsectionName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  customCategory: z.string().max(200).optional().default(""),
  expertiseAreas: z.array(z.string()).min(0).max(5).default([]),
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
    .min(0)
    .max(7)
    .default([]),
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
    .min(0)
    .default([]),
  faq: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .max(5)
    .min(0)
    .default([]),
  todo: z
    .array(
      z.object({ text: z.string().min(1), done: z.boolean().default(false) })
    )
    .min(0)
    .default([]),
  methodology: z.string().min(20).max(1000),
  sources: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
    .min(0)
    .default([]),
  sectionsText: z.string().optional().nullable(),
});

export type ImportArticleData = z.infer<typeof importArticleSchema>;
