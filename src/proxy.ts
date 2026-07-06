import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect admin panel pages and administration API endpoints
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const email = token?.email;

    const whitelistedEmails = [
      "admin@cozycommerce.com",
    ];

    // If unauthenticated or user email is not a whitelisted administrator
    if (!token || !email || !whitelistedEmails.includes(email)) {
      // Return 401 Unauthorized for admin REST APIs
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Redirect page requests to login page
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
