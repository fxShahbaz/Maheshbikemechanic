import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Announcement } from "@/lib/types";
import UpdatesGrid from "./UpdatesGrid";
import type { AnnouncementWithNew } from "./UpdatesGrid";

export const dynamic = "force-dynamic";

function markNew(rows: Announcement[]): AnnouncementWithNew[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return rows.map((a) => ({
    ...a,
    isNew: new Date(a.created_at).getTime() > weekAgo,
  }));
}

export default async function UpdatesPage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const announcements = markNew((data ?? []) as Announcement[]);

  return (
    <>
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Updates</h1>
        <p className="text-muted text-sm mt-1">
          Announcements from the institute.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="mt-8 bg-white border border-line rounded-3xl px-6 py-14 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cream text-forest mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-5v12L3 14v-3z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          </span>
          <p className="text-muted text-sm">
            No announcements yet — check back soon.
          </p>
        </div>
      ) : (
        <UpdatesGrid announcements={announcements} />
      )}
    </>
  );
}
