import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all jobs for this user, sorted by latest
    const jobs = db.prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC").all(session.userId);
    const allClips = db.prepare("SELECT * FROM clips").all();

    const formattedJobs = jobs.map((job: any) => {
      // 1. Get clips from new relational table
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

      // 2. Get clips from legacy JSON column (migration support)
      const legacyClips = job.results ? JSON.parse(job.results as string) : [];

      return {
        id: job.id,
        type: job.type,
        url: job.url,
        status: job.status,
        video_title: job.video_title,
        current_step: job.current_step,
        results: relationalClips.length > 0 ? relationalClips : legacyClips,
        error: job.error,
        created_at: job.created_at,
        updated_at: job.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      jobs: formattedJobs
    });
  } catch (error: any) {
    console.error("List Jobs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
