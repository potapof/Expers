import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { generateTemplate } from "@/lib/import-template";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return NextResponse.json(
      { error: "Недействительный токен" },
      { status: 401 }
    );
  }

  try {
    const topic = request.nextUrl.searchParams.get("topic") || undefined;
    const md = generateTemplate(payload.name, topic);

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="expers-article-template.md"`,
      },
    });
  } catch (err) {
    console.error("Ошибка генерации шаблона:", err);
    return NextResponse.json(
      { error: "Ошибка при генерации шаблона" },
      { status: 500 }
    );
  }
}
