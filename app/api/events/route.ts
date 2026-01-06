import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      include: {
        config: true,
        _count: {
          select: {
            shifts: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

