import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { verifyToken } from "@/lib/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { updateExpert } from "@/lib/models";
import { checkRateLimit } from "@/lib/rate-limiter";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Detect the real image type from magic bytes (client-declared MIME is spoofable).
function detectImageType(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "image/png";
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  )
    return "image/gif";
  if (
    buf.length >= 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function POST(request: NextRequest) {
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

  const rateLimit = checkRateLimit(request);
  if (rateLimit) return rateLimit;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Допустимы только JPEG, PNG, WebP и GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Максимальный размер файла — 5 МБ" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verify actual content signature, not just the client-declared MIME type.
  const realType = detectImageType(buffer);
  if (!realType) {
    return NextResponse.json(
      { error: "Содержимое файла не соответствует изображению" },
      { status: 400 }
    );
  }

  const ext = realType.split("/")[1] || "jpg";
  const filename = `${payload.id}-${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "avatars");
  mkdirSync(uploadDir, { recursive: true });

  writeFileSync(join(uploadDir, filename), buffer);

  const url = `/uploads/avatars/${filename}`;

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    try {
      await updateExpert(payload.id, { avatar: url });
    } catch (err) {
      console.error("Failed to persist avatar URL:", err);
    }
  }

  return NextResponse.json({ url });
}
