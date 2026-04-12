import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = db.prepare("SELECT id, email, is_verified, role, created_at FROM users ORDER BY created_at DESC").all();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
