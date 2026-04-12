import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "../../../lib/db";
import { parse } from "csv-parse/sync";
import * as path from "path";
import { writeFile, mkdir } from "fs/promises";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const userId = session.userId;
    const formData = await req.formData();
    const url = formData.get("url") as string;
    const file = formData.get("file") as File;
    const csvFile = formData.get("csv") as File;

    if (!url && !file) {
      return NextResponse.json({ error: "Missing link or file" }, { status: 400 });
    }

    const jobId = uuidv4();
    const tempDir = path.join(process.cwd(), "public", "temp");
    await mkdir(tempDir, { recursive: true });

    let originalFilePath = "";
    let type = "youtube";
    let videoTitle = "";

    if (file) {
      type = "upload";
      videoTitle = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      originalFilePath = path.join(tempDir, `${jobId}_original.mp4`);
      await writeFile(originalFilePath, buffer);
    }

    // Parse CSV early to catch errors
    let clipsConfig: any[] = [];
    if (csvFile) {
      const csvText = await csvFile.text();
      try {
        const rawRows: string[][] = parse(csvText, { skip_empty_lines: true, relax_column_count: true });
        if (rawRows.length > 1) {
          const headers = rawRows[0].map(h => h.trim().toLowerCase());
          const startIdx = headers.indexOf('start_time');
          const endIdx = headers.indexOf('end_time');
          const topicIdx = headers.indexOf('topic');
          const summaryIdx = headers.indexOf('summary');

          clipsConfig = rawRows.slice(1).map(row => ({
            start_time: row[startIdx]?.trim() || "",
            end_time: row[endIdx]?.trim() || "",
            topic: row[topicIdx]?.trim() || "",
            summary: row.slice(summaryIdx).join(",").trim()
          }));
        }
      } catch (e: any) {
        return NextResponse.json({ error: "Format CSV tidak valid: " + e.message }, { status: 400 });
      }
    }

    // Insert into DB
    const insert = db.prepare(`
      INSERT INTO jobs (id, user_id, type, url, file_path, video_title, csv_config, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      jobId,
      userId,
      type,
      url || null,
      originalFilePath || null,
      videoTitle || null,
      JSON.stringify(clipsConfig),
      'PENDING'
    );

    return NextResponse.json({
      success: true,
      jobId: jobId
    });

  } catch (error: any) {
    console.error("Enqueue Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
