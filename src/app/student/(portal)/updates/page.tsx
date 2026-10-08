import { getStudentProfile } from "@/lib/auth";
import { findStudentAdmission, studentBatch } from "@/lib/student-admission";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Announcement } from "@/lib/types";
import UpdatesGrid from "./UpdatesGrid";
import type { FeedPost } from "./UpdatesGrid";
import { EmptyState, PageHeader } from "../_components/ui";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

/** Days between two instants, counted on IST calendar dates. */
function istDaysAgo(iso: string, now: number): number {
  const day = (t: number) => Math.floor((t + 5.5 * 60 * 60 * 1000) / DAY);
  return day(now) - day(new Date(iso).getTime());
}

// Computed on the server so the client render matches exactly
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

export default async function UpdatesPage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  const supabase = supabaseAdmin();
  const admission = await findStudentAdmission(profile);
  const batch = studentBatch(profile, admission);

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Empty batches = all students; otherwise only the listed batches
  const visible = ((data ?? []) as Announcement[]).filter(
    (a) => !a.batches?.length || (batch !== null && a.batches.includes(batch))
  );
  const announcements = decorate(visible, batch);
  const newCount = announcements.filter((a) => a.isNew).length;

  return (
    <>
      <PageHeader
        title="Updates"
        subtitle={
          newCount > 0
            ? `${newCount} new this week${batch ? ` · Batch ${batch}` : ""}`
            : `News and notices from the institute${batch ? ` · Batch ${batch}` : ""}`
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-5v12L3 14v-3z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          }
          title="No updates yet"
          text="Announcements from the institute will show up here."
        />
      ) : (
        <UpdatesGrid announcements={announcements} />
      )}
    </>
  );
}
