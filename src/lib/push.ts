import "server-only";

import { matchAdmission } from "@/lib/student-admission";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hasActiveAccess } from "@/lib/types";
import type { Admission, Announcement, StudentProfile } from "@/lib/types";

/**
 * Announcement pushes to the mobile app via Expo's push service. Devices
 * register their Expo push token through /api/student/push-token.
 * Set EXPO_ACCESS_TOKEN if "enhanced push security" is on in Expo.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
/** Expo accepts at most 100 messages per request. */
const BATCH = 100;
/** Android channel created by the app (src/lib/push.ts there). */
const CHANNEL = "announcements";

type TokenRow = {
  token: string;
  student: Pick<StudentProfile, "status" | "access_expires_at" | "batch_no" | "email" | "phone"> | null;
};

type Ticket = { status: "ok" | "error"; details?: { error?: string } };

/** Tokens of active students the announcement is visible to. */
async function audienceTokens(a: Pick<Announcement, "batches">): Promise<string[]> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("push_tokens")
    .select("token, student:student_profiles(status, access_expires_at, batch_no, email, phone)");
  const rows = ((data ?? []) as unknown as TokenRow[]).filter(
    (r) => r.student && hasActiveAccess(r.student)
  );
  if (!a.batches?.length) return rows.map((r) => r.token);

  // Same rule as the Updates feed: account batch, else the admission's
  const { data: admissions } = await supabase.from("admissions").select("email, phone, batch_no");
  const list = (admissions ?? []) as Pick<Admission, "email" | "phone" | "batch_no">[];
  return rows
    .filter((r) => {
      const batch =
        r.student!.batch_no?.trim() || matchAdmission(r.student!, list)?.batch_no?.trim() || null;
      return batch !== null && a.batches.includes(batch);
    })
    .map((r) => r.token);
}

function preview(body: string | null): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "New announcement from the institute";
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

/**
 * Sends a published announcement to every targeted student's devices,
 * once: claims it via pushed_at first so concurrent saves can't double-send.
 */
export async function pushAnnouncement(id: string): Promise<void> {
  const supabase = supabaseAdmin();
  const { data: claimed } = await supabase
    .from("announcements")
    .update({ pushed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("published", true)
    .is("pushed_at", null)
    .select("id, title, body, batches")
    .maybeSingle();
  if (!claimed) return;

  const a = claimed as Pick<Announcement, "id" | "title" | "body" | "batches">;
  const tokens = await audienceTokens(a);
  const dead: string[] = [];

  for (let i = 0; i < tokens.length; i += BATCH) {
    const chunk = tokens.slice(i, i + BATCH);
    const messages = chunk.map((to) => ({
      to,
      title: a.title,
      body: preview(a.body),
      data: { type: "announcement", id: a.id },
      sound: "default",
      priority: "high",
      channelId: CHANNEL,
    }));
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(process.env.EXPO_ACCESS_TOKEN && {
            Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(messages),
      });
      const json = (await res.json().catch(() => null)) as { data?: Ticket[] } | null;
      if (!res.ok) {
        console.error("[push] Expo push failed", res.status, json);
        continue;
      }
      json?.data?.forEach((t, j) => {
        if (t.status === "error" && t.details?.error === "DeviceNotRegistered") dead.push(chunk[j]);
        else if (t.status === "error") console.error("[push] ticket error", t);
      });
    } catch (e) {
      console.error("[push] Expo push request failed", e);
    }
  }

  // App uninstalled or notifications reset: stop sending to these
  if (dead.length) await supabase.from("push_tokens").delete().in("token", dead);
}
