"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInStudent, signUpStudent } from "@/app/actions/student-auth";
import PasswordInput from "@/components/PasswordInput";

type Mode = "signin" | "signup";

const inputClass =
  "mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest";

export default function StudentAuthForm({
  initialError,
}: {
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(initialError);

  function switchMode(next: Mode) {
    setMode(next);
    setError(undefined);
  }

  function action(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result =
        mode === "signin"
          ? await signInStudent(formData)
          : await signUpStudent(formData);
      if (result.ok) {
        router.replace("/student/practice");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-cream mb-6">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => switchMode(value)}
            className={[
              "py-2 rounded-lg text-sm font-medium transition",
              mode === value ? "bg-white shadow-sm" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="text-sm">Full name</label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm">Phone</label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="98765 43210"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-sm">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <PasswordInput
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="pill-btn w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      {mode === "signup" && (
        <p className="text-xs text-muted mt-4">
          New accounts need approval from the institute before the portal
          unlocks. You&apos;ll be able to sign in right away and see your
          approval status.
        </p>
      )}
    </>
  );
}
