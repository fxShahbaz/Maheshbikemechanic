"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unlockPayments } from "./unlock-actions";

export default function PinGate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function action(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await unlockPayments(formData);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <h1 className="font-display text-2xl">Payments locked</h1>
          <p className="text-muted text-sm mt-2">
            Enter the PIN to view payment records.
          </p>
        </div>

        <div className="bg-white border border-line rounded-3xl p-6">
          <form action={action} className="space-y-4">
            <div>
              <label className="text-sm">PIN</label>
              <input
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                required
                autoFocus
                className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm tracking-widest focus:outline-none focus:border-forest"
                placeholder="••••"
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
              {pending ? "Unlocking..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
