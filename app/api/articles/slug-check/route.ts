import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { isSlugTaken } from "@/lib/models";

const querySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  industryId: z.string().min(1),
  excludeArticleId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    slug: searchParams.get("slug"),
    industryId: searchParams.get("industryId"),
    excludeArticleId: searchParams.get("excludeArticleId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные параметры" },
      { status: 400 }
    );
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({ taken: false });
  }

  const taken = await isSlugTaken(
    parsed.data.industryId,
    parsed.data.slug,
    parsed.data.excludeArticleId
  );

  return NextResponse.json({ taken });
}
