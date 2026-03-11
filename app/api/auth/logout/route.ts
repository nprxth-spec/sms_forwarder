import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName } from "@/lib/auth";
import { addAuthLog } from "@/lib/auth-logs";
import { removeSession } from "@/lib/auth-sessions";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("otp_session")?.value;
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  if (sessionId) {
    await removeSession(sessionId);
  }

  await addAuthLog({ action: "LOGOUT", ip, userAgent, success: true });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAuthCookieName(), "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  res.cookies.set("otp_session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
