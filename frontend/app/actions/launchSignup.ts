"use server";

import { headers } from "next/headers";
import prisma from "@/prisma/connection";
import { launchSignupSchema } from "@/lib/schemas/launchSignupSchema";
import { launchSignupLimiter } from "@/lib/ratelimit";
import type { LaunchSignupState } from "./launchSignupTypes";

const SUCCESS_MESSAGE =
  "You're on the list. We'll let you know when we launch.";

export async function submitLaunchSignup(
  _prev: LaunchSignupState,
  formData: FormData
): Promise<LaunchSignupState> {
  const parsed = launchSignupSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  const { success } = await launchSignupLimiter.limit(ip);
  if (!success) {
    return {
      status: "error",
      message: "Too many attempts. Please try again later.",
    };
  }

  const { email } = parsed.data;

  const existing = await prisma.launchSignup.findUnique({ where: { email } });
  if (existing) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  await prisma.launchSignup.create({ data: { email } });

  return { status: "success", message: SUCCESS_MESSAGE };
}
