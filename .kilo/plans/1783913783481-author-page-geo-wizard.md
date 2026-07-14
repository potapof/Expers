# Plan: Упрощение ролей + Страница автора с GEO-оптимизацией

## Цель

1. Убрать выбор роли при регистрации — любой пользователь может быть и читателем, и автором
2. Вкладка «Я автор» всегда доступна всем
3. Раздел «Страница автора» заблокирован серым до первой оплаченной публикации
4. 12-шаговый визард создания GEO-оптимизированной страницы автора

---

## Шаг 1. Регистрация — убрать выбор роли

### `components/auth-buttons.tsx`

- Удалить чекбокс «Я эксперт — хочу публиковать статьи» из `RegisterDialog` (строки 303-317)
- Убрать `isExpert`, `onIsExpertChange` пропсы
- При вызове `register()` передавать `role: "reader"` (все регистрируются как reader, это не влияет на функциональность)

### `app/api/auth/register/route.ts`

- Убрать `role` из `registerSchema` (оставить `name`, `email`, `password`)
- ID генерировать как `user-{uuid}` вместо `{role}-{uuid}`
- Роль по умолчанию — `"reader"` (сохраняется в БД)

### `scripts/migrate.ts`

- Без изменений (таблица experts не меняется структурно)

---

## Шаг 2. Платёж — убрать проверку роли

### `app/api/payments/init/route.ts`

- Удалить строки 30-35 (проверка `payload.role !== "expert"` → 403)
- Публиковать статьи может любой зарегистрированный пользователь

---

## Шаг 3. Кабинет — «Я автор» всегда доступен

### `components/cabinet-client.tsx`

- Убрать `canUseExpert`, `isExpert` логику
- `effectiveMode` = просто `mode` (без проверки роли)
- Вкладка «Я автор» всегда кликабельна

### `lib/auth-context.tsx`

- Убрать `role` из интерфейса `Expert` (или оставить как информационное поле, не влияющее на логику)

---

## Шаг 4. «Страница автора» — серый лок с подсказкой

### `components/cabinet-client.tsx` (author view)

- Добавить новый пункт в author-навигацию: **«Страница автора»**
- Если `!expert.hasPaid`: кнопка серая (`text-gray-300 cursor-not-allowed`), справа иконка `HelpCircle` с tooltip: «Страница автора доступна после публикации первой статьи»
- Если `expert.hasPaid`: кнопка активна, открывает `AuthorPageWizard`

### UI-элемент с tooltip'ом:

```tsx
<button disabled className="...">
  <Globe className="h-4 w-4" /> Страница автора
  <HelpCircle
    className="h-3.5 w-3.5 ml-1 text-gray-400"
    title="Страница автора доступна после публикации первой статьи"
  />
</button>
```

---

## Шаг 5. Схема БД — расширить `experts`

### `lib/schema.ts`

Добавить поля в таблицу `experts` (все TEXT/JSON, опциональные):

```ts
workExperience: text("work_experience"),       // JSON: [{company, position, startDate, endDate, description}]
publications: text("publications"),            // JSON: [{title, url, date, description}]
achievements: text("achievements"),            // JSON: [{title, date, description}]
mediaMentions: text("media_mentions"),        // JSON: [{outlet, title, url, date}]
faq: text("faq"),                             // JSON: [{question, answer}]
testimonials: text("testimonials"),           // JSON: [{name, role, text, avatar}]
callToAction: text("call_to_action"),         // TEXT: "Запишитесь на консультацию"
authorPageSlug: text("author_page_slug"),     // TEXT: уникальный слаг для публичного URL
```

### `lib/models.ts`

- Добавить типы для новых полей в интерфейс `Expert`
- Добавить CRUD: `createAuthorPage`, `getAuthorPageBySlug`, `updateAuthorPage`
- Обновить `rowToExpert` для десериализации новых JSON-полей

### `scripts/migrate.ts`

- Добавить `ALTER TABLE experts ADD COLUMN ...` (SQLite — через CREATE TABLE IF NOT EXISTS пересоздание или ALTER)

### `lib/mock-data.ts`

- Добавить мок-данные для авторов с заполненными страницами

---

## Шаг 6. 12-шаговый визард страницы автора

### `components/author-page-wizard.tsx`

Структура — как `article-wizard-client.tsx` (multi-step, сайдбар, валидация, предпросмотр).

### Шаги (GEO-оптимизированный список):

1. **Имя, фото, bio**
   - Поля: name, avatar (загрузка), bio (textarea, до 2000 символов)
   - GEO: name + bio формируют Schema.org Person

2. **Образование и сертификаты**
   - Поля: credentials[] (динамический список: название, организация, год)
   - GEO: `EducationalOccupationalCredential` в Schema.org

3. **Области экспертизы**
   - Поля: expertise[] (динамический список: область, описание, уровень)
   - GEO: `knowsAbout` + `DefinedTerm` в Schema.org

4. **Опыт работы**
   - Поля: workExperience[] (компания, должность, даты начала/конца, описание)
   - GEO: `workLocation`, `alumniOf` в Schema.org

5. **Публикации и исследования**
   - Поля: publications[] (название, ссылка, дата, описание)
   - GEO: `citation` в Schema.org, внешние ссылки на авторитетные источники

6. **Достижения и награды**
   - Поля: achievements[] (название, дата, описание)
   - GEO: `award` в Schema.org

7. **Медиа-упоминания**
   - Поля: mediaMentions[] (издание, заголовок, ссылка, дата)
   - GEO: `mentions` в Schema.org, внешние ссылки

8. **Социальные сети и контакты**
   - Поля: socialLinks[] (платформа, ссылка), email (readonly из профиля)
   - GEO: `sameAs` в Schema.org

9. **FAQ — часто задаваемые вопросы**
   - Поля: faq[] (вопрос, ответ)
   - GEO: `FAQPage` + `Question`/`Answer` в Schema.org — критично для AI-поисковиков

10. **Отзывы и кейсы**
    - Поля: testimonials[] (имя, роль, текст, аватар)
    - GEO: `Review` в Schema.org, social proof для AI-ранжирования

11. **Призыв к действию (CTA)**
    - Поле: callToAction (текст, например «Запишитесь на консультацию»)
    - GEO: явный CTA улучшает click-through в AI-сниппетах

12. **Предпросмотр + Schema.org**
    - Показ готовой страницы в iframe/preview
    - Авто-генерация JSON-LD разметки из всех заполненных полей
    - Кнопка «Опубликовать страницу» → сохраняет в БД, генерирует слаг

### GEO-фичи визарда:

- Каждый шаг содержит пояснение «Почему это важно для поиска» (tooltip/alert)
- Валидация: минимум 3 области экспертизы, минимум 2 публикации для публикации
- Предпросмотр показывает, как страница будет выглядеть в Google SGE / AI-сниппете
- После публикации — ссылка на `/author/[slug]`

---

## Шаг 7. Публичная страница автора

### `app/author/[slug]/page.tsx`

- Server Component, загружает данные через `getAuthorPageBySlug`
- Генерирует полный JSON-LD `Person` + `FAQPage` schema
- Рендерит все 11 секций (шаги 1-11)
- `generateStaticParams` для SSG (если есть)
- Open Graph мета-теги для соцсетей

### `components/author-page-public.tsx`

- Клиентский компонент для интерактивных элементов (share, subscribe)
- Рендерит красивую публичную страницу эксперта

### GEO-оптимизация публичной страницы:

- Чёткая иерархия заголовков (h1 → h2 → h3)
- Каждый раздел обёрнут в `<section>` с `aria-label`
- FAQ в формате вопрос-ответ (оптимально для AI-сниппетов)
- Все ссылки — абсолютные, с `rel="author"` для соцсетей
- Внутренняя перелинковка на статьи автора из раздела «Публикации»

---

## Шаг 8. Маршрутизация и ссылки

### В хедере, для авторов с hasPaid:

- Заменить/добавить кнопку «Моя страница» → `/author/[slug]`

### В кабинете:

- После создания страницы — показывать ссылку «Моя публичная страница» с иконкой `ExternalLink`

---

## Файлы для изменения / создания

| Файл                                | Действие                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `components/auth-buttons.tsx`       | Удалить чекбокс роли в RegisterDialog                          |
| `app/api/auth/register/route.ts`    | Убрать `role` из схемы                                         |
| `app/api/payments/init/route.ts`    | Удалить проверку `role !== "expert"`                           |
| `components/cabinet-client.tsx`     | Убрать `canUseExpert`, добавить серую кнопку «Страница автора» |
| `lib/auth-context.tsx`              | Упростить `Expert` интерфейс                                   |
| `lib/schema.ts`                     | Добавить новые поля в `experts`                                |
| `lib/models.ts`                     | Типы + CRUD для новых полей                                    |
| `scripts/migrate.ts`                | ALTER TABLE для новых колонок                                  |
| `lib/mock-data.ts`                  | Мок-авторы с заполненными страницами                           |
| `components/author-page-wizard.tsx` | **Новый** — 12-шаговый визард                                  |
| `components/author-page-public.tsx` | **Новый** — публичная страница                                 |
| `app/author/[slug]/page.tsx`        | **Новый** — роут публичной страницы                            |
| `lib/validation.ts`                 | **Новый файл или дополнение** — схемы валидации шагов визарда  |

---

## Порядок выполнения

1. Схема БД + миграция + models (шар 5)
2. Регистрация без роли (шаг 1)
3. Платёж без проверки роли (шаг 2)
4. Кабинет — «Я автор» всегда доступен (шаг 3)

Далее (запуск `db:migrate` + `typecheck` + `lint`): 5. Серый лок «Страница автора» (шаг 4) 6. Валидация (схемы zod для 12 шагов) 7. 12-шаговый визард (шаг 6) — самая большая часть 8. Публичная страница + роут (шаг 7) 9. Ссылки в хедере и кабинете (шаг 8)

Финально: `db:migrate` → `typecheck` → `lint` → `format` → `build` → smoke test.
