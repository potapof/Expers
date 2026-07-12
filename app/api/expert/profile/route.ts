import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExpertById, updateExpert, hasConfirmedPayment } from "@/lib/models";
import { verifyToken, toSafeExpert } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/profile";
import { mockExpertProfiles } from "@/lib/mock-data";
import { expertProfiles } from "@/lib/data";

const querySchema = z.object({
  id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    id: searchParams.get("id") || undefined,
  });
  const queryId = parsed.success ? parsed.data.id : undefined;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const payload = token ? verifyToken(token) : null;

  const dbAvailable = await isDatabaseAvailable();

  const targetId = queryId || payload?.id;

  if (!targetId) {
    return NextResponse.json(
      { error: "Не указан ID эксперта" },
      { status: 400 }
    );
  }

  if (dbAvailable) {
    const expert = await getExpertById(targetId);
    if (expert) {
      return NextResponse.json({ expert: toSafeExpert(expert) });
    }
  }

  const mockProfile = mockExpertProfiles.find((p) => p.id === targetId);
  if (mockProfile) {
    return NextResponse.json({ expert: mockProfile });
  }

  const staticProfile = expertProfiles.find((p) => p.id === targetId);
  if (staticProfile) {
    return NextResponse.json({
      expert: {
        id: staticProfile.id,
        name: staticProfile.name,
        email: staticProfile.email || "",
        avatar: "",
        bio: staticProfile.bio,
        expertise: staticProfile.expertise,
        credentials: staticProfile.credentials,
        socialLinks: staticProfile.socialLinks,
        createdAt: "",
        updatedAt: "",
      },
    });
  }

  return NextResponse.json({ error: "Эксперт не найден" }, { status: 404 });
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    const hasPaid = await hasConfirmedPayment(payload.id);
    if (!hasPaid) {
      return NextResponse.json(
        {
          error:
            "Страница автора станет доступна после публикации первой оплаченной статьи",
        },
        { status: 403 }
      );
    }
    const expert = await updateExpert(payload.id, data);
    return NextResponse.json({ expert: toSafeExpert(expert) });
  }

  return NextResponse.json(
    { error: "База данных недоступна" },
    { status: 503 }
  );
}
