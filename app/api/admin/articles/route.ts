import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getArticlesFiltered } from "@/lib/models";
import { mockArticles } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const url = request.nextUrl;
  const filter = {
    status: url.searchParams.get("status") || undefined,
    industryId: url.searchParams.get("industryId") || undefined,
    expertId: url.searchParams.get("expertId") || undefined,
    dateFrom: url.searchParams.get("dateFrom") || undefined,
    dateTo: url.searchParams.get("dateTo") || undefined,
    sort: url.searchParams.get("sort") || "created_at",
    order: (url.searchParams.get("order") as "asc" | "desc") || "desc",
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || 20,
  };

  if (!(await isDatabaseAvailable())) {
    const total = mockArticles.length;
    const page = filter.page;
    const pageSize = filter.pageSize;
    return NextResponse.json({
      articles: mockArticles.slice((page - 1) * pageSize, page * pageSize),
      total,
    });
  }

  try {
    const result = await getArticlesFiltered(filter);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: "Ошибка получения данных", details: String(e) },
      { status: 500 }
    );
  }
}
