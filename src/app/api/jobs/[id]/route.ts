import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const job: any = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Authorization: Must be owner OR an ADMIN
    if (job.user_id !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Anda tidak memiliki akses ke job ini." }, { status: 403 });
    }

    const clips = db.prepare("SELECT * FROM clips WHERE job_id = ?").all(id);
    const legacyClips = job.results ? JSON.parse(job.results as string) : [];
    
    const finalResults = clips.length > 0 
      ? clips.map((c: any) => ({
          id: c.id,
          url: c.url,
          title: c.title,
          duration: `${c.start_time} - ${c.end_time}`,
          topic: c.topic,
          summary: c.summary
        }))
      : legacyClips;

    return NextResponse.json({
      id: job.id,
      status: job.status,
      current_step: job.current_step,
      results: finalResults,
      error: job.error,
      updated_at: job.updated_at
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
