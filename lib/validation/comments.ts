import { z } from "zod";

export const createCommentSchema = z.object({
  articleId: z.string().min(1).max(200),
  parentId: z.string().min(1).max(200).optional(),
  text: z.string().min(1).max(5000),
});

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(5000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
