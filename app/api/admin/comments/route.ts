import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { isDatabaseAvailable } from "@/lib/db";
import { getCommentsWithArticle, deleteCommentById } from "@/lib/models";
import { mockCommentsWithArticle } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const url = request.nextUrl;
  const search = url.searchParams.get("search") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(mockCommentsWithArticle);
  }

  try {
    const result = await getCommentsWithArticle(search, page, pageSize);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = verifyAdmin(request);
  if ("error" in admin) return admin.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Требуется id" }, { status: 400 });
  }

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    await deleteCommentById(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
