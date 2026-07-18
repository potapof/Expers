# План: Настройка приёма платежей Т-Банка (iframe, DEMO-терминал)

## Цель

Подключить реальный приём платежей Т-Банк Эквайринг на тестовом DEMO-терминале с показом платёжной формы в iframe на сайте (без ухода пользователя). Оплата права публикации — 5 000 ₽.

## Данные терминала (тестовый)

- `TBANK_TERMINAL_KEY` = `1784384439761DEMO`
- `TBANK_PASSWORD` = `mhG42$b%mV1JnzY6`
- API URL: `https://securepay.tinkoff.ru/v2` (DEMO-терминалы работают против боевого URL, списаний нет; тестовая среда `rest-api-test.tinkoff.ru` с白 списком IP НЕ нужна)

## Текущее состояние (не переделывать с нуля)

- `lib/tbank.ts` — `initPayment()` (POST /v2/Init), `buildToken()` (SHA-256, поля+Password, сортировка), `verifyNotificationToken()`. Есть заглушка `TBANK_TEST_MODE=true` (фейковый URL, Т-Банк не вызывается).
- `app/api/payments/init/route.ts` — auth → Init → `createPayment(status: NEW)` → возвращает `paymentUrl`, `orderId`.
- `app/api/payments/webhook/route.ts` — верификация токена; `CONFIRMED` → статья `pending_review` (модерация); `REFUNDED` → `archived`.
- `components/article-wizard-client.tsx` `handlePublish()` — если статья `pending_review` (право уже оплачено) → кабинет; иначе → `/api/payments/init` → **редирект** на `paymentUrl` (заменяем на iframe).
- Кабинет: таб «Платежи» (`components/author-finance.tsx`, `GET /api/payments`).
- `.env.docker` отслеживается git; сейчас `TBANK_TEST_MODE=true`, ключи-заглушки.

## Решения

1. **Форма — iframe** через `integration.js` (подтверждено пользователем). Редирект на `PaymentURL` остаётся fallback, если скрипт не загрузился/упал init виджета.
2. **Подтверждение статуса — двухканальное**: webhook (прод, `https://expers.ru/api/payments/webhook`) + опрос `GetState` (dev-необходимость: вебхук до localhost не доходит; на проде — страховка).
3. **DEMO-ключи кладём в `.env.docker`** (терминал тестовый, списаний нет). Боевые ключи — только в env на сервере (уже описано в `.env.example`). `TerminalKey` не секрет — можно в `NEXT_PUBLIC_*`.
4. Фискализация (Receipt/чеки) — вне объёма этой итерации.

## Задачи

### 1. Конфигурация окружения

- `.env.docker`: `TBANK_TEST_MODE=false`, `TBANK_TERMINAL_KEY=1784384439761DEMO`, `TBANK_PASSWORD=mhG42$b%mV1JnzY6`, `TBANK_API_URL=https://securepay.tinkoff.ru/v2`, добавить `NEXT_PUBLIC_TBANK_TERMINAL_KEY=1784384439761DEMO`.
- `.env.example`: дописать `NEXT_PUBLIC_TBANK_TERMINAL_KEY` и комментарий про DEMO-терминал.
- Перезапуск: `docker compose up -d --force-recreate app`.

### 2. Бэкенд: GetState + статус-эндпоинт

- `lib/tbank.ts`: добавить `getPaymentState(paymentId)` → POST `/v2/GetState`, поля токена: `TerminalKey`, `PaymentId`, `Password` (через существующий `buildToken`). Вернуть `{ ok, status, error }`.
- Новый роут `GET /api/payments/status?orderId=...` (auth Bearer, владелец платежа):
  - Достать платёж по `orderId` (`getPaymentByOrderId`), вызвать `GetState` по `paymentId`.
  - Идемпотентно синхронизировать: `CONFIRMED` → `updatePaymentStatus` + `setArticleStatus(articleId, "pending_review")` (та же логика, что в webhook; не даунгрейдить уже CONFIRMED платёж).
  - Вернуть `{ status, articleStatus }`.
- `app/api/payments/init/route.ts`: в ответ добавить `paymentId` (нужен виджету iframe).
- Обработать «повторную оплату»: если Init вернул ошибку по занятому `orderId` — не проблема, `orderId` содержит `Date.now()`.

### 3. Фронтенд: iframe-виджет

- Подключить скрипт только на странице визарда (`app/articles/new/page.tsx` или внутри клиентского компонента через динамическую загрузку): `https://integrationjs.t-static.ru/integration.js`, затем `PaymentIntegration.init({ terminalKey: NEXT_PUBLIC_TBANK_TERMINAL_KEY, product: "eacq", features: { iframe: {} } })`. Точный API виджета (получение интеграции `integration.iframe.get(...)`, `connect(iframeEl)`, открытие формы по `paymentId`/`paymentUrl`) сверить с документацией: `https://developer.tbank.ru/eacq/intro/developer/setup_js/setup_iframe/`.
- Новый клиентский компонент `components/tbank-payment-dialog.tsx`: shadcn `Dialog` c `<iframe>`, монтирует виджет, показывает Skeleton при загрузке, сообщает наружу `onClose`.
- `article-wizard-client.tsx` `handlePublish()`:
  - Ветка `pending_payment`: вызвать `/api/payments/init` → открыть диалог с iframe (вместо `window.location.href`).
  - После закрытия диалога/события завершения: опросить `GET /api/payments/status?orderId=` (например, до 10 попыток с интервалом 2 с):
    - `CONFIRMED` → toast «Оплата получена. Статья отправлена на модерацию...» → очистить черновик → `/cabinet`.
    - `REJECTED/CANCELED` → toast с ошибкой, диалог можно открыть повторно.
  - Fallback: если `integration.js` не загрузился или init виджета упал → старый редирект на `paymentUrl`.
- Не добавлять CSP `frame-src` (ломает 3DS — прямое требование доков). CSP в проекте нет — ок.

### 4. Кабинет (опционально, маленькое улучшение)

- В табе «Платежи» для платежей `NEW` — кнопка «Проверить статус» → тот же `GET /api/payments/status` → toast + обновление списка.

### 5. Проверка

- `npm run check`, `npm run build` (хост).
- Smoke (playwright, `http://localhost:8080`):
  1. Логин `test-reset@expers.ru` — у него уже есть CONFIRMED-платёж, поэтому для теста оплаты использовать нового пользователя без оплаты (зарегистрировать).
  2. Пройти визард → «Опубликовать» → открылся iframe с формой Т-Банка.
  3. Тестовые карты: успех `2201382000000013` (12/30, cvv 123, frictionless); 3DS challenge `2201382000000047` (пароль `1qwezxc`); отказ «недостаточно средств» `2201382000000831`.
  4. После оплаты: polling → платёж CONFIRMED, статья `pending_review`, баннер «На модерации» в кабинете, статья в очереди `/admin/moderation`.
  5. Отказ: статья остаётся `pending_payment`, диалог можно переоткрыть.
- Прод-заметка: webhook придёт на `APP_BASE_URL/api/payments/webhook` — на сервере уже HTTPS через Caddy; после деплоя проверить `ensureProductionConfig()` предупреждения в логах.

## Риски / примечания

- **HTTPS-требование виджета**: integration.js заявляет работу по HTTPS. `localhost` обычно считается secure context, но если виджет откажется работать на `http://localhost:8080` — сработает fallback-редирект; на проде (`https://expers.ru`) ограничений нет. Это главный риск iframe-пути.
- **DEMO-пароль в git**: `.env.docker` отслеживается. Для DEMO-терминала приемлемо; боевые ключи в репозиторий не класть (только env сервера).
- Поведение DEMO-терминала: платежи имитируются, ночью автоотменяются — стабильный статус для проверки это `CONFIRMED` сразу после оплаты.
- Точную сигнатуру методов виджета (`integration.iframe.get`, `connect`, open) брать из доков по ссылкам выше — в markdown-выгрузке табы с примерами кода не раскрываются.
- `GET /api/payments/status` должен быть идемпотентным и не понижать статус (webhook и polling могут гоняться).

## Ссылки

- Сценарии приёма платежей: https://developer.tbank.ru/eacq/scenarios/payments/
- Платёжная форма банка: https://developer.tbank.ru/eacq/scenarios/payments/nonPCI/
- Скрипт интеграции: https://developer.tbank.ru/eacq/intro/developer/setup_js/
- Iframe-форма: https://developer.tbank.ru/eacq/intro/developer/setup_js/setup_iframe/
- Тестовые карты: https://developer.tbank.ru/eacq/intro/errors/test
- API Init/GetState: https://developer.tbank.ru/eacq/api/init , https://developer.tbank.ru/eacq/api/get-state
