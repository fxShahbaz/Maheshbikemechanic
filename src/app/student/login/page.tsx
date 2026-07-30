import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/types";
import { redirect } from "next/navigation";
import StudentAuthForm from "./StudentAuthForm";

export const metadata: Metadata = {
  title: "Student Portal Login",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function StudentLoginPage({
  searchParams,
}: PageProps<"/student/login">) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(isAdminEmail(user.email) ? "/admin/dashboard" : "/student/practice");
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <h1 className="font-display text-3xl">Student Portal</h1>
          <p className="text-muted text-sm mt-2">
            Mahesh Bike Institute &middot; Practice, study material &amp; updates
          </p>
        </div>

        <div className="bg-white border border-line rounded-3xl p-7">
          <StudentAuthForm initialError={error} />
        </div>
      </div>
    </main>
  );
}
