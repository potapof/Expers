import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getExpertsWithStats } from "@/lib/models";
import { mockExpertRows } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ experts: mockExpertRows });
  }

  try {
    const experts = await getExpertsWithStats();
    return NextResponse.json({ experts });
  } catch (err) {
    console.error("Admin experts error:", err);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}
