import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { teamMemberSchema } from "@/lib/validations/team-member";
import { createAuditLog } from "@/lib/services/audit";
import { AuditAction, EntityType } from "@prisma/client";

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      orderBy: { alias: "asc" },
      include: {
        _count: {
          select: {
            preferences: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = teamMemberSchema.parse(body);

    // Check if alias already exists
    const existing = await prisma.teamMember.findUnique({
      where: { alias: validated.alias },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Alias already exists" },
        { status: 409 }
      );
    }

    const member = await prisma.teamMember.create({
      data: validated,
    });

    await createAuditLog({
      action: AuditAction.CREATE,
      entityType: EntityType.TEAM_MEMBER,
      entityId: member.id,
      after: validated,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    console.error("Create member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

