import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const jobs = db.prepare(`
      SELECT jobs.*, users.email as user_email 
      FROM jobs 
      LEFT JOIN users ON jobs.user_id = users.id 
      ORDER BY jobs.created_at DESC
    `).all();

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
