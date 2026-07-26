export interface AuthorWeeklyStats {
  authorName: string;
  authorEmail: string;
  articlesPublished: number;
  articlesInModeration: number;
  articlesTotal: number;
  newSubscribers: number;
  newComments: number;
  newFavorites: number;
  paymentsCount: number;
  paymentsTotal: number;
  topArticleTitle: string | null;
  topArticleComments: number;
  periodStart: string;
  periodEnd: string;
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:32px 0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <tr>
            <td style="background-color:#0039CA;padding:24px 32px;text-align:center">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">EXPERS</span>
              <span style="color:#ffffff;font-size:12px;display:block;margin-top:4px;opacity:0.8">Каталог экспертных статей</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 32px;border-top:1px solid #eef0f2">
              <p style="font-size:11px;color:#9ca3af;margin:0;text-align:center;line-height:1.6">
                ООО «ФОНИИ» · ИНН 7720943604 · ОГРН 1257700013141<br>
                Это автоматическое сообщение, на него не нужно отвечать.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statCard(values: [string, number | string][]): string {
  const rows = values
    .map(
      ([label, val]) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#4b5563">${label}</td>
          <td style="padding:8px 0;font-size:16px;font-weight:700;color:#0039CA;text-align:right">${val}</td>
        </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background-color:#f0f4ff;border-radius:8px;padding:16px">
    ${rows}
  </table>`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatPrice(kopecks: number): string {
  const rub = Math.floor(kopecks / 100);
  return rub.toLocaleString("ru-RU") + " ₽";
}

export function verificationEmail(code: string): string {
  return baseTemplate(
    "Подтверждение почты",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Вы зарегистрировались на платформе <strong>EXPERS.ru</strong>.
      Чтобы подтвердить адрес электронной почты, введите код:
    </p>
    <p style="font-size:28px;font-weight:700;color:#0039CA;text-align:center;letter-spacing:6px;margin:0 0 24px;background-color:#f0f4ff;padding:16px;border-radius:8px">
      ${code}
    </p>
    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.5">
      Код действителен 24 часа. Если вы не регистрировались на EXPERS.ru, просто проигнорируйте это письмо.
    </p>`
  );
}

export function resetPasswordEmail(code: string): string {
  return baseTemplate(
    "Сброс пароля",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Вы запросили сброс пароля на <strong>EXPERS.ru</strong>. Введите код на странице восстановления:
    </p>
    <p style="font-size:28px;font-weight:700;color:#0039CA;text-align:center;letter-spacing:6px;margin:0 0 24px;background-color:#f0f4ff;padding:16px;border-radius:8px">
      ${code}
    </p>
    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.5">
      Код действителен 15 минут. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
    </p>`
  );
}

export function welcomeEmail(name: string): string {
  return baseTemplate(
    "Добро пожаловать в Expers",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">
      Добро пожаловать, <strong>${name}</strong>!
    </p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 16px;line-height:1.6">
      Вы зарегистрировались в каталоге экспертных статей EXPERS.ru.
      Здесь эксперты публикуют статьи по 13 отраслям бизнеса, а читатели находят структурированный контент.
    </p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Чтобы начать:
    </p>
    <ul style="margin:0 0 24px;padding:0 0 0 20px;font-size:14px;color:#4b5563;line-height:2">
      <li>Подтвердите email — код уже отправлен отдельным письмом</li>
      <li>Изучите <a href="https://expers.ru" style="color:#0039CA;text-decoration:none">каталог статей</a></li>
      <li>Подпишитесь на интересных авторов</li>
    </ul>
    <p style="text-align:center;margin:0">
      <a href="https://expers.ru/cabinet" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Перейти в кабинет</a>
    </p>`
  );
}

export function paymentSuccessEmail(articleTitle: string): string {
  return baseTemplate(
    "Оплата получена",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      <strong>Оплата получена.</strong> Статья «${articleTitle}» отправлена на модерацию.
      После проверки модератором она будет опубликована в каталоге.
    </p>
    <p style="text-align:center;margin:0">
      <a href="https://expers.ru/cabinet" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Перейти в кабинет</a>
    </p>`
  );
}

export function paymentFailedEmail(articleTitle: string): string {
  return baseTemplate(
    "Платёж не прошёл",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Платёж за публикацию статьи <strong>«${articleTitle}»</strong> не прошёл.
      Статья возвращена в черновик. Вы можете повторить попытку в любое время.
    </p>
    <p style="text-align:center;margin:0">
      <a href="https://expers.ru/cabinet" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Перейти в кабинет</a>
    </p>`
  );
}

export function articleApprovedEmail(
  articleTitle: string,
  articleUrl: string
): string {
  return baseTemplate(
    "Статья опубликована",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Модератор <strong>одобрил</strong> вашу статью <strong>«${articleTitle}»</strong>.
      Она опубликована в каталоге EXPERS.ru.
    </p>
    <p style="text-align:center;margin:0 0 16px">
      <a href="${articleUrl}" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Посмотреть статью</a>
    </p>
    <p style="text-align:center;margin:0">
      <a href="https://expers.ru/cabinet" style="display:inline-block;color:#0039CA;padding:8px 24px;border:1px solid #0039CA;border-radius:8px;text-decoration:none;font-size:13px">В кабинет</a>
    </p>`
  );
}

export function articleRejectedEmail(
  articleTitle: string,
  reason: string
): string {
  return baseTemplate(
    "Статья отклонена",
    `<p style="font-size:16px;color:#1f2937;margin:0 0 16px">Здравствуйте!</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 16px;line-height:1.6">
      Статья <strong>«${articleTitle}»</strong> не прошла модерацию.
    </p>
    <div style="background-color:#fef3c7;border-left:3px solid #f59e0b;padding:12px 16px;margin:0 0 24px;border-radius:4px">
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.6">
        <strong>Причина:</strong> ${reason}
      </p>
    </div>
    <p style="font-size:14px;color:#4b5563;margin:0 0 24px;line-height:1.6">
      Вы можете отредактировать статью и повторно отправить на публикацию.
    </p>
    <p style="text-align:center;margin:0">
      <a href="https://expers.ru/cabinet" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Перейти в кабинет</a>
    </p>`
  );
}

export function weeklyDigestEmail(stats: AuthorWeeklyStats): string {
  const period = `${formatDate(stats.periodStart)} – ${formatDate(stats.periodEnd)}`;

  let body = `<p style="font-size:16px;color:#1f2937;margin:0 0 4px">Здравствуйте, <strong>${stats.authorName}</strong>!</p>
    <p style="font-size:13px;color:#9ca3af;margin:0 0 24px">Дайджест за ${period}</p>
    <p style="font-size:14px;color:#4b5563;margin:0 0 20px;line-height:1.6">
      Вот что произошло с вашими публикациями на этой неделе:
    </p>`;

  body += statCard([
    ["Опубликовано статей", stats.articlesPublished],
    ["На модерации", stats.articlesInModeration],
    ["Всего активно", stats.articlesTotal],
  ]);

  body += statCard([
    ["Новых подписчиков", stats.newSubscribers],
    ["Новых комментариев", stats.newComments],
    ["Добавили в избранное", stats.newFavorites],
  ]);

  if (stats.paymentsCount > 0) {
    body += statCard([
      ["Платежей", stats.paymentsCount],
      ["На сумму", formatPrice(stats.paymentsTotal)],
    ]);
  }

  if (stats.topArticleTitle) {
    body += `<div style="background-color:#f0f4ff;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="font-size:12px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px">Самая обсуждаемая статья</p>
      <p style="font-size:15px;color:#0039CA;font-weight:600;margin:0">«${stats.topArticleTitle}»</p>
      <p style="font-size:13px;color:#6b7280;margin:4px 0 0">${stats.topArticleComments} комментариев</p>
    </div>`;
  }

  body += `<p style="text-align:center;margin:0">
    <a href="https://expers.ru/cabinet" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Перейти в кабинет</a>
  </p>`;

  return baseTemplate("Дайджест Expers", body);
}

export function feedbackNotificationEmail(
  name: string | undefined,
  email: string,
  subject: string | undefined,
  message: string
): string {
  return baseTemplate(
    "Новое сообщение с сайта",
    `<p style="font-size:14px;color:#4b5563;margin:0 0 8px">
      <strong>${name || "Не указано"}</strong> — ${email}
    </p>
    ${subject ? `<p style="font-size:14px;color:#1f2937;margin:0 0 16px;font-weight:600">${subject}</p>` : ""}
    <div style="background-color:#f8f9fa;border-radius:8px;padding:16px;margin:0 0 16px">
      <p style="font-size:14px;color:#4b5563;margin:0;line-height:1.7">${message}</p>
    </div>
    <p style="text-align:center;margin:0">
      <a href="mailto:${email}" style="display:inline-block;background-color:#0039CA;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Ответить</a>
    </p>`
  );
}
