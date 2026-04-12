import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Only Admin or Public for some keys?
  // Let's make it public for GET so frontend can fetch Pricing/Contact
  try {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsMap = settings.reduce((acc: any, item: any) => {
      acc[item.key] = item.value.startsWith('{') || item.value.startsWith('[') ? JSON.parse(item.value) : item.value;
      return acc;
    }, {});
    
    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { key, value } = await req.json();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, stringValue);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
