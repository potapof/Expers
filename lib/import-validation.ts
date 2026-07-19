import { z } from "zod";

z.setErrorMap(((issue: any, _ctx: any) => {
  if (issue.code === "too_small") {
    if (issue.type === "string" && typeof issue.minimum === "number") {
      return { message: `Минимум ${issue.minimum} символов` };
    }
    if (issue.type === "array" && typeof issue.minimum === "number") {
      return { message: `Минимум ${issue.minimum} элементов` };
    }
    return { message: `Минимум ${issue.minimum ?? ""}` };
  }
  if (issue.code === "too_big") {
    if (issue.type === "string" && typeof issue.maximum === "number") {
      return { message: `Максимум ${issue.maximum} символов` };
    }
    if (issue.type === "array" && typeof issue.maximum === "number") {
      return { message: `Максимум ${issue.maximum} элементов` };
    }
    return { message: `Максимум ${issue.maximum ?? ""}` };
  }
  if (issue.code === "invalid_format" || issue.code === "invalid_string") {
    return {
      message:
        "Некорректный формат. Допустимы только латинские буквы, цифры и дефисы",
    };
  }
  if (issue.code === "invalid_type") {
    return { message: "Поле обязательно для заполнения" };
  }
  return { message: "Некорректное значение" };
}) as any);

export const iterationSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    title: z.string().min(10).max(200),
    introduction: z.string().min(100).max(600),
    slug: z
      .string()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9-]+$/)
      .optional()
      .or(z.literal("")),
  }),
  2: z.object({ sectionCount: z.string().min(1) }),
  3: z.object({ sectionCount: z.string().min(1) }),
  4: z.object({ sectionCount: z.string().min(1) }),
  5: z.object({ sectionCount: z.string().min(1) }),
  6: z.object({ sectionCount: z.string().min(1) }),
  7: z.object({ sectionCount: z.string().min(1) }),
  8: z.object({
    faq: z.string().min(1),
    todo: z.string().min(1),
    tldr: z.string().max(30),
    keyFacts: z.string().min(1),
    definition: z.string().max(30),
    featuredSnippetQuestion: z.string().max(30),
    featuredSnippetAnswer: z.string().min(3),
    problemSolutionProblem: z.string().max(30),
    problemSolutionSolution: z.string().max(30),
    problemSolutionResult: z.string().max(30),
    howTo: z.string().min(1),
    methodology: z.string().min(3).max(1000),
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
  tldr: z.string().max(30),
  keyFacts: z
    .array(z.object({ icon: z.string(), text: z.string().min(1) }))
    .min(0)
    .max(7)
    .default([]),
  definition: z.string().max(30),
  featuredSnippet: z.object({
    question: z.string().max(30),
    answer: z.string().min(3),
  }),
  problemSolutionResult: z.object({
    problem: z.string().max(30),
    solution: z.string().max(30),
    result: z.string().max(30),
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
  methodology: z.string().min(3).max(1000),
  sources: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
    .min(0)
    .default([]),
  sectionsText: z.string().optional().nullable(),
});

export type ImportArticleData = z.infer<typeof importArticleSchema>;
