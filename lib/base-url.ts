import { NextRequest } from "next/server";

export function resolveBaseUrl(request: NextRequest): string {
  const envUrl = process.env.APP_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return request.nextUrl.origin.replace(/\/$/, "");
}
