import { APIRequestContext } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";

export async function createArticle(
  api: APIRequestContext,
  data: Record<string, unknown>
): Promise<{ id: string; status: number }> {
  const res = await api.post(`${BASE}/api/articles`, { data });
  const body = await res.json();
  return { id: body.id ?? body.article?.id ?? "", status: res.status() };
}

export async function patchArticle(
  api: APIRequestContext,
  id: string,
  data: Record<string, unknown>
): Promise<{ status: number }> {
  const res = await api.patch(`${BASE}/api/articles/${id}`, { data });
  return { status: res.status() };
}

export async function getArticles(
  api: APIRequestContext,
  params?: Record<string, string>
): Promise<{ articles: unknown[]; status: number }> {
  const searchParams = params ? new URLSearchParams(params) : undefined;
  const url = `${BASE}/api/articles${searchParams ? `?${searchParams}` : ""}`;
  const res = await api.get(url);
  const body = await res.json();
  return { articles: (body.articles ?? []) as unknown[], status: res.status() };
}

export async function getArticle(
  api: APIRequestContext,
  id: string
): Promise<{ data: unknown; status: number }> {
  const res = await api.get(`${BASE}/api/articles/${id}`);
  const body = await res.json();
  return { data: body, status: res.status() };
}

export async function checkSlug(
  api: APIRequestContext,
  slug: string,
  industryId: string,
  excludeArticleId?: string
): Promise<{ taken: boolean; status: number }> {
  const params = new URLSearchParams({ slug, industryId });
  if (excludeArticleId) params.set("excludeArticleId", excludeArticleId);
  const res = await api.get(`${BASE}/api/articles/slug-check?${params}`);
  return { taken: (await res.json()).taken as boolean, status: res.status() };
}

export async function addComment(
  api: APIRequestContext,
  articleId: string,
  text: string,
  parentId?: string
): Promise<{ id: string; status: number }> {
  const res = await api.post(`${BASE}/api/comments`, {
    data: { articleId, text, ...(parentId ? { parentId } : {}) },
  });
  return { id: (await res.json()).id ?? "", status: res.status() };
}

export async function updateComment(
  api: APIRequestContext,
  id: string,
  text: string
): Promise<{ status: number }> {
  const res = await api.patch(`${BASE}/api/comments/${id}`, { data: { text } });
  return { status: res.status() };
}

export async function deleteComment(
  api: APIRequestContext,
  id: string
): Promise<{ status: number }> {
  const res = await api.delete(`${BASE}/api/comments/${id}`);
  return { status: res.status() };
}

export async function addFavorite(
  api: APIRequestContext,
  articleId: string
): Promise<{ status: number }> {
  const res = await api.post(`${BASE}/api/favorites`, { data: { articleId } });
  return { status: res.status() };
}

export async function removeFavorite(
  api: APIRequestContext,
  articleId: string
): Promise<{ status: number }> {
  const res = await api.delete(`${BASE}/api/favorites?articleId=${articleId}`);
  return { status: res.status() };
}

export async function subscribeToAuthor(
  api: APIRequestContext,
  authorId: string
): Promise<{ status: number }> {
  const res = await api.post(`${BASE}/api/subscriptions`, {
    data: { authorId },
  });
  return { status: res.status() };
}

export async function unsubscribeFromAuthor(
  api: APIRequestContext,
  authorId: string
): Promise<{ status: number }> {
  const res = await api.delete(
    `${BASE}/api/subscriptions?authorId=${authorId}`
  );
  return { status: res.status() };
}

export async function healthCheck(api: APIRequestContext): Promise<{
  status: string;
  database: string;
  code: number;
}> {
  const res = await api.get(`${BASE}/api/health`);
  const body = await res.json();
  return { ...body, code: res.status() };
}

export async function getComments(
  api: APIRequestContext,
  params?: { articleId?: string; authorId?: string }
): Promise<{ comments: unknown[]; status: number }> {
  const searchParams = new URLSearchParams();
  if (params?.articleId) searchParams.set("articleId", params.articleId);
  if (params?.authorId) searchParams.set("authorId", params.authorId);
  const qs = searchParams.toString();
  const url = `${BASE}/api/comments${qs ? `?${qs}` : ""}`;
  const res = await api.get(url);
  const body = await res.json();
  return { comments: (body.comments ?? []) as unknown[], status: res.status() };
}

export async function getFavorites(
  api: APIRequestContext
): Promise<{ favorites: unknown[]; status: number }> {
  const res = await api.get(`${BASE}/api/favorites`);
  const body = await res.json();
  return {
    favorites: (body.favorites ?? []) as unknown[],
    status: res.status(),
  };
}

export async function getSubscriptions(api: APIRequestContext): Promise<{
  subscriptions: unknown[];
  subscribers: unknown[];
  status: number;
}> {
  const res = await api.get(`${BASE}/api/subscriptions`);
  const body = await res.json();
  return {
    subscriptions: (body.subscriptions ?? []) as unknown[],
    subscribers: (body.subscribers ?? []) as unknown[],
    status: res.status(),
  };
}

export async function sectionSubscriptionCRUD(
  api: APIRequestContext,
  action: "get" | "post" | "put" | "delete",
  data?: Record<string, unknown>
): Promise<{ status: number; body?: unknown }> {
  let res;
  switch (action) {
    case "get":
      res = await api.get(`${BASE}/api/section-subscriptions`);
      break;
    case "post":
      res = await api.post(`${BASE}/api/section-subscriptions`, { data });
      break;
    case "put":
      res = await api.put(`${BASE}/api/section-subscriptions`, { data });
      break;
    case "delete":
      res = await api.delete(`${BASE}/api/section-subscriptions`);
      break;
  }
  const body = await res.json().catch(() => null);
  return { status: res.status(), body };
}

export async function resetPassword(
  api: APIRequestContext,
  data: { email?: string; code?: string; newPassword?: string }
): Promise<{ status: number }> {
  const res = await api.post(`${BASE}/api/auth/reset-password`, { data });
  return { status: res.status() };
}

export async function getPaymentStatus(
  api: APIRequestContext,
  paymentId: string
): Promise<{ status: number; body: unknown }> {
  const res = await api.get(
    `${BASE}/api/payments/status?paymentId=${paymentId}`
  );
  const body = await res.json().catch(() => null);
  return { status: res.status(), body };
}

export async function deleteHistory(
  api: APIRequestContext
): Promise<{ status: number }> {
  const res = await api.delete(`${BASE}/api/history`);
  return { status: res.status() };
}

export async function uploadAvatar(
  api: APIRequestContext,
  buffer: Buffer,
  filename = "test-avatar.png"
): Promise<{ status: number }> {
  const res = await api.post(`${BASE}/api/upload/avatar`, {
    multipart: {
      file: {
        name: filename,
        mimeType: "image/png",
        buffer,
      },
    },
  });
  return { status: res.status() };
}

export async function adminApiCall(
  api: APIRequestContext,
  path: string,
  method: "get" | "post" | "delete" = "get",
  data?: Record<string, unknown>
): Promise<{ status: number; body: unknown }> {
  let res;
  switch (method) {
    case "get":
      res = await api.get(`${BASE}${path}`);
      break;
    case "post":
      res = await api.post(`${BASE}${path}`, { data });
      break;
    case "delete":
      res = await api.delete(`${BASE}${path}`);
      break;
  }
  const body = await res.json().catch(() => null);
  return { status: res.status(), body };
}
