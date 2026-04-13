import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = db.prepare("SELECT id, email, is_verified, role, created_at FROM users ORDER BY created_at DESC").all();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { email, password, role, is_verified } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    db.prepare("INSERT INTO users (id, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)")
      .run(userId, email, hashedPassword, role || 'USER', is_verified ? 1 : 0);

    return NextResponse.json({ success: true, message: "User created successfully" });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
