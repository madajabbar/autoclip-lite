import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the session cookie
  response.cookies.set("autoclip_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}
