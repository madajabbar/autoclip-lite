import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { user_name, user_role, comment, rating, avatar_url } = await req.json();
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO reviews (id, user_name, user_role, comment, rating, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user_name, user_role, comment, rating || 5, avatar_url);
    
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
