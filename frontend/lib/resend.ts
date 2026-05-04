import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const NOTIFY_INBOX = "notify@mail.academiahubafrica.org";
export const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@yourdomain.com";

export const LAUNCH_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

/**
 * Add a contact to the persistent main launch audience. Idempotent —
 * Resend returns a validation_error for duplicates which we treat as
 * "already there". Returns the contact id, or null if unavailable.
 */
export async function ensureMainAudienceContact(
  email: string
): Promise<string | null> {
  if (!LAUNCH_AUDIENCE_ID) return null;
  const { data, error } = await resend.contacts.create({
    audienceId: LAUNCH_AUDIENCE_ID,
    email,
    unsubscribed: false,
  });
  if (error) {
    if (error.name === "validation_error") return null;
    throw new Error(`Resend contacts.create failed: ${error.message}`);
  }
  return data?.id ?? null;
}

/** Create a fresh segment for today's welcome broadcast. */
export async function createDailySegment(
  date: string
): Promise<string | null> {
  const { data, error } = await resend.audiences.create({
    name: `launch-welcome-${date}`,
  });
  if (error) {
    throw new Error(`Resend audiences.create failed: ${error.message}`);
  }
  return data?.id ?? null;
}

/** Add an existing contact (by email) to a segment. */
export async function addContactToSegment(
  email: string,
  segmentId: string
): Promise<void> {
  const { error } = await resend.contacts.segments.add({
    email,
    segmentId,
  });
  if (error && error.name !== "validation_error") {
    throw new Error(`Resend segments.add failed: ${error.message}`);
  }
}
