import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(100),
  url: z.string().url("Некорректный URL").max(500),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(200).optional(),
  avatar: z.string().max(1000).optional(),
  bio: z.string().max(2000).optional(),
  expertise: z.array(z.string().max(200)).max(20).optional(),
  credentials: z.array(z.string().max(200)).max(20).optional(),
  socialLinks: z.array(socialLinkSchema).max(20).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
