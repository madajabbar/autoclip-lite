import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const clips = db.prepare(`
      SELECT clips.*, jobs.video_title 
      FROM clips 
      JOIN jobs ON clips.job_id = jobs.id 
      ORDER BY clips.created_at DESC
    `).all();
    
    return NextResponse.json({ success: true, clips });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
