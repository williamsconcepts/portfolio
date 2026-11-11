import { NextRequest } from "next/server";
import * as cookie from "cookie";
import { getSql, initDb, isDbConfigured } from "./db";
import { hashPassword, verifyPassword } from "./crypto";

export function isRequestAuthenticated(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookie.parse(cookieHeader);
  return cookies.authToken === "authenticated";
}

/**
 * Checks admin credentials against the database.
 */
export async function verifyAdminCredentials(
  password: string,
  username = "admin",
): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const sql = getSql();
  await initDb();

  const rows = await sql`
    SELECT password_hash FROM admin_users
    WHERE username = ${username}
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) return false;
  return verifyPassword(password, rows[0].password_hash as string);
}

/**
 * Updates the admin password in the database.
 */
export async function updateAdminPassword(
  newPassword: string,
  username = "admin",
): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const sql = getSql();
  await initDb();

  const hashed = hashPassword(newPassword);

  const result = await sql`
    INSERT INTO admin_users (username, password_hash, updated_at)
    VALUES (${username}, ${hashed}, NOW())
    ON CONFLICT (username) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW()
    RETURNING id;
  `;

  return result.length > 0;
}

export { hashPassword, verifyPassword };
