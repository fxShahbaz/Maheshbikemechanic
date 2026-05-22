import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { supabaseServer } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // If already signed in as admin, jump straight to the dashboard
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email === ADMIN_EMAIL) {
    redirect("/admin/enquiries");
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <h1 className="font-display text-3xl">Admin Login</h1>
          <p className="text-muted text-sm mt-2">
            Mahesh Bike Institute · Internal access only
          </p>
        </div>

        <div className="bg-white border border-line rounded-3xl p-7">
          <LoginForm initialError={error} />
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Not the admin? <a href="/" className="underline">Back to homepage</a>
        </p>
      </div>
    </main>
  );
}
