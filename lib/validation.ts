import { z } from "zod";

export const step1Schema = z.object({
  industryId: z.string().min(1, "Выберите отрасль"),
  industryName: z.string().min(1),
});

export const step2Schema = z.object({
  subsectionId: z.string().min(1, "Выберите подсектор"),
  subsectionName: z.string().min(1),
});

export const step3Schema = z.object({
  categoryId: z.string().min(1, "Выберите или создайте категорию"),
  categoryName: z.string().min(1),
  customCategory: z.string().max(200).optional().default(""),
});

export const step4Schema = z.object({
  expertiseAreas: z
    .array(z.string().min(1))
    .min(3, "Укажите минимум 3 области экспертизы")
    .max(5, "Максимум 5 областей экспертизы"),
});

export const step5Schema = z.object({
  crossLinks: z
    .array(
      z.object({
        articleId: z.string(),
        title: z.string(),
        industryId: z.string(),
      })
    )
    .min(5, "Добавьте минимум 5 кросс-ссылок")
    .max(8, "Максимум 8 кросс-ссылок"),
});

export const step6Schema = z.object({
  title: z
    .string()
    .min(10, "Заголовок должен быть не менее 10 символов")
    .max(200, "Заголовок должен быть не более 200 символов"),
  introduction: z
    .string()
    .min(40, "Введение должно быть не менее 40 слов")
    .max(600, "Введение должно быть не более 60 слов"),
  slug: z
    .string()
    .min(2, "URL должен быть не менее 2 символов")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефисы")
    .optional(),
});

export const step7Schema = z.object({
  content: z
    .string()
    .min(100, "Текст должен быть не менее 100 символов")
    .max(10000, "Текст должен быть не более 10 000 символов"),
});

export const step8Schema = z.object({
  faq: z
    .array(
      z.object({
        question: z.string().min(5, "Вопрос должен быть не менее 5 символов"),
        answer: z.string().min(10, "Ответ должен быть не менее 10 символов"),
      })
    )
    .min(3, "Добавьте минимум 3 вопроса")
    .max(5, "Максимум 5 вопросов"),
});

export const step9Schema = z.object({
  todo: z
    .array(
      z.object({
        text: z.string().min(2, "Пункт должен быть не менее 2 символов"),
        done: z.boolean().default(false),
      })
    )
    .min(1, "Добавьте хотя бы 1 пункт"),
});

export const step10Schema = z.object({
  tldr: z.string().min(20, "TL;DR должен быть не менее 20 символов").max(500),
  keyFacts: z
    .array(
      z.object({
        icon: z.string(),
        text: z.string().min(5),
      })
    )
    .min(3, "Добавьте минимум 3 факта")
    .max(7, "Максимум 7 фактов"),
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
      z.object({
        title: z.string().min(5),
        description: z.string().min(10),
      })
    )
    .min(1, "Добавьте хотя бы 1 шаг"),
  methodology: z.string().min(20).max(1000),
  sources: z
    .array(
      z.object({
        title: z.string().min(3),
        url: z.string().url("Введите корректный URL"),
      })
    )
    .min(1, "Добавьте хотя бы 1 источник"),
});
