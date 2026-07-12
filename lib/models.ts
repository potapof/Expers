import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: "reader" | "expert";
  avatar?: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export type SafeExpert = Omit<Expert, "passwordHash">;

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
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
  status: "draft" | "published" | "archived";
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getExpertByEmail(email: string): Promise<Expert | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.EXPERTS,
      IndexName: IndexName.EXPERTS_EMAIL,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    })
  );
  return (result.Items?.[0] as Expert) ?? null;
}

export async function getExpertById(id: string): Promise<Expert | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.EXPERTS,
      Key: { id },
    })
  );
  return (result.Item as Expert) ?? null;
}

export async function createExpert(
  data: Omit<Expert, "createdAt" | "updatedAt">
): Promise<Expert> {
  const now = new Date().toISOString();
  const expert: Expert = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.EXPERTS,
      Item: expert,
    })
  );

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
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;
    updateExpr.push(`#${key} = :${key}`);
    exprValues[`:${key}`] = value;
    exprNames[`#${key}`] = key;
  }

  updateExpr.push("#updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();
  exprNames["#updatedAt"] = "updatedAt";

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.EXPERTS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: exprNames,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Expert;
}

export async function createArticle(
  data: Omit<Article, "createdAt" | "updatedAt">
): Promise<Article> {
  const now = new Date().toISOString();
  const article: Article = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.ARTICLES,
      Item: article,
    })
  );

  return article;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.ARTICLES,
      Key: { id },
    })
  );
  return (result.Item as Article) ?? null;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ARTICLES,
      IndexName: IndexName.ARTICLES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "published" },
    })
  );
  return (result.Items as Article[]) ?? [];
}

export async function getArticlesByExpert(
  expertId: string
): Promise<Article[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ARTICLES,
      IndexName: IndexName.ARTICLES_EXPERT,
      KeyConditionExpression: "expertId = :expertId",
      ExpressionAttributeValues: { ":expertId": expertId },
    })
  );
  return (result.Items as Article[]) ?? [];
}

export async function updateArticle(
  id: string,
  data: Partial<Article>
): Promise<Article> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;
    updateExpr.push(`#${key} = :${key}`);
    exprValues[`:${key}`] = value;
    exprNames[`#${key}`] = key;
  }

  updateExpr.push("#updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();
  exprNames["#updatedAt"] = "updatedAt";

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.ARTICLES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames: exprNames,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Article;
}

export async function deleteArticle(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.ARTICLES,
      Key: { id },
    })
  );
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
  await docClient.send(
    new PutCommand({
      TableName: TableName.COMMENTS,
      Item: comment,
    })
  );
  return comment;
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.COMMENTS,
      Key: { id },
    })
  );
  return (result.Item as Comment) ?? null;
}

export async function getCommentsByArticle(
  articleId: string
): Promise<Comment[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.COMMENTS,
      IndexName: IndexName.COMMENTS_ARTICLE,
      KeyConditionExpression: "articleId = :articleId",
      ExpressionAttributeValues: { ":articleId": articleId },
      ScanIndexForward: true,
    })
  );
  return (result.Items as Comment[]) ?? [];
}

export async function getCommentsByAuthor(
  authorId: string
): Promise<Comment[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.COMMENTS,
      IndexName: IndexName.COMMENTS_AUTHOR,
      KeyConditionExpression: "authorId = :authorId",
      ExpressionAttributeValues: { ":authorId": authorId },
      ScanIndexForward: false,
    })
  );
  return (result.Items as Comment[]) ?? [];
}

export async function updateCommentText(
  id: string,
  text: string
): Promise<Comment> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.COMMENTS,
      Key: { id },
      UpdateExpression: "set #text = :text",
      ExpressionAttributeNames: { "#text": "text" },
      ExpressionAttributeValues: { ":text": text },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Comment;
}

export async function deleteCommentCascade(
  id: string,
  articleId: string
): Promise<void> {
  const articleComments = await getCommentsByArticle(articleId);
  const toDelete = articleComments.filter(
    (c) => c.id === id || c.parentId === id
  );

  await Promise.all(
    toDelete.map((c) =>
      docClient.send(
        new DeleteCommand({
          TableName: TableName.COMMENTS,
          Key: { id: c.id },
        })
      )
    )
  );
}

export interface Favorite {
  userId: string;
  articleId: string;
  createdAt: string;
}

export async function getFavoriteArticleIds(
  userId: string
): Promise<string[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.FAVORITES,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return ((result.Items as Favorite[]) ?? []).map((f) => f.articleId);
}

export async function addFavorite(
  userId: string,
  articleId: string
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TableName.FAVORITES,
      Item: {
        userId,
        articleId,
        createdAt: new Date().toISOString(),
      },
    })
  );
}

export async function removeFavorite(
  userId: string,
  articleId: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.FAVORITES,
      Key: { userId, articleId },
    })
  );
}


