import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const user: any = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
