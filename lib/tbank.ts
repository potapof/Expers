import crypto from "crypto";

export const PUBLICATION_PRICE_KOPECKS = 500000; // 5000 ₽

const TBANK_API_URL =
  process.env.TBANK_API_URL || "https://securepay.tinkoff.ru/v2";

function isTestMode(): boolean {
  return process.env.TBANK_TEST_MODE === "true";
}

export function isPaymentConfigured(): boolean {
  if (isTestMode()) return true;
  const key = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;
  return !!(key && password);
}

export function ensureProductionConfig(): string[] {
  const warnings: string[] = [];
  if (isTestMode()) {
    warnings.push(
      "TBANK_TEST_MODE=true включён — реальные платежи не выполняются"
    );
    return warnings;
  }
  if (!process.env.TBANK_TERMINAL_KEY) {
    warnings.push("TBANK_TERMINAL_KEY не задан");
  }
  if (!process.env.TBANK_PASSWORD) {
    warnings.push("TBANK_PASSWORD не задан");
  }
  if (!process.env.APP_BASE_URL) {
    warnings.push(
      "APP_BASE_URL не задан — webhook URL будет собран из origin запроса"
    );
  } else if (!process.env.APP_BASE_URL.startsWith("https://")) {
    warnings.push(
      "APP_BASE_URL должен начинаться с https:// для приёма webhook от Т-Банка"
    );
  }
  return warnings;
}

type Scalar = string | number | boolean;

export function buildToken(
  params: Record<string, Scalar | undefined>,
  password: string
): string {
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    entries.push([key, String(value)]);
  }
  entries.push(["Password", password]);
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const concatenated = entries.map(([, v]) => v).join("");
  return crypto.createHash("sha256").update(concatenated, "utf8").digest("hex");
}

export interface InitPaymentInput {
  orderId: string;
  amount: number;
  description: string;
  notificationUrl: string;
  successUrl: string;
  failUrl: string;
}

export interface InitPaymentResult {
  ok: boolean;
  paymentId?: string;
  paymentUrl?: string;
  error?: string;
}

export async function initPayment(
  input: InitPaymentInput
): Promise<InitPaymentResult> {
  if (isTestMode()) {
    return {
      ok: true,
      paymentId: `test-${input.orderId}`,
      paymentUrl: `${input.successUrl}?OrderId=${encodeURIComponent(
        input.orderId
      )}&TestMode=1`,
    };
  }

  const terminalKey = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;
  if (!terminalKey || !password) {
    return {
      ok: false,
      error: "Платёжный сервис не настроен (отсутствуют ключи терминала)",
    };
  }

  const signedFields: Record<string, Scalar> = {
    TerminalKey: terminalKey,
    Amount: input.amount,
    OrderId: input.orderId,
    Description: input.description,
  };
  const token = buildToken(signedFields, password);

  const body = {
    ...signedFields,
    Token: token,
    NotificationURL: input.notificationUrl,
    SuccessURL: input.successUrl,
    FailURL: input.failUrl,
    PayType: "O",
  };

  try {
    const res = await fetch(`${TBANK_API_URL}/Init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.Success && data.PaymentId && data.PaymentURL) {
      return {
        ok: true,
        paymentId: String(data.PaymentId),
        paymentUrl: data.PaymentURL,
      };
    }
    return {
      ok: false,
      error: data.Message || data.Details || "Ошибка инициализации платежа",
    };
  } catch {
    return { ok: false, error: "Не удалось связаться с платёжным сервисом" };
  }
}

export function verifyNotificationToken(
  body: Record<string, unknown>
): boolean {
  const password = process.env.TBANK_PASSWORD;
  if (!password) {
    console.error("T-Bank webhook: TBANK_PASSWORD не задан");
    return false;
  }
  const provided = body.Token;
  if (typeof provided !== "string") return false;

  const params: Record<string, Scalar> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "Token") continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue; // skip Data, Receipt, arrays
    params[key] = value as Scalar;
  }
  const expected = buildToken(params, password);
  return expected === provided;
}
