import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyLogin(password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    await createSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message.includes("ADMIN_PASSWORD_HASH")) {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_PASSWORD_HASH is not set" },
        { status: 500 }
      );
    }

    if (message.includes("SESSION_SECRET")) {
      return NextResponse.json(
        { error: "Server misconfigured: SESSION_SECRET is not set" },
        { status: 500 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

