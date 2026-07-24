# Большой план тестирования Expers.ru

## Текущее состояние

| Категория                        | Есть                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Unit-тесты (vitest)              | 83 теста в 4 файлах (`auth`, `article-utils`, `import`, `validation steps 1-10`) |
| E2E-тесты (Playwright)           | 200 тестов (40 READER + 40 AUTHOR + 40 ADMIN + 40 API × 2 проекта)               |
| CI/CD                            | **Отсутствует**                                                                  |
| Coverage                         | **Не настроен**                                                                  |
| Нагрузочное                      | **Отсутствует**                                                                  |
| Безопасность/accessibility       | **Отсутствует**                                                                  |
| Визуальная регрессия             | **Отсутствует**                                                                  |
| `npm test` / `npm run test:unit` | **Отсутствует**                                                                  |
| Тест-дата менеджмент             | Ручной seed-скрипт                                                               |

**Ключевые пробелы:** 29 lib-файлов без тестов, 13 API-роутов без E2E, 17 компонентов без покрытия, нет CI, нет coverage.

---

## 1. CI/CD — GitHub Actions

### 1.1. `.github/workflows/test.yml`

Триггеры: `push` в `main`, `pull_request`, `schedule` (cron `0 3 * * *` — nightly).

Джобы:

| Job               | Когда                     | Что делает                                                                                                                               |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `lint-typecheck`  | Всегда                    | `npm run lint && npm run typecheck`                                                                                                      |
| `unit-tests`      | Всегда                    | `npx vitest run --coverage`, загрузка артефакта coverage                                                                                 |
| `e2e-tests`       | Всегда                    | `docker compose up -d`, `npm run db:migrate`, `npm run test:seed`, `npx playwright test --project=chromium`, загрузка трейсов/скриншотов |
| `load-tests`      | Только cron nightly       | `k6 run scripts/load/`                                                                                                                   |
| `accessibility`   | Всегда                    | `npx playwright test e2e/accessibility/`                                                                                                 |
| `coverage-report` | Всегда (после unit-tests) | Загрузка coverage в Codecov/summary                                                                                                      |

Переменные: `JWT_SECRET`, `TBANK_TEST_MODE=true`, `BASE_URL=http://localhost:8080` — через GitHub Secrets/Env.

### 1.2. `npm test` и `npm run test:unit`

```json
"test": "vitest run",
"test:unit": "vitest run",
"test:coverage": "vitest run --coverage",
"test:smoke": "npx playwright test --grep '@smoke'"
```

---

## 2. Code Coverage

### 2.1. Настройка vitest.config.ts

```ts
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov"],
  include: ["lib/**/*.ts", "lib/**/*.tsx"],
  exclude: ["lib/__tests__/**", "lib/bridge/**", "lib/mock-data.ts"],
  thresholds: {
    branches: 60,
    functions: 60,
    lines: 65,
    statements: 65,
  },
}
```

### 2.2. `.nycrc` или `coverage` в package.json

Не нужно — vitest coverage конфиг в `vitest.config.ts` достаточен.

---

## 3. Unit-тесты — закрытие пробелов

Приоритет: критические модули без тестов.

### 3.1. `lib/__tests__/translit.test.ts` — ~10 тестов

- Кириллица → латиница, спецсимволы, пробелы → дефисы, длинные строки, пустая строка, цифры, mixed content

### 3.2. `lib/__tests__/rate-limiter.test.ts` — ~8 тестов

- Первый запрос разрешён, 5 запросов в окне, 6-й блокирован (429), expired entries cleaned, reset после сброса, multiple IPs независимы, "unknown" IP fallback, window rollover

### 3.3. `lib/__tests__/validation-articles.test.ts` — ~15 тестов

- `createArticleSchema`: валидный min, max поля, slug regex, пустой title
- `updateArticleFullSchema`: все поля optional, partial update, status enum, строгие лимиты
- `actionSchema`: валидные/невалидные actions

### 3.4. `lib/__tests__/validation-comments.test.ts` — ~6 тестов

- `createCommentSchema`: все поля, без текста, пустой articleId, длинный текст
- `updateCommentSchema`: только текст, пустой текст

### 3.5. `lib/__tests__/validation-profile.test.ts` — ~8 тестов

- `updateProfileSchema`: валидное имя, bio лимит, expertise массив, socialLinks URL валидация
- `socialLinkSchema`: валидный/невалидный URL, пустая платформа

### 3.6. `lib/__tests__/tbank.test.ts` — ~12 тестов

- `isTestMode()` при `TBANK_TEST_MODE=true/false`
- `isPaymentConfigured()` с ключами и без
- `initPayment()`: test mode возвращает фейковый paymentId, prod mode требует ключи
- `cancelPayment()`: test mode возвращает CANCELED
- `getPaymentState()`: test mode возвращает CONFIRMED
- `buildToken()`: правильный SHA-256 хеш
- `verifyNotificationToken()`: совпадение и несовпадение
- `PUBLICATION_PRICE_KOPECKS` = 500000

### 3.7. `lib/__tests__/admin.test.ts` — ~6 тестов

- `verifyAdmin()`: валидный admin токен → payload, expert токен → 403, reader токен → 403, без токена → 401, просроченный токен → 401

### 3.8. `lib/__tests__/import-parser-edge.test.ts` — ~5 тестов

- `parseTable()`: простая таблица, пустая таблица, невалидный markdown
- Image URL regex extraction
- `buildContentFromSections()` краевые случаи

**Итого: +~70 unit-тестов (стало ~153)**

---

## 4. E2E-тесты — закрытие пробелов

### 4.1. Новый файл: `e2e/author-extended.spec.ts` — ~25 тестов

Авторские разделы без покрытия:

- Author Dashboard: метрики, графики, быстрые действия
- Author Finance: список платежей, фильтр по статусу, инициация оплаты
- Author Comments: список, фильтр, ответ на комментарий
- Author Subscribers: список подписчиков, количество
- Author Social Analytics: статистика
- Article Share Button: копирование ссылки, шаринг
- Payment Done/Fail pages: редирект и содержимое

### 4.2. Новый файл: `e2e/api-extended.spec.ts` — ~20 тестов

Непокрытые API-роуты:

- `POST /api/auth/reset-password` — сброс пароля с кодом
- `GET /api/comments` — список по articleId и authorId
- `GET /api/favorites` — список избранного
- `GET /api/subscriptions` — список подписок/подписчиков
- `GET/POST/PUT/DELETE /api/section-subscriptions` — полный CRUD
- `DELETE /api/history` — очистка истории
- `GET /api/author-page` — публичная страница автора
- `POST /api/upload/avatar` — загрузка аватара (multipart)
- `GET /api/payments/status` — проверка статуса платежа
- `GET /api/admin/dashboard` — прямой вызов (не через UI)
- `GET /api/admin/articles/stats` — статистика публикаций
- `GET /api/admin/experts/stats` — статистика регистраций
- `GET/DELETE /api/admin/comments` — админские операции
- `GET /api/admin/moderation/queue` — очередь модерации
- `POST /api/admin/moderation/approve` — одобрение
- `POST /api/admin/moderation/reject` — отклонение
- `POST /api/admin/payments/cancel` — отмена платежа

### 4.3. Новый файл: `e2e/smoke.spec.ts` — ~8 тестов

Быстрый sanity check (tag `@smoke`), <30 секунд:

- Health check → 200
- Главная страница → 200, H1 виден
- Логин → JWT получен
- Каталог → статьи загружены
- Страница статьи → рендерится
- Админ-дашборд → доступен с admin-токеном
- Модерация → очередь доступна

### 4.4. Дополнить `e2e/helpers/api.ts`

- `sectionSubscriptionCRUD()`, `uploadAvatar()`, `resetPassword()`, `getPaymentStatus()`, `adminApiCall()`

**Итого E2E: ~200 → ~253 тестов (+ smoke не дублируют существующие)**

---

## 5. Нагрузочное тестирование — k6

### 5.1. `scripts/load/k6-smoke.js` — smoke-тест

1 VU, 1 итерация каждого эндпоинта: health, каталог, страница статьи, статические страницы.

### 5.2. `scripts/load/k6-api.js` — API-нагрузка

Ramp-up: 0 → 50 VU за 30s, держать 50 VU 2 мин, ramp-down 30s.

Сценарии:

- `GET /api/health` — 10% трафика
- `GET /api/articles` — 40% трафика
- `GET /api/articles/[id]` — 30% трафика
- `POST /api/auth/login` — 10% трафика
- `GET /api/expert/profile` — 10% трафика

Пороги:

- `http_req_duration` p95 < 500ms
- `http_req_failed` < 1%
- `checks` > 99%

### 5.3. `scripts/load/k6-stress.js` — стресс-тест

Ramp-up: 0 → 100 VU за 1 мин, держать 2 мин, ramp-down 1 мин. Те же сценарии.

### 5.4. `scripts/load/k6-spike.js` — пиковый тест

0 → 200 VU мгновенно, держать 30s, сброс до 0. Только health + каталог.

---

## 6. Безопасность и accessibility

### 6.1. `e2e/accessibility/a11y.spec.ts` — ~10 тестов

Playwright + `@axe-core/playwright`:

- Главная `/`
- Страница статьи `/proizvodstvo/kak-ii-menyaet-...`
- Кабинет `/cabinet`
- Визард `/articles/new`
- Админ-дашборд `/admin`
- Админ-модерация `/admin/moderation`
- Логин-диалог (открытый)
- Регистрация-диалог

Установка: `npm install -D @axe-core/playwright`

### 6.2. Ручной OWASP-чеклист — `.kilo/plans/security-checklist.md`

Документ с проверками:

| Категория                          | Проверки                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| **A01: Broken Access Control**     | Читатель не может PATCH чужую статью (403), не может в /admin, токен без роли admin → 403     |
| **A02: Cryptographic Failures**    | JWT HS256, bcrypt 10 rounds, HTTPS на проде, пароли не логируются                             |
| **A03: Injection**                 | SQL — drizzle параметризованные запросы; XSS — проверка экранирования в комментариях и статье |
| **A04: Insecure Design**           | Rate-limit на критических ручках, CORS заголовки                                              |
| **A05: Security Misconfiguration** | JWT_SECRET обязателен, test mode не в проде, CSP заголовки                                    |
| **A06: Vulnerable Components**     | `npm audit` в CI                                                                              |
| **A07: Auth Failures**             | Brute-force через rate-limit, 6-значный код сброса, 15-минутное окно                          |
| **A08: Software & Data Integrity** | `package-lock.json` в репозитории, CI проверяет целостность                                   |
| **A09: Logging & Monitoring**      | Health-check, structured errors, no secret logging                                            |
| **A10: SSRF**                      | T-Bank URL хардкоден, нет пользовательских URL в запросах                                     |
| **A11: Business Logic**            | Статус-машина статей, двойная оплата, отмена после подтверждения                              |

### 6.3. Автоматические проверки в CI

- `npm audit --audit-level=high` (блокирует CI при high/critical)
- Проверка CSP/CORS заголовков в E2E тестах (уже есть AD39)

---

## 7. Визуальная регрессия — Playwright Screenshots

### 7.1. `e2e/visual/visual.spec.ts` — ~12 тестов

Полноэкранные скриншоты с `toMatchSnapshot`:

| Страница           | Viewport           |
| ------------------ | ------------------ |
| Главная (каталог)  | Desktop (1280×720) |
| Главная (каталог)  | Mobile (375×812)   |
| Страница статьи    | Desktop            |
| Страница статьи    | Mobile             |
| Кабинет (читатель) | Desktop            |
| Кабинет (автор)    | Desktop            |
| Визард (шаг 1)     | Desktop            |
| Админ-дашборд      | Desktop            |
| Админ-модерация    | Desktop            |
| Диалог логина      | Desktop            |
| Диалог регистрации | Desktop            |
| Страница автора    | Desktop            |

### 7.2. Обновление скриншотов

```bash
npx playwright test --update-snapshots
```

Скриншоты коммитятся в репозиторий (`e2e/visual/__screenshots__/`).

---

## 8. Тест-дата менеджмент

### 8.1. `scripts/seed-test-data.ps1` — доработка

- Добавить флаг `-Reset` для удаления старых данных перед seed
- Добавить флаг `-PublishAll` для публикации всех созданных статей
- Добавить `-ArticleCount N` для создания N статей (для нагрузочного теста)

### 8.2. Factories (опционально, фаза 2)

- `lib/test-utils/factories.ts`: `createTestExpert()`, `createTestArticle()`, `createTestComment()`
- Использовать `better-sqlite3` напрямую для быстрого наполнения без HTTP

---

## 9. План выполнения (порядок)

### Фаза 1 — Инфраструктура (день 1)

1. **`package.json`**: добавить `test`, `test:unit`, `test:coverage`, `test:smoke`
2. **`vitest.config.ts`**: добавить coverage-секцию
3. **`.github/workflows/test.yml`**: создать CI-пайплайн
4. **`npm install -D @axe-core/playwright @vitest/coverage-v8`**

### Фаза 2 — Unit-тесты (день 1-2)

5. `lib/__tests__/translit.test.ts`
6. `lib/__tests__/rate-limiter.test.ts`
7. `lib/__tests__/validation-articles.test.ts`
8. `lib/__tests__/validation-comments.test.ts`
9. `lib/__tests__/validation-profile.test.ts`
10. `lib/__tests__/tbank.test.ts`
11. `lib/__tests__/admin.test.ts`
12. `lib/__tests__/import-parser-edge.test.ts`

### Фаза 3 — E2E-расширение (день 2-3)

13. `e2e/api-extended.spec.ts` — 20 непокрытых API-роутов
14. `e2e/author-extended.spec.ts` — 25 авторских сценариев
15. `e2e/smoke.spec.ts` — 8 smoke-тестов
16. `e2e/helpers/api.ts` — новые хелперы

### Фаза 4 — Accessibility + Security (день 3)

17. `e2e/accessibility/a11y.spec.ts`
18. `.kilo/plans/security-checklist.md`
19. `npm audit` в CI
20. Проверка rate-limit в E2E на правильных эндпоинтах

### Фаза 5 — Визуальная регрессия (день 3)

21. `e2e/visual/visual.spec.ts`

### Фаза 6 — Нагрузочное тестирование (день 4)

22. `scripts/load/k6-smoke.js`
23. `scripts/load/k6-api.js`
24. `scripts/load/k6-stress.js`
25. `scripts/load/k6-spike.js`
26. `scripts/load/run-all.sh` / `run-all.ps1`
27. Nightly cron в CI для нагрузочных тестов

### Фаза 7 — Документация и финализация (день 4)

28. `npm run format && npm run check`
29. Обновить AGENTS.md — секция про тестирование
30. README или `docs/testing.md` — как запускать тесты

---

## 10. Риски и открытые вопросы

| #   | Риск                                                                         | Митигация                                                                                        |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | k6 требует установки (не npm-пакет)                                          | Установить через `winget install k6` или chocolatey; в CI использовать `grafana/k6` Docker image |
| 2   | Визуальные скриншоты флапают на разных OS                                    | Использовать `maxDiffPixelRatio: 0.01`, CI только на Linux                                       |
| 3   | Нагрузочные тесты на проде могут уронить сервер                              | Всегда запускать против staging или с `TBANK_TEST_MODE=true` локально                            |
| 4   | `@vitest/coverage-v8` может конфликтовать с native-модулями (better-sqlite3) | Использовать `@vitest/coverage-istanbul` как fallback                                            |
| 5   | Rate-limiter тесты требуют моков или sleep                                   | Использовать `vi.useFakeTimers()` для детерминизма                                               |
| 6   | CI требует Docker (для E2E)                                                  | `ubuntu-latest` в GitHub Actions поддерживает Docker из коробки                                  |
| 7   | Секреты (JWT_SECRET, TBANK ключи) для CI                                     | Использовать GitHub Secrets, для тестов хватит `test-secret` и `TBANK_TEST_MODE=true`            |

---

## 11. Финальные метрики

| Метрика                  | Было | Стало                      |
| ------------------------ | ---- | -------------------------- |
| Unit-тестов              | 83   | ~153                       |
| E2E-тестов               | 200  | ~253 (+smoke)              |
| Accessibility тестов     | 0    | ~10                        |
| Визуальных тестов        | 0    | ~12                        |
| Нагрузочных сценариев k6 | 0    | 4                          |
| CI pipeline              | 0    | 1                          |
| Coverage порог           | Нет  | 65% lines / 60% branches   |
| `npm test`               | Нет  | Есть                       |
| Непокрытых API-роутов    | 13   | 0                          |
| Непокрытых компонентов   | 17   | ~5 (bridge/infrastructure) |
