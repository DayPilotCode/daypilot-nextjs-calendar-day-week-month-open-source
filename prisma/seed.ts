import {
  AssignmentType,
  EventStatus,
  PrismaClient,
  Role,
  ShiftPriority,
  ShiftType,
} from "@prisma/client";

const prisma = new PrismaClient();

const EVENT_ID = "event_starlight_2026";
const EVENT_NAME = "Starlight Meadow Festival 2026";

const teamMembers = [
  { alias: "Bunny", avatarId: "🐰", experienceLevel: "JUNIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Otter", avatarId: "🦦", experienceLevel: "JUNIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Chipmunk", avatarId: "🐿️", experienceLevel: "JUNIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Hedgehog", avatarId: "🦔", experienceLevel: "JUNIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Squirrel", avatarId: "🐿️", experienceLevel: "JUNIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Robin", avatarId: "🐦", experienceLevel: "JUNIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Finch", avatarId: "🐦", experienceLevel: "JUNIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Duckling", avatarId: "🦆", experienceLevel: "JUNIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Fawn", avatarId: "🦌", experienceLevel: "JUNIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Kitten", avatarId: "🐱", experienceLevel: "JUNIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },

  { alias: "Fox", avatarId: "🦊", experienceLevel: "INTERMEDIATE", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Badger", avatarId: "🦡", experienceLevel: "INTERMEDIATE", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Raccoon", avatarId: "🦝", experienceLevel: "INTERMEDIATE", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Panda", avatarId: "🐼", experienceLevel: "INTERMEDIATE", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Koala", avatarId: "🐨", experienceLevel: "INTERMEDIATE", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Owl", avatarId: "🦉", experienceLevel: "INTERMEDIATE", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Peacock", avatarId: "🦚", experienceLevel: "INTERMEDIATE", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Swan", avatarId: "🦢", experienceLevel: "INTERMEDIATE", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Deer", avatarId: "🦌", experienceLevel: "INTERMEDIATE", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER] },
  { alias: "Lynx", avatarId: "🐆", experienceLevel: "INTERMEDIATE", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER] },

  { alias: "Wolf", avatarId: "🐺", experienceLevel: "SENIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
  { alias: "Bear", avatarId: "🐻", experienceLevel: "SENIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD] },
  { alias: "Eagle", avatarId: "🦅", experienceLevel: "SENIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
  { alias: "Hawk", avatarId: "🦅", experienceLevel: "SENIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD] },
  { alias: "Lion", avatarId: "🦁", experienceLevel: "SENIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
  { alias: "Tiger", avatarId: "🐯", experienceLevel: "SENIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
  { alias: "Falcon", avatarId: "🦅", experienceLevel: "SENIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD] },
  { alias: "Leopard", avatarId: "🐆", experienceLevel: "SENIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD] },
  { alias: "Panther", avatarId: "🐆", experienceLevel: "SENIOR", genderRole: "M_NB", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
  { alias: "Jaguar", avatarId: "🐆", experienceLevel: "SENIOR", genderRole: "FLINTA", capabilities: [Role.TEAM_MEMBER, Role.SHIFT_LEAD, Role.EXECUTIVE] },
];

const shifts = [
  {
    id: "shift_buffer_jun11_mobile1",
    type: ShiftType.MOBILE_TEAM_1,
    startTime: "2026-06-11T18:00:00.000Z",
    endTime: "2026-06-12T00:00:00.000Z",
    durationMinutes: 360,
    priority: ShiftPriority.BUFFER,
    desirabilityScore: 3,
    capacity: 2,
    requiredRoles: [
      { role: Role.TEAM_MEMBER, count: 2 },
    ],
  },
  {
    id: "shift_core_jun26_stationary_morning",
    type: ShiftType.STATIONARY,
    startTime: "2026-06-26T08:00:00.000Z",
    endTime: "2026-06-26T14:00:00.000Z",
    durationMinutes: 360,
    priority: ShiftPriority.CORE,
    desirabilityScore: 4,
    capacity: 2,
    requiredRoles: [
      { role: Role.SHIFT_LEAD, count: 1 },
      { role: Role.TEAM_MEMBER, count: 1 },
    ],
  },
  {
    id: "shift_core_jun27_night_mobile2",
    type: ShiftType.MOBILE_TEAM_2,
    startTime: "2026-06-27T22:00:00.000Z",
    endTime: "2026-06-28T04:00:00.000Z",
    durationMinutes: 360,
    priority: ShiftPriority.CORE,
    desirabilityScore: 1,
    capacity: 2,
    requiredRoles: [
      { role: Role.TEAM_MEMBER, count: 2 },
    ],
  },
  {
    id: "shift_core_jun28_day_mobile1",
    type: ShiftType.MOBILE_TEAM_1,
    startTime: "2026-06-28T14:00:00.000Z",
    endTime: "2026-06-28T20:00:00.000Z",
    durationMinutes: 360,
    priority: ShiftPriority.CORE,
    desirabilityScore: 2,
    capacity: 2,
    requiredRoles: [
      { role: Role.TEAM_MEMBER, count: 2 },
    ],
  },
  {
    id: "shift_core_jun29_morning_stationary",
    type: ShiftType.STATIONARY,
    startTime: "2026-06-29T06:00:00.000Z",
    endTime: "2026-06-29T12:00:00.000Z",
    durationMinutes: 360,
    priority: ShiftPriority.CORE,
    desirabilityScore: 1,
    capacity: 2,
    requiredRoles: [
      { role: Role.SHIFT_LEAD, count: 1 },
      { role: Role.TEAM_MEMBER, count: 1 },
    ],
  },
  {
    id: "shift_core_jun27_executive",
    type: ShiftType.EXECUTIVE,
    startTime: "2026-06-27T08:00:00.000Z",
    endTime: "2026-06-27T20:00:00.000Z",
    durationMinutes: 720,
    priority: ShiftPriority.CORE,
    desirabilityScore: 3,
    capacity: 1,
    requiredRoles: [
      { role: Role.EXECUTIVE, count: 1 },
    ],
  },
];

async function seedTeam() {
  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { alias: member.alias },
      update: {
        avatarId: member.avatarId,
        experienceLevel: member.experienceLevel as any,
        genderRole: member.genderRole,
        capabilities: member.capabilities,
        isActive: true,
      },
      create: {
        alias: member.alias,
        avatarId: member.avatarId,
        experienceLevel: member.experienceLevel as any,
        genderRole: member.genderRole,
        capabilities: member.capabilities,
      },
    });
  }
}

async function seedEvent() {
  await prisma.event.upsert({
    where: { id: EVENT_ID },
    update: {
      name: EVENT_NAME,
      startDate: new Date("2026-06-11T00:00:00.000Z"),
      endDate: new Date("2026-07-08T23:59:59.000Z"),
      status: EventStatus.PLANNING,
    },
    create: {
      id: EVENT_ID,
      name: EVENT_NAME,
      startDate: new Date("2026-06-11T00:00:00.000Z"),
      endDate: new Date("2026-07-08T23:59:59.000Z"),
      status: EventStatus.PLANNING,
    },
  });

  await prisma.eventConfig.upsert({
    where: { eventId: EVENT_ID },
    update: {
      minShiftsPerPerson: 2,
      algorithmWeights: {
        preferenceMatch: 0.35,
        experienceBalance: 0.25,
        workloadFairness: 0.15,
        coreShiftCoverage: 0.05,
        genderBalance: "HARD_CONSTRAINT",
      },
      balanceThresholds: {
        minGenderBalance: 0.3,
        minExperienceMix: true,
        maxConsecutiveShifts: 3,
      },
      autoAssignUnfilled: true,
    },
    create: {
      eventId: EVENT_ID,
      minShiftsPerPerson: 2,
      algorithmWeights: {
        preferenceMatch: 0.35,
        experienceBalance: 0.25,
        workloadFairness: 0.15,
        coreShiftCoverage: 0.05,
        genderBalance: "HARD_CONSTRAINT",
      },
      balanceThresholds: {
        minGenderBalance: 0.3,
        minExperienceMix: true,
        maxConsecutiveShifts: 3,
      },
      autoAssignUnfilled: true,
    },
  });
}

async function seedShifts() {
  for (const shift of shifts) {
    const record = await prisma.shift.upsert({
      where: { id: shift.id },
      update: {
        eventId: EVENT_ID,
        type: shift.type,
        startTime: new Date(shift.startTime),
        endTime: new Date(shift.endTime),
        durationMinutes: shift.durationMinutes,
        priority: shift.priority,
        desirabilityScore: shift.desirabilityScore,
        capacity: shift.capacity,
        isTemplate: false,
      },
      create: {
        id: shift.id,
        eventId: EVENT_ID,
        type: shift.type,
        startTime: new Date(shift.startTime),
        endTime: new Date(shift.endTime),
        durationMinutes: shift.durationMinutes,
        priority: shift.priority,
        desirabilityScore: shift.desirabilityScore,
        capacity: shift.capacity,
        isTemplate: false,
      },
    });

    for (const role of shift.requiredRoles) {
      await prisma.shiftRole.upsert({
        where: {
          shiftId_role: {
            shiftId: record.id,
            role: role.role,
          },
        },
        update: { count: role.count },
        create: {
          shiftId: record.id,
          role: role.role,
          count: role.count,
        },
      });
    }
  }
}

async function seedSystemConfig() {
  await prisma.systemConfig.upsert({
    where: { key: "session_timeout_minutes" },
    update: { value: 60 },
    create: { key: "session_timeout_minutes", value: 60 },
  });

  await prisma.systemConfig.upsert({
    where: { key: "default_avatar_set" },
    update: { value: teamMembers.map((t) => t.avatarId) },
    create: { key: "default_avatar_set", value: teamMembers.map((t) => t.avatarId) },
  });
}

async function resetForSeed() {
  await prisma.assignment.deleteMany();
  await prisma.shiftPreference.deleteMany();
  await prisma.shiftRole.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.eventConfig.deleteMany();
  await prisma.event.deleteMany();
  await prisma.teamMember.deleteMany();
}

async function main() {
  await resetForSeed();
  await seedTeam();
  await seedEvent();
  await seedShifts();
  await seedSystemConfig();
}

main()
  .then(async () => {
    console.log("✓ Seed data written");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

