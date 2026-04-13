import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // 1. Delete associated clips
    db.prepare("DELETE FROM clips WHERE job_id = ?").run(id);
    
    // 2. Delete the job itself
    const result = db.prepare("DELETE FROM jobs WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Job tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
