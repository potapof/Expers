import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getModerationQueue, getModerationCount } from "@/lib/models";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ articles: [], pendingCount: 0 });
  }

  try {
    const [articles, pendingCount] = await Promise.all([
      getModerationQueue(),
      getModerationCount(),
    ]);
    return NextResponse.json({ articles, pendingCount });
  } catch (err) {
    console.error("Moderation queue error:", err);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}
