import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Announcement } from "@/lib/types";
import AnnouncementsManager from "./AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const announcements = (data ?? []) as Announcement[];

  return (
    <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Updates</h1>
        <p className="text-muted text-sm mt-1">
          Announcements shown to students in the portal. Pinned updates stay on
          top.
        </p>
      </div>

      <AnnouncementsManager announcements={announcements} />
    </main>
  );
}
