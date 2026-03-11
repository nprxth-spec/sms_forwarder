import { NextResponse } from "next/server";
import { getLatestAuthLogs } from "@/lib/auth-logs";

export async function GET() {
  const logs = await getLatestAuthLogs(200);
  return NextResponse.json(logs);
}
