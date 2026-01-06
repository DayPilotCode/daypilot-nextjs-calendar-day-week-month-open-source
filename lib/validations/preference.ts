import { z } from "zod";

export const preferenceSchema = z.object({
  shiftId: z.string().cuid(),
  priority: z.number().int().min(1).max(5).default(1),
  notes: z.string().optional(),
});

export const preferencesSubmissionSchema = z.object({
  teamMemberId: z.string().cuid(),
  preferences: z.array(preferenceSchema).min(2, "Minimum 2 shifts required"),
});

export type PreferenceInput = z.infer<typeof preferenceSchema>;
export type PreferencesSubmissionInput = z.infer<typeof preferencesSubmissionSchema>;

