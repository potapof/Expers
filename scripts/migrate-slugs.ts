import {
  getAllPublishedArticles,
  isSlugTaken as isSlugTakenDb,
  updateArticle,
} from "../lib/models";
import { transliterate } from "../lib/translit";

function makeSlug(title: string): string {
  return transliterate(title).slice(0, 200) || "article";
}

function makeUniqueSlug(title: string, existing: string[]): string {
  let base = makeSlug(title);
  let slug = base;
  let counter = 2;
  while (existing.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

async function main() {
  console.log("Начинаем миграцию slug'ов статей...\n");

  const articles = await getAllPublishedArticles();
  console.log(`Найдено ${articles.length} опубликованных статей\n`);

  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    if (article.slug) {
      skipped++;
      continue;
    }

    const slug = makeUniqueSlug(article.title, []);

    const taken = await isSlugTakenDb(article.industryId, slug, article.id);
    if (taken) {
      console.log(
        `  ПРОПУЩЕН: ${article.id} — slug "${slug}" уже занят в отрасли ${article.industryId}`
      );
      skipped++;
      continue;
    }

    try {
      await updateArticle(article.id, { slug } as Parameters<
        typeof updateArticle
      >[1]);
      updated++;
      console.log(
        `  OK: ${article.id} (${article.industryId}) — slug="${slug}"`
      );
    } catch (err) {
      console.error(`  ОШИБКА: ${article.id} — ${err}`);
    }
  }

  console.log(
    `\nМиграция завершена: обновлено ${updated}, пропущено ${skipped}`
  );
}

main().catch(console.error);
