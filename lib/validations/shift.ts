import { z } from "zod";
import { ShiftType, ShiftPriority, Role } from "@prisma/client";

export const shiftRoleSchema = z.object({
  role: z.nativeEnum(Role),
  count: z.number().int().positive().default(1),
});

export const shiftSchemaBase = z.object({
  eventId: z.string().cuid(),
  type: z.nativeEnum(ShiftType),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  priority: z.nativeEnum(ShiftPriority).default("CORE"),
  desirabilityScore: z.number().int().min(1).max(5).default(3),
  requiredRoles: z.array(shiftRoleSchema).min(1),
  capacity: z.number().int().positive().default(2),
  isTemplate: z.boolean().optional().default(false),
});

export const shiftSchema = shiftSchemaBase.refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  },
  { message: "End time must be after start time" }
).refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const calculatedMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return calculatedMinutes === data.durationMinutes;
  },
  { message: "Duration must match time difference" }
);

export const updateShiftSchema = shiftSchemaBase.partial().extend({
  id: z.string().cuid(),
});

export type ShiftInput = z.infer<typeof shiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;

