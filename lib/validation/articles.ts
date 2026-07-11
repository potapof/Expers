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

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(600).optional(),
  content: z.string().max(10000).optional(),
  industryId: z.string().optional(),
  industryName: z.string().optional(),
  subsectionId: z.string().optional(),
  subsectionName: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
});

export const actionSchema = z.object({
  action: z.enum(["publish", "unpublish", "archive", "duplicate"]),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleAction = z.infer<typeof actionSchema>["action"];
