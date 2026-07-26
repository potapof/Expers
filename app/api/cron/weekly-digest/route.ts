import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getExpertsWithArticles, getAuthorWeeklyStats } from "@/lib/models";
import { sendMail } from "@/lib/mail";
import { weeklyDigestEmail } from "@/lib/mail-templates";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  let experts;
  try {
    experts = await getExpertsWithArticles();
  } catch {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sentCount = 0;

  for (const expert of experts) {
    if (!expert.email) continue;
    try {
      const stats = await getAuthorWeeklyStats(expert.id, weekAgo, now);
      if (
        stats.newSubscribers === 0 &&
        stats.newComments === 0 &&
        stats.articlesPublished === 0
      ) {
        continue;
      }

      const period = `${formatDate(weekAgo)} – ${formatDate(now)}`;
      await sendMail({
        to: expert.email,
        subject: `Дайджест Expers — ${period}`,
        html: weeklyDigestEmail(stats),
      });
      sentCount++;
    } catch (err) {
      console.error(`Digest failed for ${expert.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent: sentCount });
}
