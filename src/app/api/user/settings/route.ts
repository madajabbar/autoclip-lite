import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(session.userId);
    return NextResponse.json(settings || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const logoFile = formData.get("logo") as File | null;
    const position = formData.get("logo_position") as string || "TOP_CENTER";
    const size = formData.get("logo_size") as string || "MEDIUM";
    const opacity = parseFloat(formData.get("logo_opacity") as string || "1.0");

    let logoUrl = formData.get("existing_logo_url") as string || null;

    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = path.extname(logoFile.name) || '.png';
      const filename = `logo_${uuidv4()}${ext}`;
      const logosDir = path.join(process.cwd(), "public", "uploads", "logos");
      
      await mkdir(logosDir, { recursive: true });
      await writeFile(path.join(logosDir, filename), buffer);
      
      logoUrl = `/uploads/logos/${filename}`;
    }

    // Insert or Replace
    db.prepare(`
      INSERT INTO user_settings (user_id, logo_url, logo_position, logo_size, logo_opacity)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET 
        logo_url = excluded.logo_url,
        logo_position = excluded.logo_position,
        logo_size = excluded.logo_size,
        logo_opacity = excluded.logo_opacity
    `).run(session.userId, logoUrl, position, size, opacity);

    return NextResponse.json({ success: true, logo_url: logoUrl });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
