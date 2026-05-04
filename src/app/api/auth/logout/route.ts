import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear the session cookie
  response.cookies.set("autoclip_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && req.headers.get("x-forwarded-proto") === "https",
    sameSite: "lax",
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}
