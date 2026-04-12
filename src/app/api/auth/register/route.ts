import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../../../../lib/db";
import { Resend } from "resend";

// Hapus inisialisasi di level top (global)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    db.prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)").run(userId, email, hashedPassword);

    // Create verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    db.prepare("INSERT INTO verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);

    // Send email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
    
    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "AutoClip <onboarding@resend.dev>", // Gantilah dengan domain Anda jika sudah punya
          to: email,
          subject: "Verifikasi Akun AutoClip Anda",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #3b82f6;">Selamat Datang di AutoClip!</h1>
              <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi akun Anda:</p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Verifikasi Akun</a>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
            </div>
          `,
        });
    } else {
        console.warn("[AUTH] RESEND_API_KEY tidak ditemukan. Simulasi pengiriman email.");
        console.log(`[AUTH] Link Verifikasi: ${verificationUrl}`);
    }

    return NextResponse.json({ success: true, message: "Pendaftaran berhasil, silakan cek email" });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
