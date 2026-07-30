import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser, getStudentProfile } from "@/lib/auth";
import { hasActiveAccess, isAdminEmail } from "@/lib/types";
import { signOutStudent } from "@/app/actions/student-auth";
import StudentShell from "./StudentShell";

export const metadata: Metadata = {
  title: "Student Portal",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/student/login");
  }
  if (isAdminEmail(user.email)) {
    redirect("/admin/dashboard");
  }

  const profile = await getStudentProfile();
  if (!profile) {
    redirect("/student/login");
  }

  if (!hasActiveAccess(profile)) {
    const expired =
      profile.status === "active" && profile.access_expires_at != null;
    const heading =
      profile.status === "pending"
        ? "Awaiting approval"
        : expired
          ? "Access expired"
          : "Access deactivated";
    const message =
      profile.status === "pending"
        ? "Your account has been created. The institute will review and approve your access soon — check back here or contact the office."
        : expired
          ? `Your portal access ended on ${profile.access_expires_at}. Contact the institute to extend it.`
          : "Your portal access has been turned off. Contact the institute if you think this is a mistake.";

    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-cream">
        <div className="max-w-md text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <h1 className="font-display text-3xl">{heading}</h1>
          <p className="text-muted text-sm mt-3">{message}</p>
          <p className="text-xs text-muted mt-4">
            Signed in as{" "}
            <code className="px-1.5 py-0.5 rounded bg-white border border-line">
              {profile.email}
            </code>
          </p>
          <form action={signOutStudent} className="mt-6">
            <button type="submit" className="pill-btn">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <StudentShell
      student={{
        name: profile.name,
        email: profile.email,
        accessExpiresAt: profile.access_expires_at,
      }}
    >
      {children}
    </StudentShell>
  );
}
