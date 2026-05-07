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
    where: {
      OR: [{ digestedAt: null }, { digestedAt: { isSet: false } }],
      NOT: { unsubscribed: true },
    },
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
  const errors: string[] = [];
  let dailySegmentId: string | null = null;
  try {
    dailySegmentId = await createDailySegment(date);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("daily-broadcast: createDailySegment failed", err);
    errors.push(`createDailySegment: ${msg}`);
  }

  let broadcastSent = false;
  let segmentAddFailures = 0;
  if (dailySegmentId) {
    for (const row of pending) {
      try {
        await addContactToSegment(row.email, dailySegmentId);
      } catch (err) {
        segmentAddFailures++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `daily-broadcast: addContactToSegment failed for ${row.email}`,
          err
        );
        errors.push(`addContactToSegment[${row.email}]: ${msg}`);
      }
    }

    try {
      await resend.broadcasts.create({
        segmentId: dailySegmentId,
        from: EMAIL_FROM,
        subject: "You're on the AcademiaHub launch list",
        react: LaunchWelcomeEmail(),
        send: true,
      });
      broadcastSent = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("daily-broadcast: broadcast failed", err);
      errors.push(`broadcasts.create: ${msg}`);
    }
  }

  // 3. Mark rows processed only if the welcome was actually delivered.
  // Leaving them with digestedAt: null lets tomorrow's run retry cleanly.
  if (broadcastSent) {
    await prisma.launchSignup.updateMany({
      where: { id: { in: pending.map((p) => p.id) } },
      data: { digestedAt: new Date() },
    });
  }

  // 4. Internal digest to notify@. Best-effort — failure must not undo
  // the digestedAt mark above, otherwise subscribers get duplicate
  // welcomes tomorrow.
  const emails = pending.map((p) => p.email);
  const { error: digestError } = await resend.emails.send({
    from: EMAIL_FROM,
    to: NOTIFY_INBOX,
    subject: `AcademiaHub launch signups — ${date} (${emails.length})`,
    react: LaunchDigestEmail({ emails, date }),
  });
  if (digestError) {
    console.error("daily-broadcast: digest failed", digestError.message);
    errors.push(`digest: ${digestError.message}`);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    processed: broadcastSent ? pending.length : 0,
    skipped: broadcastSent ? 0 : pending.length,
    segmentAddFailures,
    digestSent: !digestError,
    errors,
  });
}
