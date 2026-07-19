import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  experts,
  articles,
  comments,
  favorites,
  viewingHistory,
  subscriptions,
  sectionSubscriptions,
  payments,
  passwordResets,
} from "./schema";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Publication {
  title: string;
  url?: string;
  date?: string;
  description?: string;
}

export interface Achievement {
  title: string;
  date?: string;
  description?: string;
}

export interface MediaMention {
  outlet: string;
  title: string;
  url?: string;
  date?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  text: string;
  avatar?: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: "reader" | "expert" | "admin";
  avatar?: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: SocialLink[];
  workExperience?: WorkExperience[];
  publications?: Publication[];
  achievements?: Achievement[];
  mediaMentions?: MediaMention[];
  faq?: FAQItem[];
  testimonials?: Testimonial[];
  callToAction?: string;
  authorPageSlug?: string;
  authorPagePublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SafeExpert = Omit<Expert, "passwordHash">;

function jsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function jsonStringify(val: unknown): string {
  return JSON.stringify(val);
}

function rowToExpert(row: typeof experts.$inferSelect): Expert {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: (row.role as "reader" | "expert" | "admin") ?? "reader",
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    expertise: jsonParse(row.expertise, undefined),
    credentials: jsonParse(row.credentials, undefined),
    socialLinks: jsonParse(row.socialLinks, undefined),
    workExperience: jsonParse(row.workExperience, undefined),
    publications: jsonParse(row.publications, undefined),
    achievements: jsonParse(row.achievements, undefined),
    mediaMentions: jsonParse(row.mediaMentions, undefined),
    faq: jsonParse(row.faq, undefined),
    testimonials: jsonParse(row.testimonials, undefined),
    callToAction: row.callToAction ?? undefined,
    authorPageSlug: row.authorPageSlug ?? undefined,
    authorPagePublished: row.authorPagePublished ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getExpertByEmail(email: string): Promise<Expert | null> {
  const rows = db.select().from(experts).where(eq(experts.email, email)).all();
  return rows[0] ? rowToExpert(rows[0]) : null;
}

export async function getExpertById(id: string): Promise<Expert | null> {
  const rows = db.select().from(experts).where(eq(experts.id, id)).all();
  return rows[0] ? rowToExpert(rows[0]) : null;
}

export async function createExpert(
  data: Omit<Expert, "createdAt" | "updatedAt">
): Promise<Expert> {
  const now = new Date().toISOString();
  const expert: Expert = { ...data, createdAt: now, updatedAt: now };

  db.insert(experts)
    .values({
      id: expert.id,
      name: expert.name,
      email: expert.email,
      passwordHash: expert.passwordHash,
      role: expert.role ?? "reader",
      avatar: expert.avatar ?? null,
      bio: expert.bio ?? null,
      expertise: expert.expertise ? jsonStringify(expert.expertise) : null,
      credentials: expert.credentials
        ? jsonStringify(expert.credentials)
        : null,
      socialLinks: expert.socialLinks
        ? jsonStringify(expert.socialLinks)
        : null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return expert;
}

export async function updateExpert(
  id: string,
  data: Partial<
    Pick<
      Expert,
      "name" | "avatar" | "bio" | "expertise" | "credentials" | "socialLinks"
    >
  >
): Promise<Expert> {
  const values: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (data.name !== undefined) values.name = data.name;
  if (data.avatar !== undefined) values.avatar = data.avatar;
  if (data.bio !== undefined) values.bio = data.bio;
  if (data.expertise !== undefined)
    values.expertise = jsonStringify(data.expertise);
  if (data.credentials !== undefined)
    values.credentials = jsonStringify(data.credentials);
  if (data.socialLinks !== undefined)
    values.socialLinks = jsonStringify(data.socialLinks);

  db.update(experts).set(values).where(eq(experts.id, id)).run();

  const rows = db.select().from(experts).where(eq(experts.id, id)).all();
  return rowToExpert(rows[0]);
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  slug?: string;
  authorId: string;
  authorName: string;
  industryId: string;
  industryName: string;
  subsectionId: string;
  subsectionName: string;
  categoryId: string;
  categoryName: string;
  customCategory: string;
  expertiseAreas: string[];
  crossLinks: { articleId: string; title: string; industryId: string }[];
  tldr: string;
  keyFacts: { icon: string; text: string }[];
  definition: string;
  featuredSnippet: { question: string; answer: string };
  problemSolutionResult: { problem: string; solution: string; result: string };
  howTo: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  todo: { text: string; done: boolean }[];
  methodology: string;
  sources: { title: string; url: string }[];
  readTime: string;
  status:
    "draft" | "published" | "archived" | "pending_payment" | "pending_review";
  expertId: string;
  sectionsText?: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToArticle(row: typeof articles.$inferSelect): Article {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    slug: row.slug ?? undefined,
    authorId: row.authorId,
    authorName: row.authorName,
    industryId: row.industryId,
    industryName: row.industryName,
    subsectionId: row.subsectionId,
    subsectionName: row.subsectionName,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    customCategory: row.customCategory ?? "",
    expertiseAreas: jsonParse(row.expertiseAreas, []),
    crossLinks: jsonParse(row.crossLinks, []),
    tldr: row.tldr,
    keyFacts: jsonParse(row.keyFacts, []),
    definition: row.definition,
    featuredSnippet: jsonParse(row.featuredSnippet, {
      question: "",
      answer: "",
    }),
    problemSolutionResult: jsonParse(row.problemSolutionResult, {
      problem: "",
      solution: "",
      result: "",
    }),
    howTo: jsonParse(row.howTo, []),
    faq: jsonParse(row.faq, []),
    todo: jsonParse(row.todo, []),
    methodology: row.methodology,
    sources: jsonParse(row.sources, []),
    readTime: row.readTime,
    status: row.status as Article["status"],
    expertId: row.expertId,
    sectionsText: row.sectionsText ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function articleToRow(article: Article) {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    slug: article.slug ?? null,
    authorId: article.authorId,
    authorName: article.authorName,
    industryId: article.industryId,
    industryName: article.industryName,
    subsectionId: article.subsectionId,
    subsectionName: article.subsectionName,
    categoryId: article.categoryId,
    categoryName: article.categoryName,
    customCategory: article.customCategory,
    expertiseAreas: jsonStringify(article.expertiseAreas),
    crossLinks: jsonStringify(article.crossLinks),
    tldr: article.tldr,
    keyFacts: jsonStringify(article.keyFacts),
    definition: article.definition,
    featuredSnippet: jsonStringify(article.featuredSnippet),
    problemSolutionResult: jsonStringify(article.problemSolutionResult),
    howTo: jsonStringify(article.howTo),
    faq: jsonStringify(article.faq),
    todo: jsonStringify(article.todo),
    methodology: article.methodology,
    sources: jsonStringify(article.sources),
    readTime: article.readTime,
    status: article.status,
    expertId: article.expertId,
    sectionsText: article.sectionsText ?? null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export async function createArticle(
  data: Omit<Article, "createdAt" | "updatedAt">
): Promise<Article> {
  const now = new Date().toISOString();
  const article: Article = { ...data, createdAt: now, updatedAt: now };
  db.insert(articles).values(articleToRow(article)).run();
  return article;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const rows = db.select().from(articles).where(eq(articles.id, id)).all();
  return rows[0] ? rowToArticle(rows[0]) : null;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const rows = db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.createdAt))
    .all();
  return rows.map(rowToArticle);
}

export async function getArticlesByExpert(
  expertId: string
): Promise<Article[]> {
  const rows = db
    .select()
    .from(articles)
    .where(eq(articles.expertId, expertId))
    .orderBy(desc(articles.createdAt))
    .all();
  return rows.map(rowToArticle);
}

const KEY_MAP: Record<string, string> = {
  authorId: "author_id",
  authorName: "author_name",
  industryId: "industry_id",
  industryName: "industry_name",
  subsectionId: "subsection_id",
  subsectionName: "subsection_name",
  categoryId: "category_id",
  categoryName: "category_name",
  customCategory: "custom_category",
  expertiseAreas: "expertise_areas",
  crossLinks: "cross_links",
  keyFacts: "key_facts",
  featuredSnippet: "featured_snippet",
  problemSolutionResult: "problem_solution_result",
  howTo: "how_to",
  readTime: "read_time",
  expertId: "expert_id",
};

export async function updateArticle(
  id: string,
  data: Partial<Article>
): Promise<Article> {
  const values: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;
    const col = KEY_MAP[key] ?? key;
    if (Array.isArray(value) || (value && typeof value === "object")) {
      values[col] = jsonStringify(value);
    } else {
      values[col] = value;
    }
  }

  db.update(articles).set(values).where(eq(articles.id, id)).run();
  const rows = db.select().from(articles).where(eq(articles.id, id)).all();
  return rowToArticle(rows[0]);
}

export async function deleteArticle(
  id: string,
  callerId?: string
): Promise<void> {
  if (callerId) {
    const article = await getArticleById(id);
    if (!article) {
      throw new Error("Not found: article does not exist");
    }
    if (article.expertId !== callerId) {
      throw new Error("Forbidden: article does not belong to caller");
    }
  }
  db.delete(articles).where(eq(articles.id, id)).run();
}

export async function isSlugTaken(
  industryId: string,
  slug: string,
  excludeArticleId?: string
): Promise<boolean> {
  let query = db
    .select({ id: articles.id })
    .from(articles)
    .where(
      and(
        eq(articles.industryId, industryId),
        eq(articles.slug, slug),
        sql`${articles.status} != 'archived'`
      )
    );

  const rows = query.all();
  return rows.some((r) => r.id !== excludeArticleId);
}

export async function getArticleBySlug(
  industryId: string,
  slug: string
): Promise<Article | null> {
  const rows = db
    .select()
    .from(articles)
    .where(and(eq(articles.industryId, industryId), eq(articles.slug, slug)))
    .all();
  return rows[0] ? rowToArticle(rows[0]) : null;
}

export async function getAllPublishedArticles(): Promise<Article[]> {
  const rows = db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .all();
  return rows.map(rowToArticle);
}

export interface Comment {
  id: string;
  articleId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  isAuthorReply?: boolean;
}

export async function createComment(comment: Comment): Promise<Comment> {
  db.insert(comments)
    .values({
      id: comment.id,
      articleId: comment.articleId,
      parentId: comment.parentId ?? null,
      authorId: comment.authorId,
      authorName: comment.authorName,
      text: comment.text,
      isAuthorReply: comment.isAuthorReply ?? null,
      createdAt: comment.createdAt,
    })
    .run();
  return comment;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const rows = db.select().from(comments).where(eq(comments.id, id)).all();
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    articleId: row.articleId,
    parentId: row.parentId ?? undefined,
    authorId: row.authorId,
    authorName: row.authorName,
    text: row.text,
    createdAt: row.createdAt,
    isAuthorReply: row.isAuthorReply ?? undefined,
  };
}

export async function getCommentsByArticle(
  articleId: string
): Promise<Comment[]> {
  const rows = db
    .select()
    .from(comments)
    .where(eq(comments.articleId, articleId))
    .orderBy(asc(comments.createdAt))
    .all();
  return rows.map((r) => ({
    id: r.id,
    articleId: r.articleId,
    parentId: r.parentId ?? undefined,
    authorId: r.authorId,
    authorName: r.authorName,
    text: r.text,
    createdAt: r.createdAt,
    isAuthorReply: r.isAuthorReply ?? undefined,
  }));
}

export async function getCommentsByAuthor(
  authorId: string
): Promise<Comment[]> {
  const rows = db
    .select()
    .from(comments)
    .where(eq(comments.authorId, authorId))
    .orderBy(desc(comments.createdAt))
    .all();
  return rows.map((r) => ({
    id: r.id,
    articleId: r.articleId,
    parentId: r.parentId ?? undefined,
    authorId: r.authorId,
    authorName: r.authorName,
    text: r.text,
    createdAt: r.createdAt,
    isAuthorReply: r.isAuthorReply ?? undefined,
  }));
}

export async function updateCommentText(
  id: string,
  text: string
): Promise<Comment> {
  db.update(comments).set({ text }).where(eq(comments.id, id)).run();
  return getCommentById(id) as Promise<Comment>;
}

export async function deleteCommentCascade(
  id: string,
  articleId: string
): Promise<void> {
  const articleComments = await getCommentsByArticle(articleId);
  const toDelete = articleComments.filter(
    (c) => c.id === id || c.parentId === id
  );

  for (const c of toDelete) {
    db.delete(comments).where(eq(comments.id, c.id)).run();
  }
}

export interface Favorite {
  userId: string;
  articleId: string;
  createdAt: string;
}

export async function getFavoriteArticleIds(userId: string): Promise<string[]> {
  const rows = db
    .select({ articleId: favorites.articleId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .all();
  return rows.map((r) => r.articleId);
}

export async function addFavorite(
  userId: string,
  articleId: string
): Promise<void> {
  db.insert(favorites)
    .values({
      userId,
      articleId,
      createdAt: new Date().toISOString(),
    })
    .run();
}

export async function removeFavorite(
  userId: string,
  articleId: string
): Promise<void> {
  db.delete(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.articleId, articleId))
    )
    .run();
}

export interface ViewingHistoryEntry {
  articleId: string;
  viewedAt: string;
}

const MAX_HISTORY_ENTRIES = 50;

export async function getViewingHistory(
  userId: string
): Promise<ViewingHistoryEntry[]> {
  const rows = db
    .select({
      articleId: viewingHistory.articleId,
      viewedAt: viewingHistory.viewedAt,
    })
    .from(viewingHistory)
    .where(eq(viewingHistory.userId, userId))
    .orderBy(desc(viewingHistory.viewedAt))
    .all();
  return rows;
}

export async function addViewingHistory(
  userId: string,
  articleId: string
): Promise<void> {
  const now = new Date().toISOString();

  db.delete(viewingHistory)
    .where(
      and(
        eq(viewingHistory.userId, userId),
        eq(viewingHistory.articleId, articleId)
      )
    )
    .run();

  db.insert(viewingHistory).values({ userId, articleId, viewedAt: now }).run();

  const countRows = db
    .select({ count: sql<number>`count(*)` })
    .from(viewingHistory)
    .where(eq(viewingHistory.userId, userId))
    .all();
  const total = countRows[0]?.count ?? 0;

  if (total > MAX_HISTORY_ENTRIES) {
    const excess = total - MAX_HISTORY_ENTRIES;
    const oldest = db
      .select({ articleId: viewingHistory.articleId })
      .from(viewingHistory)
      .where(eq(viewingHistory.userId, userId))
      .orderBy(asc(viewingHistory.viewedAt))
      .limit(excess)
      .all();

    for (const o of oldest) {
      db.delete(viewingHistory)
        .where(
          and(
            eq(viewingHistory.userId, userId),
            eq(viewingHistory.articleId, o.articleId)
          )
        )
        .run();
    }
  }
}

export async function clearViewingHistory(userId: string): Promise<void> {
  db.delete(viewingHistory).where(eq(viewingHistory.userId, userId)).run();
}

export interface SubscriberInfo {
  id: string;
  name: string;
  subscribedAt: string;
}

export async function getFollowedAuthorIds(
  subscriberId: string
): Promise<string[]> {
  const rows = db
    .select({ authorId: subscriptions.authorId })
    .from(subscriptions)
    .where(eq(subscriptions.subscriberId, subscriberId))
    .all();
  return rows.map((r) => r.authorId);
}

export async function getSubscribersOf(
  authorId: string
): Promise<SubscriberInfo[]> {
  const rows = db
    .select({
      subscriberId: subscriptions.subscriberId,
      subscriberName: subscriptions.subscriberName,
      createdAt: subscriptions.createdAt,
    })
    .from(subscriptions)
    .where(eq(subscriptions.authorId, authorId))
    .orderBy(desc(subscriptions.createdAt))
    .all();
  return rows.map((r) => ({
    id: r.subscriberId,
    name: r.subscriberName || r.subscriberId,
    subscribedAt: (r.createdAt || new Date().toISOString()).split("T")[0],
  }));
}

export async function addSubscription(
  subscriberId: string,
  subscriberName: string,
  authorId: string
): Promise<void> {
  db.insert(subscriptions)
    .values({
      subscriberId,
      subscriberName,
      authorId,
      createdAt: new Date().toISOString(),
    })
    .run();
}

export async function removeSubscription(
  subscriberId: string,
  authorId: string
): Promise<void> {
  db.delete(subscriptions)
    .where(
      and(
        eq(subscriptions.subscriberId, subscriberId),
        eq(subscriptions.authorId, authorId)
      )
    )
    .run();
}

export async function getSectionIds(userId: string): Promise<string[]> {
  const rows = db
    .select({ sectionId: sectionSubscriptions.sectionId })
    .from(sectionSubscriptions)
    .where(eq(sectionSubscriptions.userId, userId))
    .all();
  return rows.map((r) => r.sectionId);
}

export async function addSection(
  userId: string,
  sectionId: string
): Promise<void> {
  db.insert(sectionSubscriptions)
    .values({
      userId,
      sectionId,
      createdAt: new Date().toISOString(),
    })
    .run();
}

export async function removeSection(
  userId: string,
  sectionId: string
): Promise<void> {
  db.delete(sectionSubscriptions)
    .where(
      and(
        eq(sectionSubscriptions.userId, userId),
        eq(sectionSubscriptions.sectionId, sectionId)
      )
    )
    .run();
}

export async function setSections(
  userId: string,
  sectionIds: string[]
): Promise<void> {
  const current = await getSectionIds(userId);
  const next = new Set(sectionIds);
  const currentSet = new Set(current);

  const toAdd = sectionIds.filter((id) => !currentSet.has(id));
  const toRemove = current.filter((id) => !next.has(id));

  for (const sectionId of toAdd) {
    await addSection(userId, sectionId);
  }
  for (const sectionId of toRemove) {
    await removeSection(userId, sectionId);
  }
}

export type PaymentStatus =
  "NEW" | "CONFIRMED" | "REJECTED" | "CANCELED" | "REFUNDED";

export interface Payment {
  orderId: string;
  paymentId: string;
  articleId: string;
  title: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export async function createPayment(
  data: Omit<Payment, "createdAt" | "updatedAt">
): Promise<Payment> {
  const now = new Date().toISOString();
  const payment: Payment = { ...data, createdAt: now, updatedAt: now };
  const result = db
    .insert(payments)
    .values({
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      articleId: payment.articleId,
      title: payment.title,
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  if (result.changes === 0) {
    throw new Error("Failed to insert payment record");
  }
  return payment;
}

export async function getPaymentByOrderId(
  orderId: string
): Promise<Payment | null> {
  const rows = db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .all();
  const row = rows[0];
  if (!row) return null;
  return {
    orderId: row.orderId,
    paymentId: row.paymentId,
    articleId: row.articleId,
    title: row.title,
    userId: row.userId,
    amount: row.amount,
    status: row.status as PaymentStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const rows = db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .all();
  return rows.map((r) => ({
    orderId: r.orderId,
    paymentId: r.paymentId,
    articleId: r.articleId,
    title: r.title,
    userId: r.userId,
    amount: r.amount,
    status: r.status as PaymentStatus,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  paymentId?: string
): Promise<void> {
  const values: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (paymentId) {
    values.paymentId = paymentId;
  }
  db.update(payments).set(values).where(eq(payments.orderId, orderId)).run();
}

export async function updatePaymentStatusAtomic(
  orderId: string,
  newStatus: PaymentStatus,
  expectedStatus: PaymentStatus,
  paymentId?: string
): Promise<boolean> {
  const values: Record<string, unknown> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  if (paymentId) {
    values.paymentId = paymentId;
  }
  const result = db
    .update(payments)
    .set(values)
    .where(
      and(eq(payments.orderId, orderId), eq(payments.status, expectedStatus))
    )
    .run();
  return result.changes > 0;
}

export async function setArticleStatus(
  id: string,
  status: Article["status"]
): Promise<void> {
  db.update(articles)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(articles.id, id))
    .run();
}

export async function hasConfirmedPayment(userId: string): Promise<boolean> {
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "CONFIRMED")))
    .all();
  return (rows[0]?.count ?? 0) > 0;
}

export async function createPasswordReset(email: string): Promise<string> {
  const id = crypto.randomUUID();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  db.insert(passwordResets)
    .values({
      id,
      email,
      code,
      expiresAt,
      used: false,
      createdAt: now.toISOString(),
    })
    .run();
  return code;
}

export async function verifyPasswordReset(
  email: string,
  code: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const rows = db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.email, email),
        eq(passwordResets.code, code),
        eq(passwordResets.used, false)
      )
    )
    .orderBy(desc(passwordResets.createdAt))
    .limit(1)
    .all();
  if (rows.length === 0) return false;
  if (rows[0].expiresAt < now) return false;
  db.update(passwordResets)
    .set({ used: true })
    .where(eq(passwordResets.id, rows[0].id))
    .run();
  return true;
}

export async function updatePassword(
  email: string,
  newPasswordHash: string
): Promise<void> {
  db.update(experts)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date().toISOString() })
    .where(eq(experts.email, email))
    .run();
}

export async function saveAuthorPage(
  expertId: string,
  data: {
    name?: string;
    bio?: string;
    avatar?: string;
    expertise?: { area: string; description?: string }[];
    credentials?: { title: string; organization?: string; year?: string }[];
    socialLinks?: { platform: string; url: string }[];
    workExperience?: WorkExperience[];
    publications?: Publication[];
    achievements?: Achievement[];
    mediaMentions?: MediaMention[];
    faq?: FAQItem[];
    testimonials?: Testimonial[];
    callToAction?: string;
    authorPageSlug?: string;
  }
): Promise<void> {
  const values: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    authorPagePublished: true,
  };
  if (data.name !== undefined) values.name = data.name;
  if (data.bio !== undefined) values.bio = data.bio;
  if (data.avatar !== undefined) values.avatar = data.avatar;
  if (data.expertise !== undefined)
    values.expertise = jsonStringify(data.expertise);
  if (data.credentials !== undefined)
    values.credentials = jsonStringify(data.credentials);
  if (data.socialLinks !== undefined)
    values.socialLinks = jsonStringify(data.socialLinks);
  if (data.workExperience !== undefined)
    values.workExperience = jsonStringify(data.workExperience);
  if (data.publications !== undefined)
    values.publications = jsonStringify(data.publications);
  if (data.achievements !== undefined)
    values.achievements = jsonStringify(data.achievements);
  if (data.mediaMentions !== undefined)
    values.mediaMentions = jsonStringify(data.mediaMentions);
  if (data.faq !== undefined) values.faq = jsonStringify(data.faq);
  if (data.testimonials !== undefined)
    values.testimonials = jsonStringify(data.testimonials);
  if (data.callToAction !== undefined) values.callToAction = data.callToAction;
  if (data.authorPageSlug !== undefined)
    values.authorPageSlug = data.authorPageSlug;
  db.update(experts).set(values).where(eq(experts.id, expertId)).run();
}

export async function getAuthorPageBySlug(
  slug: string
): Promise<Expert | null> {
  const rows = db
    .select()
    .from(experts)
    .where(eq(experts.authorPageSlug, slug))
    .all();
  return rows.length > 0 ? rowToExpert(rows[0]) : null;
}

export async function getArticlesCount(): Promise<number> {
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .all();
  return rows[0]?.count ?? 0;
}

export async function getArticlesCountByStatus(
  status: Article["status"]
): Promise<number> {
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, status))
    .all();
  return rows[0]?.count ?? 0;
}

export async function getArticlesPublishedToday(): Promise<number> {
  const today = new Date();
  const todayStr = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  )
    .toISOString()
    .split("T")[0];
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        sql`${articles.createdAt} >= ${todayStr}`
      )
    )
    .all();
  return rows[0]?.count ?? 0;
}

export async function getExpertsCount(): Promise<number> {
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(experts)
    .all();
  return rows[0]?.count ?? 0;
}

export async function getPayingExpertsCount(): Promise<number> {
  const rows = db
    .select({ count: sql<number>`count(DISTINCT user_id)` })
    .from(payments)
    .where(eq(payments.status, "CONFIRMED"))
    .all();
  return rows[0]?.count ?? 0;
}

export async function getRevenueCurrentMonth(): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )
    .toISOString()
    .split("T")[0];
  const rows = db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(payments)
    .where(
      and(
        eq(payments.status, "CONFIRMED"),
        sql`${payments.createdAt} >= ${startOfMonth}`
      )
    )
    .all();
  return rows[0]?.total ?? 0;
}

export interface DailyPublication {
  date: string;
  count: number;
}

export async function getPublicationsByDay(
  days: number
): Promise<DailyPublication[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceStr = since.toISOString().split("T")[0];
  const rows = db
    .select({
      date: sql<string>`substr(${articles.createdAt}, 1, 10)`,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        sql`${articles.createdAt} >= ${sinceStr}`
      )
    )
    .groupBy(sql`substr(${articles.createdAt}, 1, 10)`)
    .orderBy(asc(sql`substr(${articles.createdAt}, 1, 10)`))
    .all();
  return rows;
}

export interface MonthlyRevenue {
  month: string;
  total: number;
}

export async function getRevenueByMonth(): Promise<MonthlyRevenue[]> {
  const rows = db
    .select({
      month: sql<string>`substr(${payments.createdAt}, 1, 7)`,
      total: sql<number>`SUM(amount)`,
    })
    .from(payments)
    .where(eq(payments.status, "CONFIRMED"))
    .groupBy(sql`substr(${payments.createdAt}, 1, 7)`)
    .orderBy(asc(sql`substr(${payments.createdAt}, 1, 7)`))
    .all();
  return rows.map((r) => ({ month: r.month, total: Number(r.total) }));
}

export async function getRecentArticles(limit: number): Promise<Article[]> {
  const rows = db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .all();
  return rows.map(rowToArticle);
}

export interface ArticlesFilter {
  status?: string;
  industryId?: string;
  expertId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function getArticlesFiltered(
  filter: ArticlesFilter
): Promise<{ articles: Article[]; total: number }> {
  const conditions: ReturnType<typeof sql>[] = [];

  if (filter.status) conditions.push(eq(articles.status, filter.status));
  if (filter.industryId)
    conditions.push(eq(articles.industryId, filter.industryId));
  if (filter.expertId) conditions.push(eq(articles.expertId, filter.expertId));
  if (filter.dateFrom)
    conditions.push(sql`${articles.createdAt} >= ${filter.dateFrom}`);
  if (filter.dateTo)
    conditions.push(sql`${articles.createdAt} <= ${filter.dateTo}`);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countRows = db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(whereClause)
    .all();
  const total = countRows[0]?.count ?? 0;

  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const ALLOWED_SORT = new Set([
    "created_at",
    "updated_at",
    "title",
    "status",
    "read_time",
  ]);
  const sortCol = ALLOWED_SORT.has(filter.sort ?? "")
    ? filter.sort!
    : "created_at";
  const sortDir = filter.order === "asc" ? asc : desc;

  const rows = db
    .select()
    .from(articles)
    .where(whereClause)
    .orderBy(sortDir(sql.identifier(sortCol)))
    .limit(pageSize)
    .offset(offset)
    .all();

  return { articles: rows.map(rowToArticle), total };
}

export interface ExpertRow {
  id: string;
  name: string;
  email: string;
  role: string;
  articleCount: number;
  hasPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getExpertsWithStats(): Promise<ExpertRow[]> {
  const rows = db.all<{
    id: string;
    name: string;
    email: string;
    role: string;
    article_count: number;
    has_paid: number;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT
      e.id, e.name, e.email, e.role, e.created_at, e.updated_at,
      COALESCE(a.cnt, 0) as article_count,
      CASE WHEN p.user_id IS NOT NULL THEN 1 ELSE 0 END as has_paid
    FROM experts e
    LEFT JOIN (
      SELECT expert_id, count(*) as cnt FROM articles GROUP BY expert_id
    ) a ON a.expert_id = e.id
    LEFT JOIN (
      SELECT DISTINCT user_id FROM payments WHERE status = 'CONFIRMED'
    ) p ON p.user_id = e.id
    ORDER BY e.created_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    articleCount: r.article_count,
    hasPaid: r.has_paid === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export interface RegistrationStat {
  month: string;
  count: number;
}

export async function getRegistrationsByMonth(): Promise<RegistrationStat[]> {
  const rows = db
    .select({
      month: sql<string>`substr(${experts.createdAt}, 1, 7)`,
      count: sql<number>`count(*)`,
    })
    .from(experts)
    .groupBy(sql`substr(${experts.createdAt}, 1, 7)`)
    .orderBy(asc(sql`substr(${experts.createdAt}, 1, 7)`))
    .all();
  return rows;
}

export async function getCommentsWithArticle(
  search?: string,
  page?: number,
  pageSize?: number
): Promise<{
  comments: Array<Comment & { articleTitle: string }>;
  total: number;
}> {
  const limit = pageSize ?? 20;
  const offset = ((page ?? 1) - 1) * limit;

  let conditions = [sql`1=1`];
  if (search) {
    conditions.push(sql`${comments.text} LIKE ${`%${search}%`}`);
  }
  const whereClause = and(...conditions);

  const countRows = db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(whereClause)
    .all();
  const total = countRows[0]?.count ?? 0;

  const rows = db
    .select({
      id: comments.id,
      articleId: comments.articleId,
      parentId: comments.parentId,
      authorId: comments.authorId,
      authorName: comments.authorName,
      text: comments.text,
      isAuthorReply: comments.isAuthorReply,
      createdAt: comments.createdAt,
      articleTitle: articles.title,
    })
    .from(comments)
    .leftJoin(articles, eq(comments.articleId, articles.id))
    .where(whereClause)
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  return {
    comments: rows.map((r) => ({
      id: r.id,
      articleId: r.articleId,
      parentId: r.parentId ?? undefined,
      authorId: r.authorId,
      authorName: r.authorName,
      text: r.text,
      createdAt: r.createdAt,
      isAuthorReply:
        r.isAuthorReply === true || (r.isAuthorReply as unknown as number) === 1
          ? true
          : undefined,
      articleTitle: r.articleTitle ?? "",
    })),
    total,
  };
}

export async function deleteCommentById(id: string): Promise<void> {
  db.delete(comments).where(eq(comments.id, id)).run();
}

export async function getModerationQueue(): Promise<Article[]> {
  const rows = db
    .select()
    .from(articles)
    .where(eq(articles.status, "pending_review"))
    .orderBy(desc(articles.createdAt))
    .all();
  return rows.map(rowToArticle);
}

export async function approveArticle(id: string): Promise<void> {
  db.update(articles)
    .set({ status: "published", updatedAt: new Date().toISOString() })
    .where(eq(articles.id, id))
    .run();
}

export async function rejectArticle(id: string, reason: string): Promise<void> {
  const article = await getArticleById(id);
  const rejectionNote = article
    ? `[Отклонено: ${reason}] ${article.description}`
    : `[Отклонено: ${reason}]`;

  db.update(articles)
    .set({
      status: "draft",
      updatedAt: new Date().toISOString(),
      description: rejectionNote,
    })
    .where(eq(articles.id, id))
    .run();
}

export async function getModerationCount(): Promise<number> {
  const rows = db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, "pending_review"))
    .all();
  return rows[0]?.count ?? 0;
}
