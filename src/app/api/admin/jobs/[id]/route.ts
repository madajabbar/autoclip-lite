import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as any;
    if (!job) {
      return NextResponse.json({ error: "Job tidak ditemukan" }, { status: 404 });
    }

    // 1. Delete original file
    if (job.file_path && fs.existsSync(job.file_path)) {
      try { fs.unlinkSync(job.file_path); } catch (e) {}
    }

    // 2. Find and delete clip files
    const clips = db.prepare("SELECT * FROM clips WHERE job_id = ?").all(id);
    for (const clip of clips as any[]) {
      if (clip.url) {
        const filename = decodeURIComponent(clip.url.split('/').pop() || "");
        if (filename) {
          const filePath = path.join(process.cwd(), "public", "autoclip-results", filename);
          if (fs.existsSync(filePath)) {
             try { fs.unlinkSync(filePath); } catch(e) {}
          }
        }
      }
    }

    // 3. Delete from DB
    db.prepare("DELETE FROM clips WHERE job_id = ?").run(id);
    db.prepare("DELETE FROM jobs WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "Job berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
