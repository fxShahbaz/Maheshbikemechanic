"use client";

import { useState, useTransition } from "react";
import { submitEnquiry } from "@/app/actions/enquiries";

type Status =
  | { kind: "idle" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function EnquiryForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    setStatus({ kind: "idle" });
    startTransition(async () => {
      const result = await submitEnquiry(formData);
      if (result.ok) {
        setStatus({ kind: "success" });
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    });
  }

  if (status.kind === "success") {
    return (
      <div className="mt-5 rounded-2xl bg-forest text-white p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1410" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-display text-2xl">Thank you!</div>
        <div className="text-white/75 text-sm mt-2">
          We've received your enquiry. Our team will call you shortly.
        </div>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="ghost-btn mt-5 !text-white !border-white/30 hover:!bg-white/10"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="mt-5 space-y-4" action={action}>
      <div>
        <label className="text-sm">Full Name</label>
        <input
          name="name"
          type="text"
          required
          maxLength={120}
          className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="text-sm">Phone Number</label>
        <div className="mt-1 flex items-stretch bg-white border border-line rounded-xl overflow-hidden focus-within:border-forest">
          <span className="inline-flex items-center pl-4 pr-2 text-sm text-muted bg-cream/60 border-r border-line select-none">
            +91
          </span>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            pattern="\d{10}"
            minLength={10}
            maxLength={10}
            required
            className="flex-1 bg-transparent py-3 px-3 text-sm focus:outline-none num-mono"
            placeholder="9876543210"
            onInput={(e) => {
              const target = e.currentTarget;
              target.value = target.value.replace(/\D/g, "").slice(0, 10);
            }}
          />
        </div>
      </div>
      <div>
        <label className="text-sm">City</label>
        <input
          name="city"
          type="text"
          maxLength={120}
          className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
          placeholder="Your city"
        />
      </div>
      <div>
        <label className="text-sm">Interested in</label>
        <select
          name="interest"
          defaultValue="4-month Complete Course"
          className="mt-1 w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest"
        >
          <option>4-month Complete Course</option>
          <option>BS6 Technology only</option>
          <option>EV Training only</option>
          <option>Wiring Training</option>
        </select>
      </div>

      {status.kind === "error" && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="pill-btn w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Sending..." : "Request Callback"}
        {!pending && (
          <span className="arr">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
