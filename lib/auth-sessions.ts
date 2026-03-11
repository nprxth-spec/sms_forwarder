import { query } from "./db";

export type SessionRow = {
  id: string;
  createdAt: string;
  lastActive: string;
  ip: string;
  userAgent: string;
  name: string;
};

let ensured = false;

async function ensureTable() {
  if (ensured) return;
  ensured = true;
  await query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      name TEXT NOT NULL
    );
  `);
}

export async function createSession(ip: string, userAgent: string) {
  await ensureTable();
  const name = "Session";
  const res = await query<SessionRow>(
    `INSERT INTO auth_sessions (ip, user_agent, name)
     VALUES ($1, $2, $3)
     RETURNING id, created_at as "createdAt", last_active as "lastActive", ip, user_agent as "userAgent", name`,
    [ip, userAgent, name],
  );
  return res.rows[0];
}

export async function removeSession(id: string) {
  await ensureTable();
  await query(`DELETE FROM auth_sessions WHERE id = $1`, [id]);
}

export async function clearOtherSessions(currentId: string) {
  await ensureTable();
  await query(`DELETE FROM auth_sessions WHERE id <> $1`, [currentId]);
}

export async function getAllSessions(limit = 100) {
  await ensureTable();
  const res = await query<SessionRow>(
    `SELECT id, created_at as "createdAt", last_active as "lastActive", ip, user_agent as "userAgent", name
     FROM auth_sessions
     ORDER BY last_active DESC, created_at DESC
     LIMIT $1`,
    [limit],
  );
  return res.rows;
}

