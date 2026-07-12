# План: Slug-based дружественные URL для статей

## Цель

Перевести все статьи с `/articles/:id` (например, `/articles/article-3`) на
`/:industry_slug/:article_slug` (например, `/zdravohranenie/telemedicina-v-rossii`).
Слаг статьи автоматически генерируется транслитерацией заголовка и может редактироваться
вручную на шаге 6 визарда. Слаги отраслей закреплены жестко.

## Исходное состояние

- Статьи живут по пути `app/articles/[id]/page.tsx`, идентификатор `article-<uuid>`
  либо seed-идентификатор `article-1`…`article-10` (статичные статьи).
- Архитектура: серверный адаптер `lib/article-view.ts` получает статью по `id`,
  каталог (`components/catalog-client.tsx`) и ещё ~14 компонентов строят ссылки как
  `/articles/${article.id}`.
- Никакой транслитерации или slug-поля в проекте нет.
- Отрасли имеют английские идентификаторы (`healthcare`, `manufacturing` и т.д.),
  определённые в `lib/data.ts`.

## Решения

1. **Слаг отрасли — русский транслит**, захардкоженный (13 значений).
2. **Слаг статьи — авто-транслит из заголовка**, с кнопкой «Сгенерировать» и
   возможностью ручного редактирования в шаге 6 визарда.
3. Старый URL `/articles/:id` **не поддерживается** (редирект не делаем).

---

## Итерация 1: Транслитерация и слаги отраслей

### 1.1. Модуль транслитерации `lib/translit.ts`

Таблица замены русских символов на латиницу по схеме, близкой к ModX Translitor / ISO 9:

| Рус. | Лат. | Рус. | Лат. | Рус. | Лат.      |
| ---- | ---- | ---- | ---- | ---- | --------- |
| а    | a    | к    | k    | х    | h         |
| б    | b    | л    | l    | ц    | ts        |
| в    | v    | м    | m    | ч    | ch        |
| г    | g    | н    | n    | ш    | sh        |
| д    | d    | о    | o    | щ    | sch       |
| е    | e    | п    | p    | ъ    | (пропуск) |
| ё    | yo   | р    | r    | ы    | y         |
| ж    | zh   | с    | s    | ь    | (пропуск) |
| з    | z    | т    | t    | э    | e         |
| и    | i    | у    | u    | ю    | yu        |
| й    | y    | ф    | f    | я    | ya        |

Правила:

- Пробелы и спецсимволы → `-`
- Множественные дефисы сворачиваются в один
- Ведущие/замыкающие дефисы удаляются
- `toLowerCase()`

Экспортируемая функция:

```ts
export function transliterate(text: string): string;
```

**Файл:** `lib/translit.ts`

### 1.2. Карта слагов отраслей

В `lib/data.ts` (или новый `lib/industry-slugs.ts`) — жёсткая карта:

| industryId (data.ts) | Название            | slug                |
| -------------------- | ------------------- | ------------------- |
| manufacturing        | Производство        | proizvodstvo        |
| finance              | Финансы             | finansy             |
| healthcare           | Здравоохранение     | zdravohranenie      |
| retail               | Розница             | roznica             |
| education            | Образование         | obrazovanie         |
| automotive           | Автомобили          | avtomobili          |
| it-tech              | IT & Технологии     | it-tehnologii       |
| real-estate          | Недвижимость        | nedvizhimost        |
| energy               | Энергия             | energiya            |
| tourism              | Туризм              | turizm              |
| media-entertainment  | Медиа & Развлечения | media-razvlecheniya |
| agri-food            | Сельхоз & Пищевая   | selhoz-pischevaya   |
| ecology-climate      | Экология и Климат   | ekologiya-klimat    |

Экспортируемая функция:

```ts
export function getIndustrySlug(industryId: string): string;
```

Возвращает slug по `industryId` или сам `industryId` (fallback).

**Файл:** `lib/industry-slugs.ts`

### 1.3. Уникальность слага статьи

Слаг статьи должен быть уникальным в пределах отрасли. Для обеспечения уникальности
при генерации добавляется постфикс `-2`, `-3` и т.д., если слаг уже занят.

Функция в models.ts:

```ts
export async function isSlugTaken(
  industryId: string,
  slug: string,
  excludeArticleId?: string
): Promise<boolean>;
```

---

## Итерация 2: Поле `slug` в модели статьи

### 2.1. DynamoDB — схема

В таблицу `articles` **не требуется** добавлять GSI (slug не используется как ключ
для запросов). Slug хранится как обычный атрибут в item. Добавить `slug` в интерфейс
`Article` (`lib/models.ts`).

### 2.2. Обновление CRUD

- `lib/models.ts`: поле `slug?: string` в интерфейсе `Article`
- Новая функция: `getArticleBySlug(industryId: string, slug: string): Promise<Article | null>`
- Новая функция: `isSlugTaken(industryId, slug, excludeArticleId?): Promise<boolean>`
- `createArticle`: принимать и сохранять `slug` (опционально — если нет, статья
  создаётся без слага; слаг нужен только для published/pending_payment)

---

## Итерация 3: Slug в API

### 3.1. Создание статьи

`POST /api/articles` — поле `slug` в теле запроса:

- Валидировать zod: `z.string().min(2).max(200).regex(/^[a-z0-9-]+$/)`
- Проверить уникальность в пределах отрасли (`isSlugTaken`)
- Сохранить в БД

### 3.2. Slug для существующих статей

При миграции (или первом запросе на чтение через slug) вычислять slug из заголовка,
если `slug` отсутствует. Статья без слага доступна только по id (для обратной
совместимости в процессе миграции). Можно добавить миграционный скрипт, который
пройдёт по всем статьям и проставит slugs.

### 3.3. API статуса слага

`GET /api/articles/slug-check?slug=xxx&industryId=xxx` — проверить, занят ли слаг
(используется в визарде для валидации на клиенте).

---

## Итерация 4: Новый роутинг

### 4.1. Страница статьи `app/[industry]/[slug]/page.tsx`

Новый серверный компонент:

- Параметры: `{ industry: string, slug: string }`
- По `industry` найти `industryId` через обратный поиск в карте слагов
- Вызвать `getArticleBySlug(industryId, slug)`
- Если не найдена → `notFound()`
- Преобразовать в `ArticleView` через существующий адаптер `getArticleView`
  (либо расширить его для приёма `Article` напрямую)

### 4.2. Старая страница `app/articles/[id]/`

**Удалить** `app/articles/[id]/` (пользователь явно решил не поддерживать старые URL).
Убрать из файловой системы.

---

## Итерация 5: Обновление всех ссылок на статьи

Заменить шаблон `/articles/${article.id}` на
`/${industrySlug}/${article.slug}` во всех 14+ компонентах.

Создать хелпер `lib/routes.ts`:

```ts
import { getIndustrySlug } from "./industry-slugs";

export function articleUrl(article: {
  id: string;
  slug?: string;
  industryId: string;
}): string {
  const industrySlug = getIndustrySlug(article.industryId);
  const slug = article.slug ?? article.id;
  return `/${industrySlug}/${slug}`;
}
```

Компоненты для обновления:

- `components/catalog-client.tsx:235` — `/articles/${article.id}`
- `components/article-card.tsx:23,25` — `/articles/${article.id}`
- `components/article-share-button.tsx:82-83` — `/articles/${articleId}`
- `components/author-articles.tsx:537,581` — `/articles/new?id=${id}`
- `components/author-finance.tsx:163` — `/articles/${p.articleId}`
- `components/author-comments.tsx:257` — `/articles/${articleId}`
- `components/reader-viewing-history.tsx:91` — `/articles/${entry.articleId}`
- `components/reader-my-comments.tsx:220` — `/articles/${comment.articleId}`
- `components/expert-profile-client.tsx:54` — `/articles/${article.id}`
- `app/articles/[id]/page.tsx:39,165` — кросс-ссылки, хлебные крошки (удалятся вместе с файлом)
- `lib/use-notifications.ts` — `link: /articles/${article.id}`
- `lib/reader-data.ts` — если есть
- `app/api/notifications/route.ts` — уведомления формируют link
- `app/page.tsx` — если есть прямые ссылки

Все ссылки заменить на `articleUrl(article)`.

---

## Итерация 6: Шаг 6 визарда — редактор слага

### 6.1. Новое поле в WizardData

В `components/article-wizard-client.tsx`:

- Добавить поле `slug: string` в `WizardData` (начальное значение `""`)
- Добавить валидацию: `step6Schema` дополняется полем `slug`

### 6.2. UI редактора

В секцию шага 6 (строка 1140-1189) после поля заголовка добавить:

```
URL статьи: /zdravohranenie/[СГЕНЕРИРОВАТЬ]
  ┌─────────────────────────────────────┐  ┌──────────────┐
  │ telemedicina-v-rossii               │  │ Сгенерировать │
  └─────────────────────────────────────┘  └──────────────┘
  Префикс: /zdravohranenie/
```

- Кнопка «Сгенерировать» вызывает `transliterate(data.title)` и заполняет поле
- Поле доступно для ручного редактирования
- Валидация показывает ошибку, если слаг пуст
- Проверка уникальности на blur (через `GET /api/articles/slug-check`)

### 6.3. Отправка слага в API

При `handlePublish` добавить `slug: data.slug` в тело POST.

---

## Итерация 7: Серверный рендер — адаптация `lib/article-view.ts`

### 7.1. Новая функция в article-view

```ts
export async function getArticleViewBySlug(
  industryId: string,
  slug: string
): Promise<ArticleView | null>;
```

- Проверяет БД через `getArticleBySlug`
- Фолбек на статические статьи (через `getArticleContentById`, временно)
- Возвращает `ArticleView` (единый формат для страницы)

### 7.2. Обновление страницы

`app/[industry]/[slug]/page.tsx`:

```ts
import { getIndustryIdBySlug } from "@/lib/industry-slugs";
import { getArticleViewBySlug } from "@/lib/article-view";

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const industryId = getIndustryIdBySlug(industry);
  if (!industryId) notFound();
  const articleView = await getArticleViewBySlug(industryId, slug);
  if (!articleView) notFound();
  // ... рендер (идентичен article/[id])
}
```

---

## Итерация 8: Статические seed-статьи

Статьи из `lib/data.ts` (10 штук, `article-1`…`article-10`) имеют заголовки
и `industryId`. Для них:

- В `lib/data.ts` добавить поле `slug` в `ArticleContent` (вычисляется
  транслитерацией заголовка вручную или автоматически при инициализации)
- `getArticleContentById` → расширить до `getArticleContentBySlug` или
  построить индекс `articleContentsBySlug`

---

## Итерация 9: Миграция существующих статей в БД

Скрипт `scripts/migrate-slugs.ts` (или добавить в `scripts/migrate.ts`):

- Сканирует все статьи в таблице `articles`
- Если `slug` отсутствует — вычисляет `transliterate(title)`, проверяет
  уникальность (добавляет суффикс при конфликте), сохраняет
- Вывод: сколько статей обновлено, сколько пропущено

Запуск: `docker compose exec app npx tsx scripts/migrate-slugs.ts`

---

## Итерация 10: Финальная проверка

- `npm run check` — 0 errors
- `npm run build` — успешно
- `vitest` — все тесты
- Браузерный смоук: главная → клик по статье → открывается `/[industry]/[slug]`
- Визард → шаг 6 → генерация слага → редактирование → публикация →
  статья открывается по новому URL

---

## Примечания

- Слаг статьи не меняется при редактировании заголовка после публикации
  (это осознанное ограничение — изменение URL ломает ссылки).
- Поле `slug` в DynamoDB не индексируется (запросы по slug идут через
  существующий `id`-ключ при обратной совместимости или через scan при
  необходимости; для production-нагрузки позже можно добавить GSI).
- Статья без слага остаётся доступной по старому `/articles/[id]` только
  в переходный период (после миграции все статьи получат slug).
