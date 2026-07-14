import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = process.env.DB_PATH || "./data/expers.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("cache_size = -64000");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("mmap_size = 268435456");
sqlite.pragma("temp_store = MEMORY");

console.log("🔧 Запуск миграций SQLite...");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS experts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'reader',
    avatar TEXT,
    bio TEXT,
    expertise TEXT,
    credentials TEXT,
    social_links TEXT,
    work_experience TEXT,
    publications TEXT,
    achievements TEXT,
    media_mentions TEXT,
    faq TEXT,
    testimonials TEXT,
    call_to_action TEXT,
    author_page_slug TEXT,
    author_page_published INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    industry_id TEXT NOT NULL,
    industry_name TEXT NOT NULL,
    subsection_id TEXT NOT NULL,
    subsection_name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    custom_category TEXT DEFAULT '',
    expertise_areas TEXT,
    cross_links TEXT,
    tldr TEXT NOT NULL,
    key_facts TEXT NOT NULL,
    definition TEXT NOT NULL,
    featured_snippet TEXT NOT NULL,
    problem_solution_result TEXT NOT NULL,
    how_to TEXT NOT NULL,
    faq TEXT NOT NULL,
    todo TEXT,
    methodology TEXT NOT NULL,
    sources TEXT NOT NULL,
    read_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    expert_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    parent_id TEXT,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    text TEXT NOT NULL,
    is_author_reply INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS viewing_history (
    user_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    viewed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    subscriber_id TEXT NOT NULL,
    subscriber_name TEXT,
    author_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS section_subscriptions (
    user_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    order_id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

console.log("  ✓ Таблицы созданы");

sqlite.exec(`
  CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);
  CREATE INDEX IF NOT EXISTS articles_expert_idx ON articles(expert_id);
  CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(industry_id, slug);
  CREATE INDEX IF NOT EXISTS comments_article_idx ON comments(article_id, created_at);
  CREATE INDEX IF NOT EXISTS comments_author_idx ON comments(author_id, created_at);
  CREATE INDEX IF NOT EXISTS favorites_pk ON favorites(user_id, article_id);
  CREATE INDEX IF NOT EXISTS viewing_history_pk ON viewing_history(user_id, article_id);
  CREATE INDEX IF NOT EXISTS subscriptions_pk ON subscriptions(subscriber_id, author_id);
  CREATE INDEX IF NOT EXISTS subscriptions_author_idx ON subscriptions(author_id);
  CREATE INDEX IF NOT EXISTS section_subscriptions_pk ON section_subscriptions(user_id, section_id);
  CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id, created_at);
  CREATE INDEX IF NOT EXISTS password_resets_email_idx ON password_resets(email, created_at);
`);

console.log("  ✓ Индексы созданы");
console.log("🎉 Миграции завершены!");

sqlite.close();
