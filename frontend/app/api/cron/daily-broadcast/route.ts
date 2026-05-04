import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/connection";
import {
  resend,
  EMAIL_FROM,
  NOTIFY_INBOX,
  LAUNCH_AUDIENCE_ID,
  ensureMainAudienceContact,
  createDailySegment,
  addContactToSegment,
} from "@/lib/resend";
import { LaunchDigestEmail } from "@/emails/launch-digest-email";
import { LaunchWelcomeEmail } from "@/emails/launch-welcome-email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!LAUNCH_AUDIENCE_ID) {
    return NextResponse.json(
      { ok: false, error: "RESEND_AUDIENCE_ID is not set" },
      { status: 500 }
    );
  }

  const pending = await prisma.launchSignup.findMany({
    where: { digestedAt: null, unsubscribed: false },
    orderBy: { createdAt: "asc" },
  });

  if (pending.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const date = new Date().toISOString().slice(0, 10);

  // 1. Ensure each pending signup is in the persistent main audience.
  for (const row of pending) {
    if (row.resendContactId) continue;
    try {
      const id = await ensureMainAudienceContact(row.email);
      if (id) {
        await prisma.launchSignup.update({
          where: { id: row.id },
          data: { resendContactId: id },
        });
      }
    } catch {
      // Continue — partial failures are tolerable; will retry tomorrow.
    }
  }

  // 2. Create today's per-day segment and add only today's pending signups.
  // This isolates the welcome broadcast to new contacts only.
  let dailySegmentId: string | null = null;
  try {
    dailySegmentId = await createDailySegment(date);
  } catch {
    // Without a fresh segment we can't safely broadcast — fall through to
    // digest only and let next run retry.
  }

  if (dailySegmentId) {
    for (const row of pending) {
      try {
        await addContactToSegment(row.email, dailySegmentId);
      } catch {
        // Ignore — broadcast may miss this contact this run; persistent
        // audience still has them for the launch-day broadcast.
      }
    }

    try {
      await resend.broadcasts.create({
        audienceId: dailySegmentId,
        from: EMAIL_FROM,
        subject: "You're on the AcademiaHub launch list",
        react: LaunchWelcomeEmail(),
        send: true,
      });
    } catch {
      // Don't fail the run on broadcast errors; digest still goes out.
    }
  }

  // 3. Internal digest to notify@.
  const emails = pending.map((p) => p.email);
  const { error: digestError } = await resend.emails.send({
    from: EMAIL_FROM,
    to: NOTIFY_INBOX,
    subject: `AcademiaHub launch signups — ${date} (${emails.length})`,
    react: LaunchDigestEmail({ emails, date }),
  });
  if (digestError) {
    return NextResponse.json(
      { ok: false, error: digestError.message },
      { status: 500 }
    );
  }

  // 4. Mark all processed.
  await prisma.launchSignup.updateMany({
    where: { id: { in: pending.map((p) => p.id) } },
    data: { digestedAt: new Date() },
  });

  return NextResponse.json({ ok: true, processed: pending.length });
}
