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

    const allClips = db.prepare("SELECT * FROM clips").all();
    
    const formattedJobs = jobs.map((job: any) => {
      const relationalClips = allClips
        .filter((c: any) => c.job_id === job.id)
        .map((c: any) => ({
          id: c.id,
          url: c.url,
          title: c.title,
          duration: `${c.start_time} - ${c.end_time}`,
          topic: c.topic,
          summary: c.summary
        }));

      let legacyClips = [];
      try {
        legacyClips = job.results ? JSON.parse(job.results as string) : [];
      } catch (e) {}

      return {
        ...job,
        results: relationalClips.length > 0 ? relationalClips : legacyClips
      };
    });
    
    return NextResponse.json({ success: true, jobs: formattedJobs });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
