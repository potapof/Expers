import type { Article, SafeExpert } from "./models";

export const mockExpertProfiles: SafeExpert[] = [
  {
    id: "expert-mock-1",
    name: "Алексей Смирнов",
    email: "alexey@example.com",
    avatar: "",
    bio: "Эксперт по промышленной автоматизации с 15-летним стажем. Руководитель отдела цифровых технологий на крупном машиностроительном предприятии.",
    expertise: ["Промышленная автоматизация", "Компьютерное зрение", "IIoT"],
    credentials: ["Кандидат технических наук", "Сертифицированный инженер ISA"],
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/alexey-smirnov" },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "expert-mock-2",
    name: "Елена Козлова",
    email: "elena@example.com",
    avatar: "",
    bio: "Финансовый аналитик, эксперт по цифровым валютам центральных банков (CBDC). Автор более 50 публикаций по финтеху и банковским инновациям.",
    expertise: ["Цифровые валюты", "Финтех", "Банковские технологии"],
    credentials: ["MBA, Стокгольмская школа экономики", "CFA Level III"],
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/elena-kozlova" },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

export const mockArticles: Article[] = [
  {
    id: "article-1",
    title: "Как ИИ меняет автоматизацию производства в 2026 году",
    description:
      "Нейросети и компьютерное зрение радикально трансформируют контроль качества и управление производственными линиями. Разбираем ключевые тренды и реальные кейсы.",
    content: "",
    authorId: "author-1",
    authorName: "Алексей Смирнов",
    industryId: "manufacturing",
    industryName: "Производство",
    subsectionId: "manufacturing-tech",
    subsectionName: "Технологии производства",
    categoryId: "automation",
    categoryName: "Автоматизация",
    customCategory: "",
    expertiseAreas: [
      "Промышленная автоматизация",
      "Компьютерное зрение",
      "IIoT",
    ],
    crossLinks: [],
    tldr: "ИИ трансформирует промышленное производство через компьютерное зрение для контроля качества и предиктивное обслуживание.",
    keyFacts: [],
    definition: "",
    featuredSnippet: { question: "", answer: "" },
    problemSolutionResult: { problem: "", solution: "", result: "" },
    howTo: [],
    faq: [],
    todo: [],
    methodology: "",
    sources: [],
    readTime: "8 мин",
    status: "published",
    expertId: "expert-mock-1",
    createdAt: "2026-06-20T00:00:00Z",
    updatedAt: "2026-06-20T00:00:00Z",
  },
  {
    id: "article-2",
    title: "Цифровой рубль и будущее розничного банкинга",
    description:
      "Как внедрение цифрового рубля изменит ландшафт банковских услуг и какие стратегии выбирают крупнейшие банки для адаптации к новой реальности.",
    content: "",
    authorId: "author-2",
    authorName: "Елена Козлова",
    industryId: "finance",
    industryName: "Финансы",
    subsectionId: "banking",
    subsectionName: "Банковское дело",
    categoryId: "digital-banking",
    categoryName: "Цифровой банкинг",
    customCategory: "",
    expertiseAreas: ["Цифровые валюты", "Финтех", "Банковские технологии"],
    crossLinks: [],
    tldr: "Цифровой рубль становится реальностью: с 2026 года ЦБ расширяет пилот на все банки.",
    keyFacts: [],
    definition: "",
    featuredSnippet: { question: "", answer: "" },
    problemSolutionResult: { problem: "", solution: "", result: "" },
    howTo: [],
    faq: [],
    todo: [],
    methodology: "",
    sources: [],
    readTime: "10 мин",
    status: "published",
    expertId: "expert-mock-2",
    createdAt: "2026-06-18T00:00:00Z",
    updatedAt: "2026-06-18T00:00:00Z",
  },
];

export const mockDashboardStats = {
  totalArticles: 2,
  pendingReview: 0,
  publishedToday: 0,
  totalExperts: 2,
  payingExperts: 0,
  revenueMonth: 0,
};

export const mockPublicationsByDay: Array<{ date: string; count: number }> = [];

export const mockRevenueByMonth: Array<{ month: string; total: number }> = [];

export const mockRegistrationsByMonth: Array<{ month: string; count: number }> =
  [];

export const mockExpertRows: Array<{
  id: string;
  name: string;
  email: string;
  role: string;
  articleCount: number;
  hasPaid: boolean;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "expert-mock-1",
    name: "Алексей Смирнов",
    email: "alexey@example.com",
    role: "expert",
    articleCount: 1,
    hasPaid: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "expert-mock-2",
    name: "Елена Козлова",
    email: "elena@example.com",
    role: "expert",
    articleCount: 1,
    hasPaid: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

export const mockCommentsWithArticle = {
  comments: [] as Array<{
    id: string;
    articleId: string;
    parentId?: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
    isAuthorReply?: boolean;
    articleTitle: string;
  }>,
  total: 0,
};
