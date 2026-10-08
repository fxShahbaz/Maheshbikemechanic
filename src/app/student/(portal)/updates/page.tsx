import { getStudentProfile } from "@/lib/auth";
import { getUpdatesFeed } from "@/lib/student-portal";
import UpdatesGrid from "./UpdatesGrid";
import { EmptyState, PageHeader } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  const { batch, posts: announcements } = await getUpdatesFeed(profile);
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
