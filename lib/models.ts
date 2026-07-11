import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SERVICES,
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SERVICES,
      Item: service,
    })
  );

  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }

  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
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
