import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token wajib ada" }, { status: 400 });
    }

    // Find token
    const verificationRecord: any = db.prepare("SELECT * FROM verification_tokens WHERE token = ?").get(token);
    
    if (!verificationRecord) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
    }

    // Check expiration
    if (new Date(verificationRecord.expires_at) < new Date()) {
      db.prepare("DELETE FROM verification_tokens WHERE token = ?").run(token);
      return NextResponse.json({ error: "Token sudah kadaluarsa" }, { status: 400 });
    }

    // Verify user
    db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(verificationRecord.user_id);

    // Delete used token
    db.prepare("DELETE FROM verification_tokens WHERE token = ?").run(token);

    return NextResponse.json({ success: true, message: "Email berhasil diverifikasi" });

  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
