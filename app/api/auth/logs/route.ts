import { NextResponse } from "next/server";
import { getLatestAuthLogs } from "@/lib/auth-logs";

// สำคัญมาก: บังคับให้ route นี้เป็น dynamic เสมอ (ไม่ใช้ snapshot ตอน build)
export const dynamic = "force-dynamic";

export async function GET() {
  const logs = await getLatestAuthLogs(200);
  return NextResponse.json(logs);
}
