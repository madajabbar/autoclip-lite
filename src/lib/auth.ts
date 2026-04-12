import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import db from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export function getSession(req: NextRequest) {
  const cookie = req.cookies.get("autoclip_session")?.value;
  if (!cookie) return null;

  try {
    const decoded: any = jwt.verify(cookie, JWT_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
}

export function isAdmin(req: NextRequest) {
  const session = getSession(req);
  if (!session || !session.userId) return false;

  const user: any = db.prepare("SELECT role FROM users WHERE id = ?").get(session.userId);
  return user?.role === 'ADMIN';
}
