import { query } from "./db";

export type AuthLogRow = {
  id: string;
  time: string;
  action: "LOGIN" | "LOGOUT";
  ip: string;
  userAgent: string;
  success: boolean;
};

let ensured = false;

async function ensureTable() {
  if (ensured) return;
  ensured = true;
  await query(`
    CREATE TABLE IF NOT EXISTS auth_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      time TIMESTAMPTZ NOT NULL DEFAULT now(),
      action TEXT NOT NULL,
      ip TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      success BOOLEAN NOT NULL
    );
  `);
}

export async function addAuthLog(input: {
  action: "LOGIN" | "LOGOUT";
  ip: string;
  userAgent: string;
  success: boolean;
}) {
  await ensureTable();
  await query(
    `INSERT INTO auth_logs (action, ip, user_agent, success)
     VALUES ($1, $2, $3, $4)`,
    [input.action, input.ip, input.userAgent, input.success],
  );
}

export async function getLatestAuthLogs(limit = 200) {
  await ensureTable();
  const res = await query<AuthLogRow>(
    `SELECT id, time, action, ip, user_agent as "userAgent", success
     FROM auth_logs
     ORDER BY time DESC
     LIMIT $1`,
    [limit],
  );
  return res.rows;
}

