import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { findStudentAdmission, studentBatch } from "@/lib/student-admission";
import { isAdminEmail } from "@/lib/types";
import type {
  Admission,
  Announcement,
  Payment,
  PracticeSession,
  StudentProfile,
  StudyMaterial,
} from "@/lib/types";

/**
 * Student portal data + mutations, shared by the web portal (pages and
 * server actions) and the mobile app's JSON API under /api/student.
 * Callers are responsible for authenticating and gating the profile.
 */

type Result = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY = 24 * 60 * 60 * 1000;

export const MATERIALS_BUCKET = "study-materials";

// ============== Access gate ==============

/** Lock-screen copy for a signed-in student who can't use the portal yet. */
export function accessLock(
  profile: Pick<StudentProfile, "status" | "access_expires_at">
): { heading: string; message: string } {
  const expired =
    profile.status === "active" && profile.access_expires_at != null;
  if (profile.status === "pending") {
    return {
      heading: "Awaiting approval",
      message:
        "Your account has been created. The institute will review and approve your access soon — check back here or contact the office.",
    };
  }
  if (expired) {
    return {
      heading: "Access expired",
      message: `Your portal access ended on ${profile.access_expires_at}. Contact the institute to extend it.`,
    };
  }
  return {
    heading: "Access deactivated",
    message:
      "Your portal access has been turned off. Contact the institute if you think this is a mistake.",
  };
}

// ============== Signup ==============

/**
 * Create a pending student account. Created pre-confirmed via the service
 * role: no confirmation email, so Supabase's built-in email sender (and its
 * tight rate limit) is never hit. Admin approval on the profile is the real
 * gate. The caller signs the student in afterwards.
 */
export async function createStudentAccount(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Result> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const password = input.password;

  if (!name) return { ok: false, error: "Name is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (isAdminEmail(email)) {
    return { ok: false, error: "This email belongs to the admin panel." };
  }

  const admin = supabaseAdmin();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone: phone || null },
    });

  if (createError || !created.user) {
    const exists =
      createError?.code === "email_exists" ||
      /already.*registered/i.test(createError?.message ?? "");
    return {
      ok: false,
      error: exists
        ? "An account with this email already exists. Sign in instead."
        : (createError?.message ?? "Could not create the account."),
    };
  }

  const { error: profileError } = await admin.from("student_profiles").upsert(
    {
      user_id: created.user.id,
      name,
      email,
      phone: phone || null,
      status: "pending",
    },
    { onConflict: "user_id" }
  );
  if (profileError) return { ok: false, error: profileError.message };

  return { ok: true };
}

// ============== Practice ==============

export type EngineOption = { name: string; brand: string | null };

export async function getPracticeData(profile: StudentProfile): Promise<{
  sessions: PracticeSession[];
  engines: EngineOption[];
}> {
  const supabase = supabaseAdmin();
  const [{ data }, { data: engineRows }] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", profile.id)
      .order("punched_in_at", { ascending: false })
      .limit(200),
    supabase
      .from("engines")
      .select("name, brand")
      .eq("active", true)
      .order("sort_order")
      .order("name"),
  ]);
  return {
    sessions: (data ?? []) as PracticeSession[],
    engines: (engineRows ?? []) as EngineOption[],
  };
}

export async function startPractice(
  profile: StudentProfile,
  rawEngine: string,
  rawNotes: string
): Promise<Result> {
  const engine = rawEngine.trim();
  const notes = rawNotes.trim();
  if (!engine) return { ok: false, error: "Enter the engine number / name." };

  const supabase = supabaseAdmin();

  // When the admin has defined an engine list, the punch-in must be one of
  // the active engines; free text is only allowed while the list is empty.
  const { count: engineCount } = await supabase
    .from("engines")
    .select("id", { count: "exact", head: true });
  if ((engineCount ?? 0) > 0) {
    const { data: match } = await supabase
      .from("engines")
      .select("id")
      .eq("name", engine)
      .eq("active", true)
      .maybeSingle();
    if (!match) {
      return { ok: false, error: "Select an engine from the list." };
    }
  }

  const { data: open } = await supabase
    .from("practice_sessions")
    .select("id")
    .eq("student_id", profile.id)
    .is("punched_out_at", null)
    .limit(1);
  if (open && open.length > 0) {
    return { ok: false, error: "You already have an open session. Punch out first." };
  }

  const { error } = await supabase.from("practice_sessions").insert({
    student_id: profile.id,
    engine,
    notes: notes || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function endPractice(
  profile: StudentProfile,
  sessionId: string
): Promise<Result> {
  const { data, error } = await supabaseAdmin()
    .from("practice_sessions")
    .update({ punched_out_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("student_id", profile.id)
    .is("punched_out_at", null)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Session not found or already punched out." };
  }
  return { ok: true };
}

// ============== Study material ==============

export async function listMaterials(): Promise<StudyMaterial[]> {
  const { data } = await supabaseAdmin()
    .from("study_materials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as StudyMaterial[];
}

export async function getMaterial(id: string): Promise<StudyMaterial | null> {
  const { data } = await supabaseAdmin()
    .from("study_materials")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  return (data as StudyMaterial) ?? null;
}

/** Streams a material's PDF; never cached, inline only. */
export async function materialFileResponse(
  id: string,
  { includeUnpublished = false } = {}
): Promise<Response> {
  const supabase = supabaseAdmin();
  let query = supabase.from("study_materials").select("storage_path").eq("id", id);
  if (!includeUnpublished) query = query.eq("published", true);
  const { data: material } = await query.maybeSingle();
  if (!material) return new Response("Not found", { status: 404 });

  const { data: blob, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .download(material.storage_path);
  if (error || !blob) return new Response("Not found", { status: 404 });

  return new Response(blob.stream(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(blob.size),
      // inline + no-store: viewable in the app, never cached to disk
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

// ============== Updates ==============

export type FeedPost = Announcement & {
  isNew: boolean;
  /** Relative time ("3h", "2d"); null once older than a week. */
  ago: string | null;
  /** "Batch 28" when targeted at the student's batch; null = everyone. */
  audience: string | null;
};

/** Days between two instants, counted on IST calendar dates. */
function istDaysAgo(iso: string, now: number): number {
  const day = (t: number) => Math.floor((t + 5.5 * 60 * 60 * 1000) / DAY);
  return day(now) - day(new Date(iso).getTime());
}

function decorate(rows: Announcement[], batch: string | null): FeedPost[] {
  const now = Date.now();
  return rows.map((a) => {
    const days = istDaysAgo(a.created_at, now);
    const mins = Math.max(0, Math.floor((now - new Date(a.created_at).getTime()) / 60000));
    const ago =
      mins < 1
        ? "Just now"
        : mins < 60
          ? `${mins}m`
          : days === 0
            ? `${Math.floor(mins / 60)}h`
            : days < 7
              ? `${days}d`
              : null;
    return {
      ...a,
      isNew: now - new Date(a.created_at).getTime() < 7 * DAY,
      ago,
      audience: a.batches?.length ? `Batch ${batch ?? a.batches[0]}` : null,
    };
  });
}

/** Published announcements visible to this student, pinned first. */
export async function getUpdatesFeed(profile: StudentProfile): Promise<{
  batch: string | null;
  posts: FeedPost[];
}> {
  const admission = await findStudentAdmission(profile);
  const batch = studentBatch(profile, admission);

  const { data } = await supabaseAdmin()
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Empty batches = all students; otherwise only the listed batches
  const visible = ((data ?? []) as Announcement[]).filter(
    (a) => !a.batches?.length || (batch !== null && a.batches.includes(batch))
  );
  return { batch, posts: decorate(visible, batch) };
}

// ============== Profile / fees ==============

export type FeeSummary = {
  paid: number;
  total: number | null;
  due: number | null;
  /** Percent paid, 0–100; null when no total fee is set. */
  pct: number | null;
};

export async function getProfileDetails(profile: StudentProfile): Promise<{
  admission: Admission | null;
  fees: FeeSummary | null;
}> {
  const admission = await findStudentAdmission(profile);
  if (!admission) return { admission: null, fees: null };

  const { data: payments } = await supabaseAdmin()
    .from("payments")
    .select("amount")
    .eq("admission_id", admission.id);
  const paid = ((payments ?? []) as Pick<Payment, "amount">[]).reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const total = admission.total_fee;
  return {
    admission,
    fees: {
      paid,
      total,
      due: total != null ? Math.max(0, total - paid) : null,
      pct:
        total != null && total > 0
          ? Math.min(100, Math.round((paid / total) * 100))
          : null,
    },
  };
}
