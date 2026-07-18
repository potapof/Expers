import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export type AdminPayload = {
  id: string;
  email: string;
  name: string;
  role: "admin";
};

export function isAdmin(payload: { role?: string }): payload is AdminPayload {
  return payload.role === "admin";
}

export function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Не авторизован" }, { status: 401 }),
    };
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return {
      error: NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 }
      ),
    };
  }
  if (payload.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }),
    };
  }
  return { payload: payload as AdminPayload };
}
