import { getStudentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  formatINR,
  hasActiveAccess,
  maskAadhar,
  type Admission,
  type Payment,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function last10(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateOnly(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const profile = await getStudentProfile();
  if (!profile) return null; // layout guard already redirects

  // Link the portal account to the admission record by email, else phone
  const supabase = supabaseAdmin();
  const { data: admissionRows } = await supabase
    .from("admissions")
    .select("*");
  const admissions = (admissionRows ?? []) as Admission[];

  const email = profile.email.toLowerCase();
  const phone = last10(profile.phone);
  const admission =
    admissions.find((a) => (a.email ?? "").toLowerCase() === email) ??
    (phone ? admissions.find((a) => last10(a.phone) === phone) : undefined) ??
    null;

  let paid = 0;
  if (admission) {
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("admission_id", admission.id);
    paid = ((payments ?? []) as Pick<Payment, "amount">[]).reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );
  }

  const active = hasActiveAccess(profile);
  const due =
    admission?.total_fee != null ? Math.max(0, admission.total_fee - paid) : null;
  const pct =
    admission?.total_fee != null && admission.total_fee > 0
      ? Math.min(100, Math.round((paid / admission.total_fee) * 100))
      : null;

  return (
    <>
      {/* Identity */}
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink text-lime font-display text-2xl shrink-0">
          {profile.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl md:text-4xl leading-tight">
            {profile.name}
          </h1>
          <p className="text-muted text-sm mt-1 truncate">
            {profile.email}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portal access */}
        <section className="bg-ink text-white rounded-3xl p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl">Portal access</h2>
            <span
              className={[
                "text-[10px] uppercase tracking-wider font-semibold rounded-full px-2.5 py-1",
                active ? "bg-lime text-ink" : "bg-white/15 text-white/80",
              ].join(" ")}
            >
              {active ? "Active" : profile.status === "pending" ? "Pending" : "Inactive"}
            </span>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Access valid till</dt>
              <dd className="num-mono">
                {profile.access_expires_at
                  ? formatDateOnly(profile.access_expires_at)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Approved on</dt>
              <dd>
                {profile.approved_at ? formatDate(profile.approved_at) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/60">Account created</dt>
              <dd>{formatDate(profile.created_at)}</dd>
            </div>
          </dl>
        </section>

        {/* Admission record */}
        <section className="bg-white border border-line rounded-3xl p-6">
          <h2 className="font-display text-xl">Admission details</h2>
          {admission ? (
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Batch" value={admission.batch_no ?? "—"} />
              <Row
                label="Joined"
                value={formatDate(admission.created_at)}
              />
              <Row
                label="Age"
                value={admission.age != null ? String(admission.age) : "—"}
              />
              <Row label="Address" value={admission.address ?? "—"} />
              <Row label="Aadhar" value={maskAadhar(admission.aadhar_no)} />
              <Row
                label="Family contact"
                value={
                  admission.family_name
                    ? `${admission.family_name}${admission.family_relation ? ` (${admission.family_relation})` : ""}${admission.family_phone ? ` · ${admission.family_phone}` : ""}`
                    : "—"
                }
              />
            </dl>
          ) : (
            <p className="text-muted text-sm mt-4">
              No admission record is linked to this account yet. Contact the
              institute office if your course details should appear here.
            </p>
          )}
        </section>
      </div>

      {/* Fees */}
      {admission && (
        <section className="mt-4 bg-white border border-line rounded-3xl p-6">
          <h2 className="font-display text-xl">Fees</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <FeeStat label="Total fee" value={formatINR(admission.total_fee)} />
            <FeeStat label="Paid" value={formatINR(paid)} accent="lime" />
            <FeeStat
              label="Balance"
              value={due != null ? formatINR(due) : "—"}
              accent={due != null && due > 0 ? "amber" : undefined}
            />
          </div>
          {pct != null && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-line overflow-hidden">
                <div
                  className={`h-full ${pct >= 100 ? "bg-emerald-500" : "bg-forest"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-2">
                {pct}% of the course fee paid. For payments, contact the
                institute office.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function FeeStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "lime" | "amber";
}) {
  const accentClasses =
    accent === "lime"
      ? "bg-lime border-lime"
      : accent === "amber"
        ? "bg-amber-100 border-amber-200"
        : "bg-cream/60 border-line";
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${accentClasses}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="font-display num-mono text-lg leading-tight mt-1">
        {value}
      </div>
    </div>
  );
}
