import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getRegistrationsByMonth } from "@/lib/models";
import { mockRegistrationsByMonth } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      registrationsByMonth: mockRegistrationsByMonth,
      payingCount: 0,
    });
  }

  try {
    const registrationsByMonth = await getRegistrationsByMonth();
    return NextResponse.json({ registrationsByMonth });
  } catch (e) {
    return NextResponse.json(
      { error: "Ошибка получения данных", details: String(e) },
      { status: 500 }
    );
  }
}
