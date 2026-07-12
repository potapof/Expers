import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const experts = sqliteTable("experts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("reader"),
  avatar: text("avatar"),
  bio: text("bio"),
  expertise: text("expertise"),
  credentials: text("credentials"),
  socialLinks: text("social_links"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    slug: text("slug"),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    industryId: text("industry_id").notNull(),
    industryName: text("industry_name").notNull(),
    subsectionId: text("subsection_id").notNull(),
    subsectionName: text("subsection_name").notNull(),
    categoryId: text("category_id").notNull(),
    categoryName: text("category_name").notNull(),
    customCategory: text("custom_category").default(""),
    expertiseAreas: text("expertise_areas"),
    crossLinks: text("cross_links"),
    tldr: text("tldr").notNull(),
    keyFacts: text("key_facts").notNull(),
    definition: text("definition").notNull(),
    featuredSnippet: text("featured_snippet").notNull(),
    problemSolutionResult: text("problem_solution_result").notNull(),
    howTo: text("how_to").notNull(),
    faq: text("faq").notNull(),
    todo: text("todo"),
    methodology: text("methodology").notNull(),
    sources: text("sources").notNull(),
    readTime: text("read_time").notNull(),
    status: text("status").notNull().default("draft"),
    expertId: text("expert_id").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("articles_status_idx").on(table.status),
    index("articles_expert_idx").on(table.expertId),
    index("articles_slug_idx").on(table.industryId, table.slug),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    articleId: text("article_id").notNull(),
    parentId: text("parent_id"),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    text: text("text").notNull(),
    isAuthorReply: integer("is_author_reply", { mode: "boolean" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("comments_article_idx").on(table.articleId, table.createdAt),
    index("comments_author_idx").on(table.authorId, table.createdAt),
  ]
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull(),
    articleId: text("article_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("favorites_pk").on(table.userId, table.articleId)]
);

export const viewingHistory = sqliteTable(
  "viewing_history",
  {
    userId: text("user_id").notNull(),
    articleId: text("article_id").notNull(),
    viewedAt: text("viewed_at").notNull(),
  },
  (table) => [index("viewing_history_pk").on(table.userId, table.articleId)]
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    subscriberId: text("subscriber_id").notNull(),
    subscriberName: text("subscriber_name"),
    authorId: text("author_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("subscriptions_pk").on(table.subscriberId, table.authorId),
    index("subscriptions_author_idx").on(table.authorId),
  ]
);

export const sectionSubscriptions = sqliteTable(
  "section_subscriptions",
  {
    userId: text("user_id").notNull(),
    sectionId: text("section_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("section_subscriptions_pk").on(table.userId, table.sectionId),
  ]
);

export const payments = sqliteTable(
  "payments",
  {
    orderId: text("order_id").primaryKey(),
    paymentId: text("payment_id").notNull(),
    articleId: text("article_id").notNull(),
    title: text("title").notNull(),
    userId: text("user_id").notNull(),
    amount: integer("amount").notNull(),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("payments_user_idx").on(table.userId, table.createdAt)]
);
