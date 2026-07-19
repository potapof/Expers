# Сессия 14–18 июля 2026: отчёт и план на следующую сессию

## Администратор (жёстко закреплён)

**Email:** `info@expers.ru`
**Роль:** `admin` — не сменяемая через UI. Назначается через SQL:

```sql
UPDATE experts SET role = 'admin' WHERE email = 'info@expers.ru';
```

Администратор видит кнопку «Администрирование» в хедере рядом с «Мой кабинет».

---

## Выполнено в этой сессии (30+ коммитов)

### Сервер и деплой

- HTTPS: Caddy + Let's Encrypt на `expers.ru`, авто-продление сертификата
- CI/CD: GitHub Actions → авто-деплой на сервер 185.65.200.190 (git pull → migrate → restart → reload caddy)
- Concurrency control в workflows, обработка конфликтов портов

### Роли и публикация

- Регистрация без выбора роли — все могут публиковать
- Кнопка «Я автор» доступна всем, платёж — гейт (5 000 ₽)
- Страница автора (12-шаговый GEO-визард, Schema.org) доступна после первой оплаты
- Ролевой гейт в мастере публикации убран

### Юридический пакет (Т-Банк)

- **`/offer`** — публичная оферта: продажа права публикации (опционный договор, АУСН). Сделка = оплата. Право бессрочно. Возврат — 10 календарных дней при неиспользовании.
- **`/privacy`** — политика ПД (152-ФЗ, ст. 6)
- **`/refund`** — условия возврата, пояснение «покупается право, а не публикация»
- **`/contacts`** — реквизиты ООО «ФОНИИ» (ИНН 7720943604), телефон +7 (495) 324-30-88, режим пн–пт 10:00–18:00 МСК
- **Футер**: ссылки на оферту/политику/возврат/контакты, ИНН/ОГРН, логотипы МИР/Visa/MC/Т-Банк
- **Регистрация**: обязательный чекбокс согласия на ПД + оферта

### Страницы

- **`/about`** — «О каталоге»: GEO, путь статьи в AI-ответ, сравнение платформ, 4 элемента GEO, таймлайн, CTA
- **`/services`** — читателю бесплатно (0 ₽ навсегда), автору — право публикации 5 000 ₽, блок «Скоро» (3 карточки)
- **`/contacts`** — информация об ООО «ФОНИИ», направления, принцип, реквизиты

### UI/UX

- Загрузка аватара в профиле (файловый API `POST /api/upload/avatar` + URL)
- Колокольчики подписки серые для гостей, «Подписки доступны после входа» при клике; активируются после входа
- Управление подписками: табы Авторы/Разделы, поиск, подписка/отписка в дереве каталога (3 уровня)
- Кабинет: сайдбар справа (Платежи/Профиль/Страница автора) с left-border активным индикатором
- Таб-бар «Я автор» на всю ширину (Дашборд · Статьи · Комментарии · Подписчики · Аналитика)
- График просмотров с фильтром 7д/30д/90д/6м/12м, агрегация по дням/неделям/месяцам
- Кросс-ссылки: минимум снижен с 5 до 2
- Кнопка «Забыли пароль?» → двухшаговый диалог — email → код + новый пароль

### Инфраструктура

- Миграция: `ALTER TABLE ADD COLUMN` для новых полей experts
- Таблица `password_resets` для восстановления пароля
- `public/payments/*.svg` — логотипы платёжных систем (заглушки, требуют замены на официальные)

---

## План: Кабинет администратора (следующая сессия)

### Итерация 1. Модель и доступ (1 ч)

- `lib/admin.ts` — `isAdmin()`, `verifyAdmin()` middleware
- Назначение админа: `UPDATE experts SET role = 'admin' WHERE email = 'info@expers.ru'`
- API-защита: все `/api/admin/*` проверяют `payload.role === "admin"`

### Итерация 2. Дашборд админа `/admin` (2 ч)

- 6 карточек: Всего статей · На модерации · Опубликовано сегодня · Экспертов · Платящих · Выручка за месяц
- 2 графика SVG: публикации по дням (30д), выручка по месяцам
- Таблица «Последние 10 статей»

### Итерация 3. Аналитика статей `/admin/articles` (3 ч)

- Таблица всех статей, фильтры (статус/отрасль/автор/дата), сортировка, пагинация по 20
- График публикаций по дням, топ-10 по просмотрам
- Экспорт CSV

### Итерация 4. Аналитика экспертов `/admin/experts` (2 ч)

- Таблица: имя, email, роль, статей, платящий, дата регистрации, активность
- График: регистрации по месяцам, конверсия в платящих

### Итерация 5. Аналитика комментариев `/admin/comments` (2 ч)

- Таблица всех комментариев, поиск по тексту, удаление (AJAX)
- Статистика правок

### Итерация 6. Модерация статей `/admin/moderation` (3 ч)

- Очередь pending_review, карточки статей с полным текстом (раскрытие)
- «Одобрить» → published, «Отклонить» → модалка с причиной + комментарий
- Оптимистичный UI (карточка исчезает без перезагрузки)
- Бейдж-счётчик «На модерации: N» в сайдбаре

### Итерация 7. Навигация `/admin/layout.tsx` (1 ч)

- Сайдбар: Дашборд · Статьи · Эксперты · Комментарии · Модерация
- Бейдж на «Модерация», кнопка «На сайт» в шапке
- Кнопка «Администрирование» в хедере рядом с «Мой кабинет»

### Итерация 8. Тесты и проверка (2 ч)

- vitest для админ-моделей и API
- playwright smoke test `/admin/*`

**Итого: ~16 часов**

---

## API-эндпоинты для реализации

| Маршрут                         | Метод        | Назначение                                           |
| ------------------------------- | ------------ | ---------------------------------------------------- |
| `/api/admin/dashboard`          | GET          | Агрегация метрик для дашборда                        |
| `/api/admin/articles`           | GET          | Список статей с фильтрацией, сортировкой, пагинацией |
| `/api/admin/articles/stats`     | GET          | График публикаций по дням                            |
| `/api/admin/experts`            | GET          | Список экспертов                                     |
| `/api/admin/experts/stats`      | GET          | Регистрации по месяцам, конверсия                    |
| `/api/admin/comments`           | GET + DELETE | Список и удаление комментариев                       |
| `/api/admin/moderation/queue`   | GET          | Статьи со статусом pending_review                    |
| `/api/admin/moderation/approve` | POST         | Одобрить статью                                      |
| `/api/admin/moderation/reject`  | POST         | Отклонить статью (reason + comment)                  |

---

## Файлы для создания/изменения

| Файл                                                       | Итерация |
| ---------------------------------------------------------- | -------- |
| `lib/admin.ts`                                             | 1        |
| `app/admin/layout.tsx`                                     | 7        |
| `app/admin/page.tsx`                                       | 2        |
| `app/admin/articles/page.tsx`                              | 3        |
| `app/admin/experts/page.tsx`                               | 4        |
| `app/admin/comments/page.tsx`                              | 5        |
| `app/admin/moderation/page.tsx`                            | 6        |
| `app/api/admin/dashboard/route.ts`                         | 2        |
| `app/api/admin/articles/route.ts` + `/stats/route.ts`      | 3        |
| `app/api/admin/experts/route.ts` + `/stats/route.ts`       | 4        |
| `app/api/admin/comments/route.ts`                          | 5        |
| `app/api/admin/moderation/queue/route.ts`                  | 6        |
| `app/api/admin/moderation/approve/route.ts`                | 6        |
| `app/api/admin/moderation/reject/route.ts`                 | 6        |
| `components/admin-dashboard.tsx`                           | 2        |
| `components/admin-articles.tsx`                            | 3        |
| `components/admin-experts.tsx`                             | 4        |
| `components/admin-comments.tsx`                            | 5        |
| `components/admin-moderation.tsx`                          | 6        |
| `components/auth-buttons.tsx` (кнопка «Администрирование») | 7        |

---

## Ключевые константы

- **Админ:** `info@expers.ru`, роль `admin`, не сменяема через UI
- **Продавец:** ООО «ФОНИИ», ИНН 7720943604, ОГРН 1257700013141
- **Сервер:** `185.65.200.190`, Debian 13, Docker Compose, Caddy
- **Деплой:** GitHub Actions → SSH → `docker compose up -d --build app`
- **Порт:** 8080, прокси через Caddy :80/:443
- **Цена публикации:** 5 000 ₽ (АУСН, НДС не облагается)

---

## Выполнено: Кабинет администратора (18 июля 2026)

### Реализованные файлы

| Файл                                                                | Назначение                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `lib/admin.ts`                                                      | `isAdmin()`, `verifyAdmin()` — middleware проверки роли admin                                |
| `lib/models.ts`                                                     | Расширен тип `role` → `"admin"`, добавлены 20+ admin-функций (агрегации, фильтры, модерация) |
| `lib/auth.ts`                                                       | Тип `verifyToken` расширен до `"admin"`                                                      |
| `lib/auth-context.tsx`                                              | Тип `role` расширен до `"admin"`                                                             |
| `lib/mock-data.ts`                                                  | Добавлены mock-данные для статического fallback админки                                      |
| `app/admin/layout.tsx`                                              | Сайдбар (Дашборд/Статьи/Эксперты/Комментарии/Модерация) + «На сайт»                          |
| `app/admin/page.tsx` + `components/admin-dashboard.tsx`             | 6 карточек метрик, 2 SVG-графика, таблица последних 10 статей                                |
| `app/admin/articles/page.tsx` + `components/admin-articles.tsx`     | Таблица с фильтрами/сортировкой/пагинацией, график публикаций, экспорт CSV                   |
| `app/admin/experts/page.tsx` + `components/admin-experts.tsx`       | Таблица экспертов, SVG-график регистраций по месяцам, конверсия                              |
| `app/admin/comments/page.tsx` + `components/admin-comments.tsx`     | Таблица с поиском, пагинация, удаление AJAX                                                  |
| `app/admin/moderation/page.tsx` + `components/admin-moderation.tsx` | Очередь pending_review, одобрение/отклонение, оптимистичный UI                               |
| `components/auth-buttons.tsx`                                       | Кнопка «Администрирование» (Shield) в хедере для admin                                       |
| `components/author-articles.tsx`                                    | Добавлен статус `pending_review`                                                             |
| `components/ui/skeleton.tsx`, `components/ui/textarea.tsx`          | Добавлены через shadcn                                                                       |

### API-эндпоинты

| Маршрут                         | Метод        | Статус |
| ------------------------------- | ------------ | ------ |
| `/api/admin/dashboard`          | GET          | ✓      |
| `/api/admin/articles`           | GET          | ✓      |
| `/api/admin/articles/stats`     | GET          | ✓      |
| `/api/admin/experts`            | GET          | ✓      |
| `/api/admin/experts/stats`      | GET          | ✓      |
| `/api/admin/comments`           | GET + DELETE | ✓      |
| `/api/admin/moderation/queue`   | GET          | ✓      |
| `/api/admin/moderation/approve` | POST         | ✓      |
| `/api/admin/moderation/reject`  | POST         | ✓      |

### Проверка

- `npm run typecheck` — 0 errors
- `npm run lint` — 0 errors, 7 pre-existing warnings
- `npm run build` — успешно, все страницы/admin и API-роуты скомпилированы
- `docker compose exec app npm run db:migrate` — миграции пройдены
- Smoke test `http://localhost:8080/admin/*` — страницы загружаются, не-админ редиректится на `/`

### Следующие шаги

После первого деплоя назначить админа через SQL:

```sql
UPDATE experts SET role = 'admin' WHERE email = 'info@expers.ru';
```
