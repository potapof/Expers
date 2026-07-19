# План: Функция импорта статьи (12-итерационный AI шаблон)

## Обзор

Пользователь скачивает AI-промпт-шаблон (`.md` файл), разбитый на **12 итераций**.
Каждую итерацию он копирует в сторонний ИИ, получает ответ, вставляет в поле импорта
и нажимает **«Сохранить»**. Только после сохранения текущей итерации разблокируется
следующая. Прогресс сохраняется в `localStorage`. После завершения всех 12 —
черновик статьи создаётся в БД, пользователь редиректится в визард на шаг 11
(Предпросмотр) для доработки и публикации.

**Целевой объём основного контента:** 80–120 KB (итерации 6–11, шаг 7 визарда).

---

## Новые файлы

| Файл                                   | Назначение                                         |
| -------------------------------------- | -------------------------------------------------- |
| `app/cabinet/import/page.tsx`          | Страница импорта (Server Component)                |
| `components/article-import-client.tsx` | Клиентский компонент: 12-шаговый визард импорта    |
| `app/api/templates/article/route.ts`   | `GET` — скачивание `.md` шаблона                   |
| `app/api/articles/import/route.ts`     | `POST` — создание статьи из импортированных данных |
| `lib/import-parser.ts`                 | Парсинг Markdown-секций в типизированные данные    |
| `lib/import-validation.ts`             | Zod-схемы для импорта (отдельные, более lenient)   |
| `lib/import-template.ts`               | 12 итераций промптов + генератор `.md` файла       |

## Изменяемые файлы

| Файл                                   | Изменение                                                       |
| -------------------------------------- | --------------------------------------------------------------- |
| `components/author-articles.tsx`       | Кнопки «Импорт» + «AI» (disabled) перед «Создать статью»        |
| `app/api/articles/route.ts`            | `content.max`: 10000 → 150000                                   |
| `lib/validation.ts`                    | `step7Schema.content.max`: 10000 → 150000                       |
| `components/article-wizard-client.tsx` | Поддержка `?importId=` + лимит 150000 + конвертация "none" → "" |

---

## Два новых файла для валидации

**Почему не переиспользовать `articleSchema` из `route.ts`:**

- `articleSchema` требует `industryId: z.string().min(1)`, `faq.min(1)`, `keyFacts.min(1)`,
  `howTo.min(1)`, `sources.min(1)` и т.д.
- Импорт создаёт статью с `industryId: "none"` (заглушка) и может получить от ИИ
  неполный набор faq/keyFacts/sources.
- Поэтому нужна **отдельная** `importArticleSchema` — более lenient (`.min(0)` для
  массивов, допускает `"none"` в ID-полях). Пользователь доработает недостающее в визарде.
- Валидация КАЖДОЙ итерации по-отдельности тоже в `import-validation.ts` (через
  `iterationSchemas`).

---

## 12 итераций шаблон-промпта

### Итерации 1–4: метаданные-заглушки

ИИ выводит **заглушки**. Пользователь заменит их в визарде. В форме импорта
над полями 1–4 показывается синее предупреждение:

> «Эта итерация заполняется значением по умолчанию. Вы сможете выбрать отрасль,
> категорию и другие параметры в визарде после импорта.»

| #   | Шаги визарда                | Вывод ИИ                                                                                                        |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | 1 + 2 (Отрасль + Подсектор) | `industryId: "none"`, `industryName: "Без отрасли"`, `subsectionId: "none"`, `subsectionName: "Без подсектора"` |
| 2   | 3 (Категория)               | `categoryId: "none"`, `categoryName: "Без категории"`                                                           |
| 3   | 4 (Экспертиза)              | `expertiseAreas: ["Общая экспертиза", "Бизнес-консалтинг", "Стратегическое планирование"]`                      |
| 4   | 5 (Кросс-ссылки)            | `crossLinks: []`                                                                                                |

**Механика в визарде:** при загрузке через `?importId=` конвертировать
`"none"` → `""` (пустая строка). Тогда существующая валидация `step1Schema`
(`.min(1)`) корректно укажет пользователю: «Выберите отрасль». Пользователь
пройдёт шаги 1–5 визарда перед публикацией.

### Итерация 5: Заголовок и введение (шаг 6 визарда)

| Поле           | Вывод ИИ                                                    |
| -------------- | ----------------------------------------------------------- |
| `title`        | SEO-заголовок H1, до 60 символов, с главным ключевым словом |
| `introduction` | Введение 40–60 слов: хук → проблема → обещание решения      |
| `slug`         | Транслитерация заголовка (латиница, цифры, дефисы)          |

Итого: ~500 слов. Slug генерируется ИИ, но проверяется на уникальность при
сохранении в визарде.

### Итерации 6–11: основной контент (шаг 7 визарда — 6 секций)

**Суммарный объём: 80–120 KB.**

Каждая секция → один объект `ArticleSection`. Поля:

- `sectionTitle` → `ArticleSection.title`
- `sectionText` → `ArticleSection.text`
- `sectionDescription` → `ArticleSection.description` (опционально)
- `sectionDesign` → `ArticleSection.design`
- `imageUrl` → `ArticleSection.imageData` (строка URL, отдаётся в `<img src>`)

**Изображения:** ИИ генерирует URL вида `https://pixinlink.ru/800x400/description-in-english`.
Размер зависит от дизайна:

- `image-right` / `image-left`: `800x400`
- `image-only`: `1200x600`

`imageData` рендерится через `<img src={imageData}>` (код в `section-card-builder.tsx:121`,
`article-wizard-client.tsx:2031`). Браузер загружает внешний URL без CORS-проблем. Проверено.
Пользователь может заменить изображение в визарде (клик → загрузка файла).

---

#### Итерация 6 — Секция 1: Погружение в проблему

| Параметр            | Значение                                                 |
| ------------------- | -------------------------------------------------------- |
| Дизайн              | `image-right` (текст слева, картинка справа, 40% ширины) |
| Объём `sectionText` | 15–20 KB                                                 |
| Изображение         | `pixinlink.ru/800x400/<topic>-hero`                      |

**Структура текста (ответ ИИ):**

1. 2–3 абзаца: масштаб проблемы, почему тема актуальна сейчас
2. 2–3 ключевые цифры/статистики с указанием источников (год, организация)
3. Абзац-мостик: «почему текущие подходы не работают»
4. Переход к анализу

---

#### Итерация 7 — Секция 2: Анализ текущей ситуации

| Параметр            | Значение    |
| ------------------- | ----------- |
| Дизайн              | `text-only` |
| Объём `sectionText` | 15–20 KB    |

**Структура:**

1. 3–4 абзаца глубокого анализа (факты, исследования, тренды за 2–3 года)
2. 2–3 экспертных тезиса, каждый: утверждение → обоснование → цифра/источник
3. 1–2 реальных примера из практики (компании, проекты)
4. Промежуточный вывод: «что мы имеем на сейчас»

---

#### Итерация 8 — Секция 3: Кейс / практический пример

| Параметр            | Значение                                    |
| ------------------- | ------------------------------------------- |
| Дизайн              | `image-left` (картинка слева, текст справа) |
| Объём `sectionText` | 15–20 KB                                    |
| Изображение         | `pixinlink.ru/800x400/<topic>-case-study`   |

**Структура:**

1. Контекст: конкретная компания/проект, исходная ситуация
2. Хронология действий: что делали, какие инструменты
3. Результаты: конкретные цифры (рост %, экономия ₽, ускорение ×)
4. Анализ: почему сработало
5. Универсальные принципы, применимые в других проектах

---

#### Итерация 9 — Секция 4: Сравнительная таблица

| Параметр            | Значение                                            |
| ------------------- | --------------------------------------------------- |
| Дизайн              | `table`                                             |
| Объём `sectionText` | 15–20 KB (включая вводный текст до и после таблицы) |

**Структура:**

1. 1–2 вводных абзаца: что сравниваем, критерии
2. Таблица: строки = варианты/инструменты, столбцы = критерии. Минимум 4 строки, 3 столбца
3. После таблицы: 2–3 абзаца анализа, какой вариант для какого сценария
4. Рекомендация для ЦА

Формат таблицы в Markdown-ответе ИИ:

```
### sectionTable
| Критерий | Вариант А | Вариант Б | Вариант В |
|----------|-----------|-----------|-----------|
| ...      | ...       | ...       | ...       |
```

Парсер конвертирует это в `tableData: { headers: [...], rows: [[...], ...] }`.

---

#### Итерация 10 — Секция 5: Инструменты и решения

| Параметр            | Значение                             |
| ------------------- | ------------------------------------ |
| Дизайн              | `image-right`                        |
| Объём `sectionText` | 15–20 KB                             |
| Изображение         | `pixinlink.ru/800x400/<topic>-tools` |

**Структура:**

1. Обзор 3–5 инструментов/методологий: название, для чего, плюсы/минусы
2. Пошаговый алгоритм внедрения: 5–7 шагов с пояснениями
3. Типичные ошибки и как их избежать (3–5 пунктов)

---

#### Итерация 11 — Секция 6: Прогнозы и выводы

| Параметр            | Значение    |
| ------------------- | ----------- |
| Дизайн              | `text-only` |
| Объём `sectionText` | 15–20 KB    |

**Структура:**

1. Тренды и прогнозы на 2–5 лет с обоснованием
2. Сценарный анализ: оптимистичный / базовый / пессимистичный
3. Ключевые выводы по всей статье (3–5 тезисов)
4. Заключительный CTA-абзац

---

### Итерация 12: GEO-блоки (шаги 8 + 9 + 10 визарда)

**Объём:** ~2000 слов.

| Поле                    | Мин | Макс | Описание                           |
| ----------------------- | --- | ---- | ---------------------------------- |
| `faq`                   | 3   | 5    | Вопрос-ответ для GEO-сниппета      |
| `todo`                  | 5   | 7    | Чеклист действий для читателя      |
| `tldr`                  | -   | -    | 2–3 предложения, суть статьи       |
| `keyFacts`              | 3   | 5    | Ключевые факты с иконкой и текстом |
| `definition`            | -   | -    | Определение темы (1 абзац)         |
| `featuredSnippet`       | -   | -    | Прямой ответ: вопрос + ответ       |
| `problemSolutionResult` | -   | -    | Проблема → Решение → Результат     |
| `howTo`                 | 3   | 5    | Пошаговая инструкция               |
| `methodology`           | -   | -    | Как подготовлена статья            |
| `sources`               | 3   | 7    | Источники: название + URL          |

---

## Системный промпт (в начало `.md` шаблона)

### Правила стиля

1. Найди оптимальный способ, а не первый подходящий
2. Работай по таким правилам:
   - Вырезай канцелярит, штампы и цепочки существительных
   - Меняй отглагольные существительные на сильные глаголы
   - Убирай лишние причастия, деепричастия и слабые связки
   - Заменяй пассив на актив, если так фраза становится яснее
   - Меняй абстрактные слова-пустышки на конкретные предметы, действия, сцены и образы
   - Заменяй лишние иностранные и книжные слова точными русскими
   - Длинное делай коротким, сложное — простым, стёртое — образным, но не упрощай саму мысль
3. Отключи использование двоеточий и длинных тире

### Фреймворк CoolPrompt (выбор метода по задаче)

- **HyPE** — для простых запросов, экспресс-оптимизация
- **ReflectivePrompt** — для аналитики, исследований, сравнений
- **DistillPrompt** — для классификации, генерации контента

### Multi-Agent Debate System (INoT)

Три агента с 5 раундами дебатов:

- **Agent_Expert** — факты, глубина, структура
- **Agent_Marketer** — заголовки, CTA, вовлечение
- **Agent_SEO** — ключевые слова, сниппеты, читабельность

### Глобальный контракт формата

Каждый ответ ИИ должен начинаться с `## Итерация N: Название` и содержать
только блоки `### Ключ\nЗначение`. **Запрещено:** код-блоки (\`\`\`), мета-комментарии,
пояснения «вот что я сделал», обращения к пользователю. Только контент по шаблону.

---

## Формат вывода (Markdown-контракт)

Пример для итерации 1:

```markdown
## Итерация 1: Отрасль и подсектор

### industryId

none

### industryName

Без отрасли

### subsectionId

none

### subsectionName

Без подсектора
```

Пример для итерации 6:

```markdown
## Итерация 6: Погружение в проблему

### sectionTitle

Почему GEO-оптимизация стала must-have для бизнеса в 2026

### sectionDescription

Введение в проблему видимости контента для AI-поисковиков

### sectionDesign

image-right

### imageUrl

https://pixinlink.ru/800x400/geo-optimization-hero

### sectionText

(15-20 KB текста секции — полный контент с HTML-форматированием:
<strong>жирный</strong>, <em>курсив</em>, <a href="...">ссылки</a>)
```

Пример для итерации 9 (таблица):

```markdown
## Итерация 9: Сравнительная таблица

### sectionTitle

Сравнение инструментов GEO-оптимизации

### sectionDesign

table

### sectionText

Вводный текст перед таблицей...

### sectionTable

| Критерий       | Surfer SEO | Frase            | Clearscope  | MarketMuse |
| -------------- | ---------- | ---------------- | ----------- | ---------- |
| Цена           | $89/мес    | $45/мес          | $170/мес    | $149/мес   |
| NLP-анализ     | Да         | Да               | Да          | Да         |
| Интеграция CMS | WordPress  | WordPress, Ghost | Google Docs | WordPress  |

### sectionTextAfter

Анализ после таблицы: какой инструмент выбрать для разных бюджетов...
```

Ключи `###` строго фиксированы. Парсер:

1. Отрезает всё до `## Итерация N`
2. Разбивает по `### `
3. Ключ = строка до `\n`, значение = остаток (trim)
4. Ищет ключи без учёта регистра и лишних пробелов
5. Отсутствующий обязательный ключ → ошибка

---

## Парсинг: пограничные случаи

| Ситуация                                                | Поведение парсера                                         |
| ------------------------------------------------------- | --------------------------------------------------------- |
| ИИ обернул ответ в \`\`\`markdown ... \`\`\`            | Снять code fence перед парсингом                          |
| ИИ добавил текст ДО `## Итерация N`                     | Игнорировать всё до первого `## Итерация`                 |
| ИИ написал `### Sectiontitle` (CamelCase)               | Ключи case-insensitive: `sectiontitle` → `sectionTitle`   |
| ИИ пропустил необязательный ключ (`sectionDescription`) | Ок, значение = `""`                                       |
| ИИ пропустил обязательный ключ (`sectionText`)          | Ошибка: «Отсутствует обязательное поле sectionText»       |
| ИИ выдал меньше минимального объёма текста              | Ошибка: «Недостаточно текста: 8 KB, требуется ≥ 15 KB»    |
| ИИ выдал больше 20 KB                                   | Ок (warning в консоль, контент не обрезается)             |
| ИИ вставил реальные URL вместо pixinlink                | Ок — любой URL принимается, pixinlink только рекомендован |

---

## Итерация 1 реализации: `lib/import-template.ts`

Экспортирует:

```ts
export interface TemplateIteration {
  iteration: number;
  title: string;
  wizardStepLabel: string;     // например: "Шаги 1–2: Отрасль и подсектор"
  prompt: string;              // инструкция для ИИ
  outputFields: string[];      // обязательные ключи, например: ["industryId", "subsectionId", ...]
  optionalFields: string[];    // необязательные ключи
  exampleOutput: string;       // пример правильного вывода
  isPlaceholder: boolean;      // true для итераций 1–4 (значения-заглушки)
}

export const TEMPLATE_ITERATIONS: TemplateIteration[] = [...]; // 12 элементов

export function generateTemplate(authorName: string, topic?: string): string;
```

`generateTemplate` собирает полный `.md` файл:

1. Системный промпт (правила + CoolPrompt + INoT + контракт формата)
2. 12 секций `## Итерация N: ...` с промптом и примером вывода

---

## Итерация 2 реализации: `app/api/templates/article/route.ts`

```
GET /api/templates/article?topic=<тема>
Authorization: Bearer <token>
```

- Проверяет авторизацию (`verifyToken`)
- `generateTemplate(payload.name, topic)`
- Content-Type: `text/markdown; charset=utf-8`
- Content-Disposition: `attachment; filename="expers-article-template.md"`

---

## Итерация 3 реализации: `app/cabinet/import/page.tsx`

```tsx
import { ArticleImportClient } from "@/components/article-import-client";
export default function ImportPage() {
  return <ArticleImportClient />;
}
```

---

## Итерация 4 реализации: `components/article-import-client.tsx`

### UI

- **Хедер:** «Импорт статьи» + описание + кнопка «Скачать шаблон» + «Как это работает?»
- **Прогресс-бар:** 12 шагов (аналог `ProgressBar`). Зелёная галочка = сохранено, серый = заблокировано
- **Тело итерации:**
  1. Название итерации `Итерация N: Название`
  2. Для итераций 1–4: синий alert «Значение по умолчанию — отредактируйте в визарде»
  3. Кнопка «Скопировать промпт» (копирует `TEMPLATE_ITERATIONS[N-1].prompt`)
  4. Кнопка «Показать пример» (раскрывает `exampleOutput`)
  5. `<textarea>` monospace, placeholder «Вставьте ответ ИИ...»
  6. Ошибки валидации (красный текст)
  7. Статус: «Не сохранено» / «Сохранено» / «Ошибка»
- **Навигация:** «← Назад» / «Далее →» / «Сохранить» / «Завершить импорт»
- **Счётчик:** «Сохранено: 5/12»

### Логика блокировки

- При старте: активна только итерация 1
- Кнопка «Сохранить» → парсинг + Zod-валидация → если ок: сохранить в состояние + localStorage → разблокировать следующую
- Кнопка «Далее →»: серая, если текущая не сохранена
- Клик по сохранённому шагу в прогресс-баре → открыть его, кнопка «Пересохранить»
- «Завершить импорт»: серая, пока не сохранены все 12. При клике: собирает `articleData`, отправляет `POST /api/articles/import`

### Состояние

```ts
interface ImportState {
  savedIterations: Set<number>;
  iterationsData: Record<number, string>;
  parsedData: Record<number, Record<string, string>>;
  errors: Record<number, string>; // iteration → error message
  importing: boolean;
}
```

`localStorage` ключ: `expers-import-draft`.

---

## Итерация 5 реализации: `lib/import-parser.ts`

```ts
/** Очищает ответ ИИ: снимает code fences, отрезает текст до первого ## Итерация */
function cleanAiResponse(raw: string): string;

/** Парсит Markdown одной итерации в плоский словарь ключ→значение */
function parseIterationMarkdown(
  md: string,
  iteration: TemplateIteration
): ParseResult;
// ParseResult = { ok: true, data: Record<string, string> }
//             | { ok: false, error: string, missingFields: string[] }
```

Алгоритм:

1. `cleanAiResponse` — убрать \`\`\`markdown ... \`\`\`
2. Найти `## Итерация N` в тексте, отрезать всё до него
3. Разбить по `### `, для каждого блока: первая строка = ключ, остальное = значение
4. Сопоставить ключи (case-insensitive, trim) с `outputFields` и `optionalFields`
5. Спец-обработка для итерации 9: парсить `### sectionTable` в `tableData`

```ts
/** Собирает 12 итераций в полный объект статьи */
function buildArticleData(
  parsedIterations: Map<number, Record<string, string>>
): ImportArticleData;
```

Маппинг полей:

| Итерация | Поле в Markdown      | Поле в Article                         |
| -------- | -------------------- | -------------------------------------- |
| 1        | `industryId`         | `article.industryId` ("none" → "none") |
| 1        | `industryName`       | `article.industryName` ("Без отрасли") |
| 5        | `title`              | `article.title`                        |
| 5        | `introduction`       | `article.description` ⚠️               |
| 5        | `slug`               | `article.slug`                         |
| 6–11     | `sectionTitle`       | `sections[i].title`                    |
| 6–11     | `sectionText`        | `sections[i].text`                     |
| 6–11     | `sectionDescription` | `sections[i].description`              |
| 6–11     | `sectionDesign`      | `sections[i].design`                   |
| 6–11     | `imageUrl`           | `sections[i].imageData`                |
| 9        | `sectionTable`       | `sections[i].tableData`                |
| 12       | `faq`                | `article.faq`                          |
| 12       | `tldr`               | `article.tldr`                         |

⚠️ Важно: `introduction` в итерации 5 мапится на `article.description`, а не на
`article.content`. Секции 6–11 формируют `article.content` через `buildContentFromSections`.

---

## Итерация 6 реализации: `lib/import-validation.ts`

```ts
// Отдельная lenient-схема для импорта
export const importArticleSchema = z.object({
  title: articleSchema.shape.title,
  description: articleSchema.shape.description,
  content: z.string().min(100).max(150000),
  slug: articleSchema.shape.slug,
  industryId: z.string(),        // допускает "none"
  industryName: z.string(),
  // ...
  faq: z.array(...).min(0).max(5),   // .min(0) вместо .min(1)
  keyFacts: z.array(...).min(0).max(7),
  howTo: z.array(...).min(0),
  sources: z.array(...).min(0),
  // ...
});

// Схемы для каждой итерации
export const iterationSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    industryId: z.literal("none"),
    industryName: z.literal("Без отрасли"),
    subsectionId: z.literal("none"),
    subsectionName: z.literal("Без подсектора"),
  }),
  6: z.object({
    sectionTitle: z.string().min(5).max(200),
    sectionText: z.string().min(15000),
    sectionDesign: z.literal("image-right"),
    imageUrl: z.string().min(1),
  }),
  // ...
};
```

---

## Итерация 7 реализации: `app/api/articles/import/route.ts`

```
POST /api/articles/import
Authorization: Bearer <token>
Content-Type: application/json

{ "articleData": { /* ImportArticleData */ } }
```

1. Авторизация (`verifyToken`)
2. `importArticleSchema.safeParse(articleData)` — если ошибка, 400 + детали
3. `isDatabaseAvailable()` — если нет, 503
4. Вычислить `readTime` = `Math.max(1, Math.round(contentWordCount / 150))` + " мин"
5. `createArticle({ ...articleData, id, authorId, authorName, readTime, status: "draft", expertId })`
6. Проверить `hasPaid` → если да, `article.status = "pending_review"`
7. 201 + `{ article }`

---

## Итерация 8 реализации: Кнопки в `author-articles.tsx`

Добавить в хедер (строка ~640) и в пустое состояние (строка ~712):

```tsx
<div className="flex items-center gap-2">
  <Button
    onClick={() => router.push("/cabinet/import")}
    variant="outline"
    className="text-sm h-9 px-4"
  >
    <Upload className="h-4 w-4 mr-1.5" />
    Импорт
  </Button>
  <Button
    disabled
    variant="outline"
    className="text-sm h-9 px-4 opacity-50 cursor-not-allowed"
    title="AI-импорт планируется в следующих версиях"
  >
    <Sparkles className="h-4 w-4 mr-1.5" />
    AI
  </Button>
  <Button
    onClick={handleCreate}
    className="bg-[#0039CA] hover:bg-[#2C3E50] text-white text-sm h-9 px-4"
  >
    <Plus className="h-4 w-4 mr-1.5" />
    Создать статью
  </Button>
</div>
```

Импортировать `Upload`, `Sparkles` из `lucide-react`.

---

## Итерация 9 реализации: Интеграция `?importId=` в визарде

**Файл:** `components/article-wizard-client.tsx`

### Загрузка импортированной статьи

```tsx
useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const importId = searchParams.get("importId");
  if (!importId || !expert) return;

  const token = localStorage.getItem("token");
  fetch(`/api/articles/${importId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => {
      const article = data.article as Article;

      // КРИТИЧНО: конвертировать "none" → "" для шагов 1–3
      const industryId =
        article.industryId === "none" ? "" : article.industryId;
      const industryName =
        article.industryName === "Без отрасли" ? "" : article.industryName;
      const subsectionId =
        article.subsectionId === "none" ? "" : article.subsectionId;
      const subsectionName =
        article.subsectionName === "Без подсектора"
          ? ""
          : article.subsectionName;
      const categoryId =
        article.categoryId === "none" ? "" : article.categoryId;
      const categoryName =
        article.categoryName === "Без категории" ? "" : article.categoryName;
      const expertiseAreas =
        article.expertiseAreas[0] === "Общая экспертиза"
          ? []
          : article.expertiseAreas;

      setData({
        industryId,
        industryName,
        subsectionId,
        subsectionName,
        categoryId,
        categoryName,
        expertiseAreas,
        crossLinks: article.crossLinks,
        title: article.title,
        introduction: article.description,
        slug: article.slug || "",
        content: article.content,
        faq: article.faq,
        todo: article.todo,
        tldr: article.tldr,
        keyFacts: article.keyFacts,
        definition: article.definition,
        featuredSnippet: article.featuredSnippet,
        problemSolutionResult: article.problemSolutionResult,
        howTo: article.howTo,
        methodology: article.methodology,
        sources: article.sources,
        sections:
          parseSectionsFromContent(article.content) || defaultData.sections,
      });
      setCreatedArticleId(article.id);
      setStep(11); // Предпросмотр
      localStorage.removeItem("expers-import-draft");
    });
}, [expert]);
```

### Результат для пользователя

- Визард открывается на шаге 11 (предпросмотр) с полным контентом
- Шаги 1–3 в прогресс-баре — серые (не заполнены), шаги 4–10 — зелёные (импортированы)
- Пользователь видит статью → проверяет → если нужно, возвращается к шагам 1–3, выбирает реальные значения
- Без выбора отрасли кнопка «Опубликовать» не сработает (step1Schema.min(1) на пустой строке)

---

## Итерация 10 реализации: Обновление лимитов контента

| Файл                                   | Строка                                  | Было    | Стало    |
| -------------------------------------- | --------------------------------------- | ------- | -------- |
| `app/api/articles/route.ts`            | `content: z.string().min(100).max(...)` | `10000` | `150000` |
| `lib/validation.ts`                    | `step7Schema.content.max`               | `10000` | `150000` |
| `components/article-wizard-client.tsx` | `content.length >`                      | `10000` | `150000` |

DB: SQLite TEXT не имеет ограничений на уровне столбца. 150 KB помещается.

---

## Итерация 11 реализации: Проверка и полировка

### Статические проверки

```bash
npm run typecheck
npm run lint
npm run format
npm run build
```

### Smoke test (playwright-cli через `http://localhost:8080`)

1. `/cabinet` → переключиться на «Я автор» → «Статьи»
2. Кнопка «Импорт» видна и активна, кнопка «AI» видна и заблокирована (title при наведении)
3. Переход на `/cabinet/import` → страница загружается, хедер и описание присутствуют
4. Кнопка «Скачать шаблон» → скачивается `.md` файл, структура: системный промпт + 12 итераций
5. Итерация 1: вставить Markdown-заглушку → «Сохранить» → зелёная галочка, итерация 2 активна
6. Итерация 1: вставить битый Markdown → «Сохранить» → красная ошибка парсинга
7. Пройти все 12 итераций → «Завершить импорт» → toast.loading → редирект на `/articles/new?importId=...`
8. Визард на шаге 11, все секции и GEO-блоки отображаются
9. Вернуться на шаг 1 → пустое поле отрасли, сообщение «Выберите отрасль»
10. Выбрать отрасль, подсектор, категорию, экспертизу → кнопка «Опубликовать» активна

### Обработка ошибок

- Пустой textarea → «Поле не может быть пустым»
- Markdown без `## Итерация N` → «Не найден маркер итерации»
- Отсутствует `### sectionText` → «Отсутствует обязательное поле sectionText»
- Контент < минимума → «Недостаточно текста: X KB, требуется ≥ 15 KB»
- Сеть недоступна → toast.error + данные в localStorage
- БД недоступна → 503 + toast «Повторите позже»

### UI

- `animate-in fade-in slide-in-from-bottom-4 duration-500` для каждой итерации
- `<Skeleton />` при первом входе (загрузка шаблона из API)
- Спиннер на кнопках «Сохранить» и «Завершить импорт»
- Зелёная галочка `Check` на шаге прогресс-бара

---

## Порядок выполнения

1. `lib/import-template.ts` — 12 промптов + системная инструкция + `generateTemplate()`
2. `app/api/templates/article/route.ts` — endpoint скачивания `.md`
3. `app/cabinet/import/page.tsx` — роут страницы
4. `components/article-import-client.tsx` — визард импорта (UI + блокировка + localStorage)
5. `lib/import-parser.ts` — очистка + парсинг Markdown + `buildArticleData`
6. `lib/import-validation.ts` — `importArticleSchema` + `iterationSchemas`
7. `app/api/articles/import/route.ts` — создание черновика
8. `components/author-articles.tsx` — кнопки «Импорт» + «AI»
9. `components/article-wizard-client.tsx` — `?importId=` + `"none"→""` + лимит 150K
10. `app/api/articles/route.ts` + `lib/validation.ts` — лимиты 150K
11. Проверки: typecheck, lint, format, build, smoke test

---

## Риски

| Риск                                             | Решение                                                                                              |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| ИИ меняет формат (регистр, лишний текст)         | `cleanAiResponse`: снять fences, отрезать до `##`. Ключи case-insensitive. Пример в каждой итерации. |
| ИИ выдаёт 40 KB вместо 15–20 KB                  | Не обрезаем. Warning в консоль. DB и рендер выдерживают.                                             |
| `"none"` проходит `step1Schema.min(1)`           | Конвертация `"none"→""` при загрузке в визард. Пустая строка фейлит `.min(1)`.                       |
| Внешние URL в `<img>` не грузятся (CORS)         | `<img>` не подчиняется CORS. Проверено на соседних проектах.                                         |
| Пользователь не понимает 12-итерационный процесс | Кнопка «Как это работает?» с пошаговой инструкцией. Кнопка «Показать пример» для каждой итерации.    |
| Slug конфликтует                                 | Импорт НЕ проверяет slug. Slug проверяется при публикации в визарде (существующая логика).           |
| AI-кнопка: пользователи ждут фичу                | Disabled + tooltip «AI-импорт планируется в следующих версиях» — управляет ожиданиями.               |
