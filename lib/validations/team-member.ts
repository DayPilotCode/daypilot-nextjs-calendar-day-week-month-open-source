import { z } from "zod";
import { ExperienceLevel, Role } from "@prisma/client";

export const teamMemberSchema = z.object({
  alias: z.string().min(1).max(50),
  avatarId: z.string().min(1),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  genderRole: z.string().min(1),
  capabilities: z.array(z.nativeEnum(Role)).min(1),
  isActive: z.boolean().optional().default(true),
});

export const updateTeamMemberSchema = teamMemberSchema.partial().extend({
  id: z.string().cuid(),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

