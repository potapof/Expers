import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getPublicationsByDay } from "@/lib/models";
import { mockPublicationsByDay } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const days = Number(request.nextUrl.searchParams.get("days")) || 30;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ publicationsByDay: mockPublicationsByDay });
  }

  try {
    const publicationsByDay = await getPublicationsByDay(days);
    return NextResponse.json({ publicationsByDay });
  } catch {
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}
