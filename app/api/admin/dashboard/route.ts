import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getArticlesCount,
  getArticlesCountByStatus,
  getArticlesPublishedToday,
  getExpertsCount,
  getPayingExpertsCount,
  getRevenueCurrentMonth,
  getPublicationsByDay,
  getRevenueByMonth,
  getRecentArticles,
} from "@/lib/models";
import {
  mockDashboardStats,
  mockPublicationsByDay,
  mockRevenueByMonth,
  mockArticles,
} from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      ...mockDashboardStats,
      publicationsByDay: mockPublicationsByDay,
      revenueByMonth: mockRevenueByMonth,
      recentArticles: mockArticles.slice(0, 10),
    });
  }

  try {
    const [
      totalArticles,
      pendingReview,
      publishedToday,
      totalExperts,
      payingExperts,
      revenueMonth,
      publicationsByDay,
      revenueByMonth,
      recentArticles,
    ] = await Promise.all([
      getArticlesCount(),
      getArticlesCountByStatus("pending_review"),
      getArticlesPublishedToday(),
      getExpertsCount(),
      getPayingExpertsCount(),
      getRevenueCurrentMonth(),
      getPublicationsByDay(30),
      getRevenueByMonth(),
      getRecentArticles(10),
    ]);

    return NextResponse.json({
      totalArticles,
      pendingReview,
      publishedToday,
      totalExperts,
      payingExperts,
      revenueMonth,
      publicationsByDay,
      revenueByMonth,
      recentArticles,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}
