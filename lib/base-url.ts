import { NextRequest } from "next/server";

export function resolveBaseUrl(request: NextRequest): string {
  const envUrl = process.env.APP_BASE_URL;
  if (envUrl && envUrl.startsWith("https://")) {
    return envUrl.replace(/\/$/, "");
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${proto}://${host}`;
  }
  return (envUrl || request.nextUrl.origin).replace(/\/$/, "");
}
