import { NextRequest, NextResponse } from "next/server";
import { getAllSessions, clearOtherSessions } from "@/lib/auth-sessions";

export async function GET() {
  const sessions = await getAllSessions(100);
  return NextResponse.json(sessions);
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get("otp_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await clearOtherSessions(sessionId);
  return NextResponse.json({ ok: true });
}
