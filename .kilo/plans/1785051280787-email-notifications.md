# План: Email-уведомления через Mail.ru

## Данные подключения

- **Email:** `info@expers.ru`
- **Пароль приложения:** `ZiYwU6r2dsOjyMXWrBlB`
- **SMTP:** `smtp.mail.ru:465` (SSL)
- **Библиотека:** `nodemailer`

---

## Полный список сценариев (аналоги Habr, VC.ru, Medium)

### Приоритет 1 — ядро (must have)

| #    | Сценарий                                | Триггер                                         | Существующий код                                                      |
| ---- | --------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| P1-1 | Подтверждение почты при регистрации     | `POST /api/auth/register`                       | Нет                                                                   |
| P1-2 | Сброс пароля                            | `POST /api/auth/forgot-password`                | Код генерится, но не отправляется. Клиент ждёт код в ответе API — баг |
| P1-3 | Оплата прошла / не прошла               | `POST /api/payments/webhook`                    | Нет                                                                   |
| P1-4 | Статья одобрена / отклонена модератором | `POST /api/admin/moderation/approve` и `reject` | Нет                                                                   |
| P1-5 | Обратная связь с сайта                  | Новая форма на странице `/contacts`             | Нет формы — только статика с `mailto:`                                |

### Приоритет 2 — вовлечение (should have)

| #    | Сценарий                                | Триггер                                              | Как                                                                                     |
| ---- | --------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| P2-1 | Еженедельный дайджест для автора        | GitHub Actions cron → `POST /api/cron/weekly-digest` | Понедельник 9:00 МСК. Агрегирует метрики за 7 дней по каждому автору и шлёт одно письмо |
| P2-2 | Приветственное письмо после регистрации | `POST /api/auth/register`                            | Сразу после регистрации                                                                 |

> **Почему дайджест, а не индивидуальные уведомления:** комментарии и подписчики приходят по многу раз в день — автору будет неприятно получать спам. Одно письмо в начале недели со всеми цифрами повторяет подход Habr/VC.ru.

### Приоритет 3 — low priority / отложить

| #    | Сценарий                       | Комментарий                                                                                                     |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| P3-1 | Смена email в профиле          | Нужен отдельный API + подтверждение нового email. Профиль (`PUT /api/expert/profile`) сейчас не принимает email |
| P3-2 | Удаление аккаунта              | Нет API удаления — требует доработки модели                                                                     |
| P3-3 | Массовая рассылка / newsletter | Требует очереди, сегментации, unsubscribe — вне скоупа MVP                                                      |

---

## Шаг 1: Установка nodemailer

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## Шаг 2: Переменные окружения

Добавить в `.env.example`, `.env.docker`:

```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=info@expers.ru
SMTP_PASS=ZiYwU6r2dsOjyMXWrBlB
```

## Шаг 3: `lib/mail.ts` — SMTP транспорт

```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mail.ru",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "info@expers.ru",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM = '"Expers" <info@expers.ru>';

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({ from: FROM, ...options });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
```

## Шаг 4: `lib/mail-templates.ts` — HTML-шаблоны

Функции возвращают HTML-строки с единым стилем (лого Expers, accent-цвет `#0039CA`):

- `verificationEmail(code)` — «Ваш код подтверждения: 123456»
- `resetPasswordEmail(code)` — «Код для сброса пароля: 123456»
- `welcomeEmail(name)` (P2-2) — «Добро пожаловать в Expers, {name}!»
- `paymentSuccessEmail(articleTitle)` — «Оплата получена. Статья "{title}" отправлена на модерацию»
- `paymentFailedEmail(articleTitle)` — «Платёж не прошёл. Статья "{title}" возвращена в черновик»
- `articleApprovedEmail(articleTitle, articleUrl)` — «Статья "{title}" опубликована»
- `articleRejectedEmail(articleTitle, reason)` — «Статья "{title}" отклонена. Причина: {reason}»
- `weeklyDigestEmail(stats: AuthorWeeklyStats)` (P2-1) — дайджест с метриками за неделю
- `feedbackNotificationEmail(name, email, subject, message)` (P1-5) — для внутреннего оповещения на info@expers.ru

## Шаг 5: DB-схема — email_verifications и email_verified

### 5a. Новая таблица `email_verifications` (lib/schema.ts)

```ts
export const emailVerifications = sqliteTable("email_verifications", {
  id: text("id").primaryKey(),
  expertId: text("expert_id").notNull(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: text("expires_at").notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
```

### 5b. Колонка `email_verified` в `experts`

```ts
// в lib/schema.ts добавить в experts:
emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
```

```sql
-- в migrate.ts (TABLE_SCHEMAS):
ALTER TABLE experts ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
```

### 5c. Миграция

Добавить SQL `CREATE TABLE IF NOT EXISTS email_verifications` в `scripts/migrate.ts`.

## Шаг 6: `lib/models.ts` — новые функции

- `createEmailVerification(expertId, email): string` — генерирует 6-значный код, сохраняет, возвращает код
- `verifyEmailCode(expertId, code): boolean` — проверяет код, помечает `used`, ставит `email_verified = 1`
- `getPaymentWithArticle(orderId)` — возвращает платёж + `expert.email` автора (для P1-3)
- `getExpertById(id)` — уже существует, проверить что возвращает `email_verified`

## Шаг 7: P1-1 — API подтверждения почты

Новый **POST** `/api/auth/verify-email`:

```ts
// Принимает { email, code }
// Вызывает verifyEmailCode()
// Возвращает { ok: true } или 400/404
```

И изменить **POST** `/api/auth/register`:

1. После `createExpert()` → `createEmailVerification()` → `sendMail(verificationEmail(code))` (fire-and-forget, `.catch(log)`)
2. Вернуть токен + `email_verified: false`
3. На клиенте (`auth-buttons.tsx`) после регистрации: тост «Код подтверждения отправлен на email»

## Шаг 8: P1-2 — Исправление «Забыли пароль»

Изменить `POST /api/auth/forgot-password`:

1. `const code = await createPasswordReset(email)` (функция уже возвращает код)
2. `sendMail(resetPasswordEmail(code)).catch(console.error)` — fire-and-forget
3. **Убрать `code` из ответа** — вернуть только `{ ok: true, message }`

Исправить `auth-buttons.tsx`:

- Убрать `setForgotCode(data.code)` (строка 57) — код не возвращается API
- Тост: «Код отправлен на email. Проверьте почту.»
- Поле ввода кода на шаге `"reset"` — пользователь вводит код из письма вручную

## Шаг 9: P1-3 — Уведомления о платежах

Изменить `POST /api/payments/webhook`:

После апдейта статуса отправить email автору статьи:

- **CONFIRMED** → `sendMail(paymentSuccessEmail(title))`
- **REJECTED / CANCELED** → `sendMail(paymentFailedEmail(title))`
- **REFUNDED** → `sendMail(paymentFailedEmail(title))` (возврат — тоже уведомить)

Для получения `email` автора: добавить в `lib/models.ts` функцию `getPaymentWithArticle(orderId)`, которая JOIN-ит payments и experts.

## Шаг 10: P1-4 — Уведомления о модерации

### `POST /api/admin/moderation/approve`

После `approveArticle()`:

- `getExpertById(article.expertId)` → получить `email`
- `sendMail(articleApprovedEmail(title, articleUrl(id, slug, industryId)))`

### `POST /api/admin/moderation/reject`

После `rejectArticle()`:

- `getExpertById(article.expertId)` → `email`
- `sendMail(articleRejectedEmail(title, reason))`

## Шаг 11: P1-5 — Форма обратной связи

### Новый API `POST /api/feedback`

```ts
// Принимает { name?, email, subject?, message } (zod)
// sendMail(feedbackNotificationEmail(...)) → на info@expers.ru
// Возвращает { ok: true }
// Rate-limit: не более 3 запросов в час с одного IP
```

### Новый компонент `components/feedback-form.tsx` — "use client"

- Поля: name (необязательно), email (обязательно), subject (опционально), message (обязательно)
- Сабмит на `/api/feedback`
- Тост «Сообщение отправлено» / «Ошибка»
- Отступ между полями 4 (gap-4)
- Добавить на страницу `/contacts` внизу, перед CTA-блоком

## Шаг 12: P2-1 — Еженедельный дайджест автора

### 12a. Метрики в дайджесте (из БД, за последние 7 дней)

```ts
interface AuthorWeeklyStats {
  authorName: string;
  authorEmail: string;
  // Статьи
  articlesPublished: number; // новых опубликованных
  articlesInModeration: number; // на модерации
  articlesTotal: number; // всего активных
  // Вовлечение
  newSubscribers: number;
  newComments: number;
  newFavorites: number;
  // Платежи
  paymentsCount: number;
  paymentsTotal: number; // сумма в копейках → рубли в шаблоне
  // Топ-статья
  topArticleTitle: string | null;
  topArticleComments: number;
  periodStart: string; // ISO дата начала периода
  periodEnd: string; // ISO дата конца периода
}
```

> Просмотры статей (`views`) пока пропускаем — они хранятся только в `localStorage` клиента. Добавим позже, когда появится серверный трекинг.

### 12b. `lib/models.ts` — запросы агрегации

```ts
export async function getAuthorWeeklyStats(
  authorId: string,
  since: string,
  until: string
): Promise<AuthorWeeklyStats>;
```

SQL-запросы (через drizzle или raw better-sqlite3):

- **Статьи опубликованные:** `SELECT count(*) FROM articles WHERE expertId = ? AND status = 'published' AND updatedAt BETWEEN ? AND ?`
- **Статьи на модерации:** `SELECT count(*) FROM articles WHERE expertId = ? AND status = 'pending_review'`
- **Всего статей:** `SELECT count(*) FROM articles WHERE expertId = ? AND status != 'archived'`
- **Новые подписчики:** `SELECT count(*) FROM subscriptions WHERE authorId = ? AND createdAt BETWEEN ? AND ?`
- **Новые комментарии:** `SELECT count(*) FROM comments JOIN articles ON comments.articleId = articles.id WHERE articles.expertId = ? AND comments.createdAt BETWEEN ? AND ?`
- **Новые избранные:** `SELECT count(*) FROM favorites JOIN articles ON favorites.articleId = articles.id WHERE articles.expertId = ? AND favorites.createdAt BETWEEN ? AND ?`
- **Платежи:** `SELECT count(*), sum(amount) FROM payments WHERE userId = ? AND status = 'CONFIRMED' AND createdAt BETWEEN ? AND ?`
- **Топ-статья:** `SELECT articles.title, count(comments.id) c FROM articles LEFT JOIN comments ON comments.articleId = articles.id WHERE articles.expertId = ? AND articles.status = 'published' GROUP BY articles.id ORDER BY c DESC LIMIT 1`

### 12c. `POST /api/cron/weekly-digest` — защищённый эндпоинт

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const experts = await getExpertsWithArticles(); // все авторы у которых есть статьи

  for (const expert of experts) {
    if (!expert.email) continue;
    const stats = await getAuthorWeeklyStats(expert.id, weekAgo, now);
    // Пропускаем если за неделю ничего не произошло (нет смысла слать пустой дайджест)
    if (
      stats.newSubscribers === 0 &&
      stats.newComments === 0 &&
      stats.articlesPublished === 0
    ) {
      continue;
    }
    await sendMail({
      to: expert.email,
      subject: `Дайджест Expers — ${formatWeekRange(weekAgo, now)}`,
      html: weeklyDigestEmail(stats),
    });
  }

  return NextResponse.json({ ok: true, sent: experts.length });
}
```

Добавить `CRON_SECRET=<random-32>` в `.env.example` и `.env.docker`.

### 12d. GitHub Actions: планировщик (понедельник 9:00 МСК = 6:00 UTC)

Новый workflow `.github/workflows/weekly-digest.yml`:

```yaml
name: Weekly Author Digest

on:
  schedule:
    - cron: "0 6 * * 1" # 9:00 MSK понедельник
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger digest
        run: |
          curl -X POST https://expers.ru/api/cron/weekly-digest \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
```

### 12e. HTML-шаблон дайджеста

Структура письма (в `weeklyDigestEmail()`):

```
Логотип EXPERS
─────────────────
Дайджест за 21.07 – 27.07.2026

Здравствуйте, {name}!

Вот что произошло с вашими публикациями на этой неделе:

┌─────────────────────────────┐
│  Опубликовано статей    3   │
│  На модерации           1   │
│  Всего активно          12  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Новых подписчиков      5   │
│  Новых комментариев     7   │
│  Добавили в избранное   4   │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Платежей               1   │
│  На сумму            9 900 ₽│
└─────────────────────────────┘

Самая обсуждаемая статья:
  «Заголовок статьи» — 12 комментариев

─────────────────
Перейти в кабинет → [кнопка]
```

## Шаг 13: P2-2 — Приветственное письмо

Изменить `POST /api/auth/register`:

- В том же месте где отправляется verification email → дополнительно `sendMail(welcomeEmail(name))`
- Отправляется сразу после регистрации, отдельно от кода подтверждения

## Шаг 14: Миграция БД

```bash
docker compose exec app npm run db:migrate
```

## Шаг 15: Проверка

- `npm run check` — линт + typecheck
- `npm run build` — production build
- Через `curl` проверить, что API возвращает 200 без реальной отправки (SMTP_HOST не задан → письмо падает в лог)
- На проде проверить входящие `info@expers.ru` в Mail.ru — убедиться, что письма не в спаме

## Риски

| Риск                                                         | Митигация                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Mail.ru лимиты SMTP                                          | Rate-limit API уже есть; дополнительный лимит на `/api/feedback`   |
| Письма в спаме                                               | Настроить SPF/DKIM/DMARC для expers.ru в Mail.ru (административно) |
| Fire-and-forget: потеря письма при падении контейнера        | MVP допустимо; позже BullMQ/Redis                                  |
| Существующие пользователи `email_verified = 0`               | При логине не блокируем — проверка только при публикации статьи    |
| CRON_SECRET не совпадает → дайджест не уходит                | Добавить `CRON_SECRET` в GitHub Secrets и `.env.docker`            |
| Пароль приложения в `.env.docker`                            | На проде через GitHub Secrets / env сервера                        |
| Дайджест-ендпоинт долго выполняется (N авторов × N запросов) | Для MVP с одним автором — норм. При росте: batch-запросы одним SQL |
