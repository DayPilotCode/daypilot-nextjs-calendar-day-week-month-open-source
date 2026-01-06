import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { preferencesSubmissionSchema } from "@/lib/validations/preference";
import { createAuditLog } from "@/lib/services/audit";
import { AuditAction, EntityType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("teamMemberId");
    const shiftId = searchParams.get("shiftId");

    const preferences = await prisma.shiftPreference.findMany({
      where: {
        ...(teamMemberId && { teamMemberId }),
        ...(shiftId && { shiftId }),
      },
      include: {
        teamMember: true,
        shift: {
          include: { event: true },
        },
      },
      orderBy: [
        { teamMember: { alias: "asc" } },
        { priority: "asc" },
      ],
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
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
    const validated = preferencesSubmissionSchema.parse(body);

    // Verify team member exists
    const member = await prisma.teamMember.findUnique({
      where: { id: validated.teamMemberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Verify all shifts exist and belong to same event
    const shiftIds = validated.preferences.map((p) => p.shiftId);
    const shifts = await prisma.shift.findMany({
      where: { id: { in: shiftIds } },
      include: { event: true },
    });

    if (shifts.length !== shiftIds.length) {
      return NextResponse.json(
        { error: "One or more shifts not found" },
        { status: 404 }
      );
    }

    const eventIds = new Set(shifts.map((s) => s.eventId));
    if (eventIds.size > 1) {
      return NextResponse.json(
        { error: "All shifts must belong to the same event" },
        { status: 400 }
      );
    }

    // Delete existing preferences for this member
    await prisma.shiftPreference.deleteMany({
      where: { teamMemberId: validated.teamMemberId },
    });

    // Create new preferences
    const preferences = await prisma.$transaction(
      validated.preferences.map((pref) =>
        prisma.shiftPreference.create({
          data: {
            teamMemberId: validated.teamMemberId,
            shiftId: pref.shiftId,
            priority: pref.priority,
            notes: pref.notes,
          },
          include: {
            shift: {
              include: { event: true },
            },
          },
        })
      )
    );

    await createAuditLog({
      userId: validated.teamMemberId,
      action: AuditAction.PREFERENCE_SUBMIT,
      entityType: EntityType.PREFERENCE,
      entityId: validated.teamMemberId,
      after: preferences,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json(preferences, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    console.error("Submit preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

