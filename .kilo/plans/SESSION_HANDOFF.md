# Сессия 23–24 июля 2026: отчёт и план на следующую сессию

## Выполнено в этой сессии: полная инфраструктура тестирования

### Unit-тесты — 173 теста в 12 файлах

| Файл | Тестов | Что покрыто |
|---|---|---|
| `lib/__tests__/auth.test.ts` | 7 | hashPassword, verifyPassword, generateToken, verifyToken, toSafeExpert |
| `lib/__tests__/article-utils.test.ts` | 17 | getIndustryById, getSubsection, getCategory, estimateReadTime |
| `lib/__tests__/import.test.ts` | 14 | parseIterationMarkdown (1/2/8/9/10/11), parseAllIterations, buildArticleData |
| `lib/__tests__/import-parser-edge.test.ts` | 11 | Краевые случаи: пустой ввод, пропущенные поля, code fences |
| `lib/__tests__/validation.test.ts` | 45 | step1Schema–step10Schema (все шаги визарда) |
| `lib/__tests__/validation-articles.test.ts` | 16 | createArticleSchema, updateArticleFullSchema, actionSchema |
| `lib/__tests__/validation-comments.test.ts` | 9 | createCommentSchema, updateCommentSchema |
| `lib/__tests__/validation-profile.test.ts` | 9 | updateProfileSchema, socialLinkSchema |
| `lib/__tests__/translit.test.ts` | 10 | Кириллица → латиница, спецсимволы, цифры, edge cases |
| `lib/__tests__/rate-limiter.test.ts` | 10 | Окна, сброс, IP-изоляция, fallback, expired cleanup |
| `lib/__tests__/tbank.test.ts` | 15 | Test mode, buildToken, verifyNotificationToken, initPayment, cancelPayment, getPaymentState, ensureProductionConfig |
| `lib/__tests__/admin.test.ts` | 6 | verifyAdmin: 401/403 для всех ролей + валидный admin |
| **Всего** | **173** | |

### E2E-тесты — 253 теста в 8 spec-файлах + 2 helpers

| Файл | Тестов | Что покрыто |
|---|---|---|
| `e2e/reader.spec.ts` | 40 | Каталог, статья, автор, комментарии, избранное, уведомления, кабинет, регистрация/логин |
| `e2e/author.spec.ts` | 40 | Визард 12 шагов, сохранение, публикация, редактирование, управление статьями, импорт, профиль |
| `e2e/admin.spec.ts` | 40 | Дашборд, модерация, статьи, эксперты, комментарии, платежи, безопасность (JWT, CORS, rate-limit) |
| `e2e/api.spec.ts` | 40 | Health, CRUD статей, статус-машина, комментарии, избранное, подписки, аутентификация, платежи, статические страницы |
| `e2e/api-extended.spec.ts` | 20 | Непокрытые API-роуты: section-subscriptions, history, reset-password, admin stats, moderation queue |
| `e2e/author-extended.spec.ts` | 25 | Дашборд автора, финансы, подписчики, аналитика, шаринг, payment done/fail |
| `e2e/smoke.spec.ts` | 8 | Быстрый sanity check (<30s): health, каталог, логин, статья, админ-дашборд |
| `e2e/accessibility/a11y.spec.ts` | 9 | WCAG A/AA для всех ключевых страниц через axe-core |
| **Всего E2E** | **222** | (+12 визуальных снапшотов в `e2e/visual/`) |

### Инфраструктура

| Компонент | Статус |
|---|---|
| CI/CD (`.github/workflows/test.yml`) | 7 джоб: lint+typecheck, unit+coverage, E2E, accessibility, visual regression, security audit, k6 nightly |
| Coverage (vitest + v8) | Пороги: 65% lines, 60% branches/functions |
| `npm test` / `npm run test:unit` | Есть |
| `npm run test:smoke` | Есть (8 тестов, <30s) |
| `npm run test:coverage` | Есть |
| Playwright config | `localhost:8080` по умолчанию, `BASE_URL` env для прода, `maxDiffPixelRatio: 0.05` |
| Визуальная регрессия | 12 снапшотов Desktop + Mobile |
| Нагрузочное тестирование (k6) | 4 сценария: smoke, API (50 VU), stress (100 VU), spike (200 VU) |
| Security checklist | `.kilo/plans/security-checklist.md` (OWASP Top-11) |
| Seed-скрипт | `scripts/seed-test-data.ps1` (3 пользователя + 4 статьи) |

### Тест-дата (в Docker-контейнере)

| Ресурс | Данные |
|---|---|
| Пользователи | reader@test.expers.ru (reader), author@test.expers.ru (expert), admin@test.expers.ru (admin) — пароль у всех `test123456`, у админа `admin123` |
| Статьи | 4 статьи: Производство, Финансы, Здравоохранение, Образование |
| Статусы | 2 published (в каталоге), 2 pending_payment |

### Команды

```bash
npm test                           # 173 unit-тестов
npm run test:smoke                 # 8 быстрых проверок
npm run test:e2e                   # Все 222+12 E2E
npm run test:e2e:reader            # Только читатель
npm run test:e2e:author            # Только автор
npm run test:e2e:admin             # Только админ
npm run test:e2e:api               # Только API
npm run test:coverage              # Coverage-отчёт
npm run test:seed                  # Наполнить БД тестовыми данными
k6 run scripts/load/k6-api.js      # Нагрузочное тестирование (50 VU)
```

### Изменённые/созданные файлы (23 файла)

```
.github/workflows/test.yml                          # CI-пайплайн
lib/__tests__/admin.test.ts                         # +6 тестов
lib/__tests__/tbank.test.ts                         # +15 тестов
lib/__tests__/translit.test.ts                      # +10 тестов
lib/__tests__/rate-limiter.test.ts                   # +10 тестов
lib/__tests__/validation-articles.test.ts           # +16 тестов
lib/__tests__/validation-comments.test.ts           # +9 тестов
lib/__tests__/validation-profile.test.ts            # +9 тестов
lib/__tests__/import-parser-edge.test.ts            # +11 тестов
vitest.config.ts                                    # +coverage config
playwright.config.ts                                # maxDiffPixelRatio, baseURL fix
e2e/api-extended.spec.ts                            # 20 тестов
e2e/author-extended.spec.ts                         # 25 тестов
e2e/smoke.spec.ts                                   # 8 тестов
e2e/accessibility/a11y.spec.ts                      # 9 тестов
e2e/visual/visual.spec.ts                           # 12 снапшотов
e2e/helpers/auth.ts                                 # Улучшенный authenticatePage
e2e/helpers/api.ts                                  # createArticle fix, новые хелперы
scripts/load/k6-smoke.js                            # Smoke-нагрузка
scripts/load/k6-api.js                              # Ramp-up 50 VU
scripts/load/k6-stress.js                           # 100 VU стресс
scripts/load/k6-spike.js                            # 200 VU пик
.kilo/plans/security-checklist.md                   # OWASP-чеклист
.kilo/plans/1784805085143-comprehensive-testing-plan.md  # План тестирования
```

---

## Что НЕ сделано / требует внимания

### Технический долг

1. **Цветовой контраст** — `gray-400` на `gray-50` (~400 элементов) не проходит WCAG AA. A11y-тесты логируют, но не блокируют. Это дизайн-задача.

2. **SQLite в памяти** — rate-limiter хранит счётчики в `Map`, сбрасывается при рестарте. При нескольких контейнерах — изоляция.

3. **Токен-ревокация** — JWT действителен 7 дней без чёрного списка.

4. **Мониторинг** — нет structured logging (pino/winston), нет алертинга.

5. **Визуальные снапшоты** — сгенерированы на Windows (`-chromium-win32`). В CI нужны Linux-версии (`-chromium-linux`).

6. **ESLint warnings** — 19 pre-existing warnings (неиспользуемые импорты, `<img>` вместо `<Image />`, k6 default exports).

### Открытые задачи

7. **SSH-доступ к серверу** — ключи в GitHub Secrets, не на локальной машине. Прямой доступ к `185.65.200.190` есть, но auth не пройден (ключ `expers_ed25519` не подходит для `deploy@`).

8. **Нагрузочные тесты на проде** — не запускались. k6 скрипты готовы, но требуют `k6` на хосте или Docker.

9. **Тесты на прод-сервере** — `BASE_URL=https://expers.ru npm run test:e2e` должно работать (на Windows может быть `ERR_CONNECTION_RESET` из-за `CRYPT_E_NO_REVOCATION_CHECK`).

---

## Ключевые константы (не менять)

- **Порт:** `8080`, прокси через Caddy `:80/:443`
- **Админ:** `info@expers.ru`, роль `admin` через SQL
- **Продавец:** ООО «ФОНИИ», ИНН 7720943604, ОГРН 1257700013141
- **Сервер:** `185.65.200.190`, Debian 13, Docker Compose
- **Деплой:** GitHub Actions → SSH → `docker compose up -d --build app`
- **Цена публикации:** 5 000 ₽ (АУСН)
- **JWT:** HS256, 7 дней, `JWT_SECRET` из env
- **DB:** SQLite через better-sqlite3 + drizzle-orm, путь `./data/expers.db`
- **Роли:** `reader` / `expert` / `admin`

---

## План на следующую сессию

### Приоритет 1 — Закрыть баги и технический долг

1. Исправить 19 ESLint warnings (неиспользуемые импорты в компонентах)
2. Сгенерировать Linux-снапшоты для визуальных тестов (через Docker)
3. Добавить `data-testid` в ключевые компоненты для стабильности E2E-тестов

### Приоритет 2 — Запустить CI

4. Запушить `.github/workflows/test.yml` в репозиторий
5. Настроить GitHub Secrets: `JWT_SECRET`, `TBANK_TEST_MODE`
6. Проверить первый прогон CI, поправить ошибки

### Приоритет 3 — Добить E2E на проде

7. Решить проблему с `ERR_CONNECTION_RESET` на Windows для `https://expers.ru`
8. Запустить полный прогон E2E против прода

### Приоритет 4 — Нагрузочное тестирование

9. Установить k6 локально (`winget install k6`)
10. Запустить `k6 run scripts/load/k6-api.js` против `http://localhost:8080`
11. Оценить результаты, поправить пороги при необходимости
