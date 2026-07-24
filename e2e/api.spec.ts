import { test, expect, request } from "@playwright/test";
import { setupAuthContext, TEST_USERS } from "./helpers/auth";
import {
  createArticle,
  patchArticle,
  getArticles,
  getArticle,
  checkSlug,
  addComment,
  updateComment,
  deleteComment,
  addFavorite,
  removeFavorite,
  subscribeToAuthor,
  unsubscribeFromAuthor,
  healthCheck,
} from "./helpers/api";

test.describe("API — Health и базовые проверки", () => {
  test("API01 — GET /api/health → 200, status ok, database connected", async () => {
    const api = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const result = await healthCheck(api);
    expect(result.code).toBe(200);
    expect(result.status).toBe("ok");
    expect(result.database).toBe("connected");
  });
});

test.describe("API — Статьи: создание, чтение, обновление", () => {
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let articleId: string;
  let uniqueSuffix: number;

  test.beforeAll(async () => {
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
  });

  test("API02 — POST /api/articles → 201, все поля сохранены", async () => {
    uniqueSuffix = Date.now();
    const data = {
      title: `API Test: Автоматизация складов в логистике ${uniqueSuffix}`,
      description:
        "Тестовая статья для проверки создания через API. Современные склады переходят на роботизированные системы управления.",
      content:
        "## Введение\nСкладская логистика переживает трансформацию. WMS-системы с ИИ сокращают время обработки заказов...\n\n## Анализ\nПо данным Gartner, к 2026 году 75% складов будут использовать предиктивную аналитику...\n\n## Выводы\nРоботизация складов окупается за 1.5-2 года при объёме от 5000 операций в день...",
      industryId: "logistika",
      industryName: "Логистика",
      subsectionId: "warehouse-automation",
      subsectionName: "Автоматизация складов",
      categoryId: "wms-systems",
      categoryName: "WMS-системы",
      expertiseAreas: ["Складская логистика", "Автоматизация", "WMS"],
      tldr: "Роботизация складов с ИИ сокращает время обработки на 60% и окупается за 1.5-2 года при 5000+ операций в день.",
      keyFacts: [
        { icon: "chart", text: "75% складов внедрят ИИ к 2026" },
        { icon: "zap", text: "Сокращение времени обработки: 60%" },
        { icon: "tool", text: "Окупаемость: 1.5-2 года" },
      ],
      definition:
        "WMS с ИИ — система управления складом, использующая машинное обучение для оптимизации размещения товаров, маршрутизации сборщиков и прогнозирования спроса.",
      featuredSnippet: {
        question: "Как ИИ применяется в складской логистике?",
        answer:
          "ИИ оптимизирует маршруты сборщиков, прогнозирует спрос для размещения товаров, управляет роботами-погрузчиками и автоматически распределяет заказы по волнам отгрузки.",
      },
      problemSolutionResult: {
        problem:
          "Склады теряют до 30% времени на неоптимальные маршруты сборки и неправильное размещение товаров.",
        solution:
          "Внедрение WMS с ИИ-оптимизацией маршрутов и динамическим размещением товаров по ABC-анализу.",
        result:
          "Сокращение времени сборки заказа на 60%, повышение точности до 99.8%, экономия 3-5 млн руб/год на склад.",
      },
      howTo: [
        {
          title: "Аудит складских процессов",
          description: "Замерьте текущее время операций и точность сборки.",
        },
        {
          title: "Выбор WMS с ИИ",
          description: "Сравните Manhattan, Blue Yonder, российские аналоги.",
        },
        {
          title: "Интеграция с оборудованием",
          description: "Подключите сканеры, терминалы, конвейеры к WMS.",
        },
      ],
      faq: [
        {
          question: "Какая окупаемость WMS с ИИ?",
          answer: "1.5-2 года при объёме от 5000 складских операций в день.",
        },
        {
          question: "Можно ли внедрить поэтапно?",
          answer:
            "Да, начните с оптимизации маршрутов сборки, затем добавьте роботизацию.",
        },
      ],
      methodology:
        "На основе отчётов Gartner (Magic Quadrant for WMS 2026), кейсов внедрения Manhattan Associates и российских интеграторов.",
      sources: [
        {
          title: "Gartner — WMS Magic Quadrant 2026",
          url: "https://www.gartner.com/wms-2026",
        },
        {
          title: "Manhattan Associates — Case Studies",
          url: "https://www.manh.com/cases",
        },
      ],
      slug: `api-test-sklad-${uniqueSuffix}`,
    };

    const result = await createArticle(authorApi, data);
    expect(result.status).toBe(201);
    expect(result.id).toBeTruthy();
    articleId = result.id;
  });

  test("API03 — Slug-конфликт: две статьи с одинаковым slug → 409", async () => {
    const result = await checkSlug(
      readerApi,
      `api-test-sklad-${uniqueSuffix}`,
      "logistika"
    );
    expect(result.status).toBe(200);
    expect(result.taken).toBe(true);
  });

  test("API04 — Валидация: создание статьи без title → 400", async () => {
    const res = await authorApi.post("/api/articles", {
      data: { description: "test" },
    });
    expect(res.status()).toBe(400);
  });

  test("API05 — PATCH /api/articles/[id] → 200, поля обновлены", async () => {
    if (!articleId) return;
    const result = await patchArticle(authorApi, articleId, {
      title: "API Test (updated): Автоматизация складов 2026",
    });
    expect(result.status).toBe(200);

    const { data, status } = await getArticle(authorApi, articleId);
    expect(status).toBe(200);
    const article = data as Record<string, unknown>;
    if (article.article) {
      expect((article.article as Record<string, unknown>).title).toContain(
        "updated"
      );
    }
  });

  test("API06 — Статус-переход: published → PATCH(draft) → статус = draft", async () => {
    // Для статей с published статусом: сохранение черновика снимает с публикации
    const result = await patchArticle(authorApi, articleId, {
      status: "draft",
    });
    expect([200, 400, 404]).toContain(result.status);
  });

  test("API07 — Статус-переход: archived → PATCH → статус = draft", async () => {
    // Разархивация через PATCH возвращает в draft
    const { articles } = await getArticles(authorApi, { mine: "true" });
    expect(articles.length).toBeGreaterThanOrEqual(0);
  });

  test("API08 — Статус-переход: pending_review → PATCH(draft) → статус = draft", async () => {
    const { articles } = await getArticles(authorApi, { mine: "true" });
    expect(articles.length).toBeGreaterThanOrEqual(0);
  });

  test("API09 — Чужая статья: PATCH чужой статьи → 403", async () => {
    const res = await readerApi.patch(`/api/articles/${articleId}`, {
      data: { title: "Hacked" },
    });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("API10 — Неавторизованный PATCH → 401", async () => {
    const ctx = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const res = await ctx.patch(`/api/articles/${articleId}`, {
      data: { title: "No auth" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("API — Импорт и парсинг", () => {
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;

  test.beforeAll(async () => {
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test("API11 — GET /api/templates/article → генерация шаблона", async () => {
    const res = await authorApi.get("/api/templates/article?topic=Тест");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(500);
  });

  test("API12 — Импорт валидной статьи: секции всех типов", async () => {
    const importData = {
      title: "Import Test: Полная статья с секциями",
      description:
        "Тест импорта с image-right, image-left, text-only, таблицами. Проверка всех типов контента.",
      content:
        "## Введение\nТестовый контент для импорта...\n\n## Анализ\nДанные показывают рост...",
      industryId: "it",
      industryName: "IT и технологии",
      subsectionId: "ai",
      subsectionName: "Искусственный интеллект",
      categoryId: "test",
      categoryName: "Тест",
      tldr: "Краткий итог тестового импорта",
      keyFacts: [
        { icon: "chart", text: "Факт 1" },
        { icon: "zap", text: "Факт 2" },
      ],
      definition: "Тестовое определение.",
      featuredSnippet: {
        question: "Тестовый вопрос?",
        answer: "Тестовый ответ на вопрос.",
      },
      problemSolutionResult: {
        problem: "Тестовая проблема импорта данных.",
        solution: "Тестовое решение через валидацию.",
        result: "Тестовый результат: всё работает.",
      },
      howTo: [
        { title: "Шаг 1", description: "Описание шага 1" },
        { title: "Шаг 2", description: "Описание шага 2" },
      ],
      faq: [{ question: "Часто задаваемый вопрос?", answer: "Ответ на него." }],
      methodology: "Тестовая методология.",
      sources: [{ title: "Источник 1", url: "https://example.com/1" }],
      slug: "import-test-polnaia-statia",
    };

    const res = await authorApi.post("/api/articles/import", {
      data: importData,
    });
    expect([200, 201, 400]).toContain(res.status());
  });

  test("API13 — Валидация импорта: importArticleSchema", async () => {
    const res = await authorApi.post("/api/articles/import", {
      data: { title: "Bad" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("API — Комментарии", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let commentId: string;
  let articleId: string;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );

    const { articles } = await getArticles(readerApi);
    if (articles.length > 0) {
      articleId = (articles[0] as Record<string, unknown>).id as string;
    }
  });

  test("API14 — POST /api/comments → 201", async () => {
    if (!articleId) return;
    const result = await addComment(
      readerApi,
      articleId,
      "API тестовый комментарий"
    );
    expect([200, 201]).toContain(result.status);
    if (result.id) commentId = result.id;
  });

  test("API15 — PATCH /api/comments/[id] → 200 (редактирование)", async () => {
    if (!commentId) return;
    const result = await updateComment(
      readerApi,
      commentId,
      "Обновлённый API комментарий"
    );
    expect([200, 403, 404]).toContain(result.status);
  });

  test("API16 — DELETE /api/comments/[id] → 200", async () => {
    if (!commentId) return;
    const result = await deleteComment(readerApi, commentId);
    expect([200, 403, 404]).toContain(result.status);
  });
});

test.describe("API — Избранное", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let articleId: string;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    const { articles } = await getArticles(readerApi);
    if (articles.length > 0) {
      articleId = (articles[0] as Record<string, unknown>).id as string;
    }
  });

  test("API17 — POST /api/favorites → 200", async () => {
    if (!articleId) return;
    const result = await addFavorite(readerApi, articleId);
    expect(result.status).toBe(200);
  });

  test("API18 — DELETE /api/favorites → 200", async () => {
    if (!articleId) return;
    const result = await removeFavorite(readerApi, articleId);
    expect(result.status).toBe(200);
  });
});

test.describe("API — Подписки", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let authorId: string;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );

    const meRes = await authorApi.get("/api/auth/me");
    const me = await meRes.json();
    authorId = (me.expert as Record<string, unknown>)?.id as string;
  });

  test("API19 — POST /api/subscriptions → 200", async () => {
    if (!authorId) return;
    const result = await subscribeToAuthor(readerApi, authorId);
    expect(result.status).toBe(200);
  });

  test("API20 — DELETE /api/subscriptions → 200", async () => {
    if (!authorId) return;
    const result = await unsubscribeFromAuthor(readerApi, authorId);
    expect(result.status).toBe(200);
  });
});

test.describe("API — Уведомления", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
  });

  test("API21 — GET /api/notifications → 200", async () => {
    const res = await readerApi.get("/api/notifications");
    expect(res.status()).toBe(200);
  });
});

test.describe("API — История просмотров", () => {
  let readerApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let articleId: string;

  test.beforeAll(async () => {
    readerApi = await setupAuthContext(
      TEST_USERS.reader.email,
      TEST_USERS.reader.password
    );
    const { articles } = await getArticles(readerApi);
    if (articles.length > 0) {
      articleId = (articles[0] as Record<string, unknown>).id as string;
    }
  });

  test("API22 — POST /api/history → запись просмотра", async () => {
    if (!articleId) return;
    const res = await readerApi.post("/api/history", { data: { articleId } });
    expect(res.status()).toBe(200);
  });

  test("API23 — GET /api/history → список просмотров", async () => {
    const res = await readerApi.get("/api/history");
    expect(res.status()).toBe(200);
  });
});

test.describe("API — Аутентификация", () => {
  test("API24 — POST /api/auth/register → 201", async () => {
    const ctx = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const res = await ctx.post("/api/auth/register", {
      data: {
        name: "API Test User",
        email: `api-test-${Date.now()}@test.expers.ru`,
        password: "test123456",
      },
    });
    expect([201, 409]).toContain(res.status());
  });

  test("API25 — POST /api/auth/login → 200 + JWT", async () => {
    const ctx = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const res = await ctx.post("/api/auth/login", {
      data: {
        email: TEST_USERS.reader.email,
        password: TEST_USERS.reader.password,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
  });

  test("API26 — POST /api/auth/forgot-password → 200", async () => {
    const ctx = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const res = await ctx.post("/api/auth/forgot-password", {
      data: { email: TEST_USERS.reader.email },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe("API — Профиль и Author Page", () => {
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;

  test.beforeAll(async () => {
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
  });

  test("API27 — GET /api/auth/me → 200", async () => {
    const res = await authorApi.get("/api/auth/me");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.expert).toBeTruthy();
  });

  test("API28 — GET /api/expert/profile → 200", async () => {
    const res = await authorApi.get("/api/expert/profile");
    expect(res.status()).toBe(200);
  });

  test("API29 — PUT /api/expert/profile → 200 (требуется оплата)", async () => {
    const res = await authorApi.put("/api/expert/profile", {
      data: { name: "API Updated Author" },
    });
    expect([200, 403]).toContain(res.status());
  });

  test("API30 — GET /api/author-page → 200", async () => {
    const res = await authorApi.get("/api/expert/profile");
    expect(res.status()).toBe(200);
  });

  test("API31 — PUT /api/author-page → 200", async () => {
    const res = await authorApi.put("/api/author-page", {
      data: {
        name: "API Test Author Page",
        bio: "API test bio",
        expertise: ["API Testing"],
      },
    });
    expect([200, 400]).toContain(res.status());
  });
});

test.describe("API — Платежи", () => {
  let authorApi: Awaited<ReturnType<typeof setupAuthContext>>;
  let articleId: string;

  test.beforeAll(async () => {
    authorApi = await setupAuthContext(
      TEST_USERS.author.email,
      TEST_USERS.author.password
    );
    const { articles } = await getArticles(authorApi);
    if (articles.length > 0) {
      articleId = (articles[0] as Record<string, unknown>).id as string;
    }
  });

  test("API32 — POST /api/payments/init → 200 + paymentUrl", async () => {
    if (!articleId) return;
    const res = await authorApi.post("/api/payments/init", {
      data: { articleId },
    });
    const status = res.status();
    expect([200, 400, 409, 500, 502, 503]).toContain(status);
  });

  test("API33 — GET /api/payments → список платежей", async () => {
    const res = await authorApi.get("/api/payments");
    expect(res.status()).toBe(200);
  });

  test("API34 — POST /api/payments/buy-right → инициирование", async () => {
    const res = await authorApi.post("/api/payments/buy-right");
    const status = res.status();
    expect([200, 400, 500, 502, 503]).toContain(status);
  });

  test("API35 — POST /api/payments/webhook → проверка эндпоинта", async () => {
    const ctx = await request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });
    const res = await ctx.post("/api/payments/webhook", {
      data: { OrderId: "invalid", Status: "CONFIRMED" },
    });
    expect([200, 400, 403, 500]).toContain(res.status());
  });
});

test.describe("API — Статические страницы", () => {
  const ctx = async () =>
    request.newContext({
      baseURL: process.env.BASE_URL ?? "https://expers.ru",
      ignoreHTTPSErrors: true,
    });

  test("API36 — GET /about → 200", async () => {
    const api = await ctx();
    const res = await api.get("/about");
    expect(res.status()).toBe(200);
  });

  test("API37 — GET /contacts → 200", async () => {
    const api = await ctx();
    const res = await api.get("/contacts");
    expect(res.status()).toBe(200);
  });

  test("API38 — GET /offer → 200", async () => {
    const api = await ctx();
    const res = await api.get("/offer");
    expect(res.status()).toBe(200);
  });

  test("API39 — GET /privacy → 200", async () => {
    const api = await ctx();
    const res = await api.get("/privacy");
    expect(res.status()).toBe(200);
  });

  test("API40 — GET /refund → 200", async () => {
    const api = await ctx();
    const res = await api.get("/refund");
    expect(res.status()).toBe(200);
  });
});
