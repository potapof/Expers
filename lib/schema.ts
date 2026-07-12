import {
  type KeySchemaElement,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";

export const TableName = {
  EXPERTS: "experts",
  ARTICLES: "articles",
  COMMENTS: "comments",
  FAVORITES: "favorites",
  VIEWING_HISTORY: "viewing_history",
  SUBSCRIPTIONS: "subscriptions",
  SECTION_SUBSCRIPTIONS: "section_subscriptions",
  PAYMENTS: "payments",
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];

export interface TableSchema {
  name: TableName;
  keySchema: KeySchemaElement[];
  attributeDefinitions: AttributeDefinition[];
  globalSecondaryIndexes?: GlobalSecondaryIndex[];
}

export const TABLE_SCHEMAS: Record<TableName, TableSchema> = {
  [TableName.EXPERTS]: {
    name: TableName.EXPERTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.ARTICLES]: {
    name: TableName.ARTICLES,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "expertId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "expert-index",
        KeySchema: [{ AttributeName: "expertId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.COMMENTS]: {
    name: TableName.COMMENTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "articleId", AttributeType: "S" },
      { AttributeName: "authorId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "article-index",
        KeySchema: [
          { AttributeName: "articleId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "author-index",
        KeySchema: [
          { AttributeName: "authorId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.FAVORITES]: {
    name: TableName.FAVORITES,
    keySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "articleId", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "articleId", AttributeType: "S" },
    ],
  },
  [TableName.VIEWING_HISTORY]: {
    name: TableName.VIEWING_HISTORY,
    keySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "articleId", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "articleId", AttributeType: "S" },
    ],
  },
  [TableName.SUBSCRIPTIONS]: {
    name: TableName.SUBSCRIPTIONS,
    keySchema: [
      { AttributeName: "subscriberId", KeyType: "HASH" },
      { AttributeName: "authorId", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "subscriberId", AttributeType: "S" },
      { AttributeName: "authorId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "author-index",
        KeySchema: [
          { AttributeName: "authorId", KeyType: "HASH" },
          { AttributeName: "subscriberId", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.SECTION_SUBSCRIPTIONS]: {
    name: TableName.SECTION_SUBSCRIPTIONS,
    keySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "sectionId", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "sectionId", AttributeType: "S" },
    ],
  },
  [TableName.PAYMENTS]: {
    name: TableName.PAYMENTS,
    keySchema: [{ AttributeName: "orderId", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "user-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  EXPERTS_EMAIL: "email-index",
  ARTICLES_STATUS: "status-index",
  ARTICLES_EXPERT: "expert-index",
  COMMENTS_ARTICLE: "article-index",
  COMMENTS_AUTHOR: "author-index",
  SUBSCRIPTIONS_AUTHOR: "author-index",
  PAYMENTS_USER: "user-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
