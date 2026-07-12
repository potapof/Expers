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
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  EXPERTS_EMAIL: "email-index",
  ARTICLES_STATUS: "status-index",
  ARTICLES_EXPERT: "expert-index",
  COMMENTS_ARTICLE: "article-index",
  COMMENTS_AUTHOR: "author-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
