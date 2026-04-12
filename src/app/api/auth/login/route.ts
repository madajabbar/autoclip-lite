import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import db from "../../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Find user
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    // Check verification
    if (!user.is_verified) {
      return NextResponse.json({ error: "Silakan verifikasi email Anda terlebih dahulu" }, { status: 403 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kredensial salah" }, { status: 401 });
    }

    // Create session token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookie = serialize("autoclip_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const response = NextResponse.json({ success: true, message: "Login berhasil" });
    response.headers.set("Set-Cookie", cookie);
    
    return response;

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
