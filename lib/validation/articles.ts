import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(200),
  description: z.string().max(600).optional().default(""),
  content: z.string().max(10000).optional().default(""),
  industryId: z.string().optional().default(""),
  industryName: z.string().optional().default(""),
  subsectionId: z.string().optional().default(""),
  subsectionName: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  categoryName: z.string().optional().default(""),
});

export const updateArticleFullSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(40).max(600).optional(),
  content: z.string().min(100).max(150000).optional(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .or(z.literal(""))
    .optional(),
  status: z.enum(["draft", "pending_review", "pending_payment"]).optional(),
  industryId: z.string().min(1).optional(),
  industryName: z.string().min(1).optional(),
  subsectionId: z.string().min(1).optional(),
  subsectionName: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).optional(),
  customCategory: z.string().max(200).optional(),
  expertiseAreas: z.array(z.string()).min(1).max(5).optional(),
  crossLinks: z
    .array(
      z.object({
        articleId: z.string(),
        title: z.string(),
        industryId: z.string(),
      })
    )
    .max(8)
    .optional(),
  tldr: z.string().min(20).max(500).optional(),
  keyFacts: z
    .array(z.object({ icon: z.string(), text: z.string().min(1) }))
    .min(1)
    .max(7)
    .optional(),
  definition: z.string().min(20).max(500).optional(),
  featuredSnippet: z
    .object({ question: z.string().min(10), answer: z.string().min(20) })
    .optional(),
  problemSolutionResult: z
    .object({
      problem: z.string().min(20),
      solution: z.string().min(20),
      result: z.string().min(20),
    })
    .optional(),
  howTo: z
    .array(
      z.object({ title: z.string().min(1), description: z.string().min(1) })
    )
    .min(1)
    .optional(),
  faq: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .max(5)
    .optional(),
  todo: z
    .array(
      z.object({ text: z.string().min(1), done: z.boolean().default(false) })
    )
    .optional(),
  methodology: z.string().min(20).max(1000).optional(),
  sources: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
    .optional(),
  sectionsText: z.string().optional().nullable(),
});

export const actionSchema = z.object({
  action: z.enum(["publish", "unpublish", "archive", "duplicate"]),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleFullSchema>;
export type ArticleAction = z.infer<typeof actionSchema>["action"];
