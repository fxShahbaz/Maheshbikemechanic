"use client";

import { useState, useTransition } from "react";
import { signInWithPassword } from "@/app/actions/auth";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  function action(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await signInWithPassword(formData);
      if (result.ok) {
        router.replace("/admin/enquiries");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function signInWithGoogle() {
    setError(undefined);
    setGooglePending(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setGooglePending(false);
      setError(error.message);
    }
    // On success the browser is redirected to Google; no further action needed
  }

  // Toggle this flag to re-enable Google OAuth once configured in Supabase
  const GOOGLE_SIGN_IN_ENABLED = false;

  return (
    <>
      {GOOGLE_SIGN_IN_ENABLED && (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googlePending || pending}
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-line bg-white hover:bg-cream transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09a6.58 6.58 0 0 1 0-4.18V7.07H2.18a10.997 10.997 0 0 0 0 9.86l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-sm">
              {googlePending ? "Redirecting to Google..." : "Continue with Google"}
            </span>
          </button>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-muted">or with email</span>
            <div className="flex-1 h-px bg-line" />
          </div>
        </>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
            placeholder="team.celvix@gmail.com"
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <PasswordInput autoComplete="current-password" />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || googlePending}
          className="pill-btn w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </>
  );
}
