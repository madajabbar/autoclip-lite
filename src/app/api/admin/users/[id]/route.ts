import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await req.json();
    const { email, role, is_verified, password } = data;

    // Build query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    if (is_verified !== undefined) {
      updates.push("is_verified = ?");
      values.push(is_verified ? 1 : 0);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Tidak ada data untuk diperbarui" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    
    db.prepare(query).run(...values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
