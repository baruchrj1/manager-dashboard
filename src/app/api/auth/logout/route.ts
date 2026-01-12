
import { NextResponse } from "next/server";

// GET /api/auth/logout - Logout endpoint
export async function GET() {
    // For NextAuth, we just redirect to the signout endpoint
    return NextResponse.redirect(new URL("/api/auth/signout", process.env.NEXTAUTH_URL || "http://localhost:3001"));
}
