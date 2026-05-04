import { z } from "zod";

export const launchSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type LaunchSignupInput = z.infer<typeof launchSignupSchema>;
