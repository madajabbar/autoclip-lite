import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-change-me");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("autoclip_session")?.value;
  const { pathname } = req.nextUrl;

  // 1. Protect /generate (Must be logged in)
  if (pathname.startsWith("/generate") || pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // 2. Protect /admin (Must be ADMIN)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
      // Verify JWT and check role
      const { payload }: any = await jose.jwtVerify(token, JWT_SECRET);
      
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate/:path*", "/dashboard/:path*", "/admin/:path*"],
};
