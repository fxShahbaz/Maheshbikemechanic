import { getStudentProfile } from "@/lib/auth";
import { getPracticeData } from "@/lib/student-portal";
import PracticePanel from "./PracticePanel";
import { PageHeader } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  const { sessions, engines } = await getPracticeData(profile);

  return (
    <>
      <PageHeader
        eyebrow={`Hi ${profile.name.split(" ")[0]} 👋`}
        title="Practice"
      />
      <PracticePanel sessions={sessions} engines={engines} />
    </>
  );
}
