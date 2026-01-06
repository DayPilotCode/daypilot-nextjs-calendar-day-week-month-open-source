import { NextResponse } from "next/server";

export async function GET() {
  const missing: string[] = [];

  if (!process.env.ADMIN_PASSWORD_HASH?.trim()) {
    missing.push("ADMIN_PASSWORD_HASH");
  }
  if (!process.env.SESSION_SECRET?.trim()) {
    missing.push("SESSION_SECRET");
  }

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        missingEnv: missing,
        message: "Critical auth env vars are missing",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "phase-0",
    missingEnv: missing,
  });
}

