import { getStudentProfile } from "@/lib/auth";
import { findStudentAdmission } from "@/lib/student-admission";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signOutStudent } from "@/app/actions/student-auth";
import { Group, InfoRow, SectionLabel } from "../_components/ui";
import {
  formatINR,
  hasActiveAccess,
  maskAadhar,
  type Payment,
} from "@/lib/types";

export const dynamic = "force-dynamic";

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

  const supabase = supabaseAdmin();
  const admission = await findStudentAdmission(profile);

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

  const statusLabel = active
    ? "Active"
    : profile.status === "pending"
      ? "Pending"
      : "Inactive";

  return (
    <>
      {/* Identity */}
      <div className="pt-4 flex flex-col items-center text-center">
        <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ink text-lime font-display text-3xl">
          {profile.name.trim().charAt(0).toUpperCase()}
        </span>
        <h1 className="font-display text-2xl leading-tight mt-3 break-words">
          {profile.name}
        </h1>
        <p className="text-muted text-sm mt-0.5 break-all">{profile.email}</p>
        <span
          className={[
            "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1",
            active ? "bg-lime text-ink" : "bg-amber-100 text-amber-900",
          ].join(" ")}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-forest" : "bg-amber-500"}`} />
          {statusLabel}
          {active && profile.access_expires_at
            ? ` · till ${formatDateOnly(profile.access_expires_at)}`
            : ""}
        </span>
      </div>

      {/* Fees */}
      {admission && (
        <>
          <SectionLabel>Fees</SectionLabel>
          <div className="bg-white border border-line rounded-2xl p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs text-muted">Paid</div>
                <div className="font-display num-mono text-2xl leading-tight">
                  {formatINR(paid)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted">of total</div>
                <div className="num-mono text-[15px] font-medium">
                  {formatINR(admission.total_fee)}
                </div>
              </div>
            </div>
            {pct != null && (
              <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-forest"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Balance due</span>
              <span
                className={`num-mono font-semibold ${due != null && due > 0 ? "text-amber-700" : "text-emerald-700"}`}
              >
                {due != null ? formatINR(due) : "—"}
              </span>
            </div>
          </div>
          <p className="px-1 mt-2 text-xs text-muted">
            For payments, contact the institute office.
          </p>
        </>
      )}

      {/* Admission record */}
      <SectionLabel>Admission</SectionLabel>
      {admission ? (
        <Group>
          <InfoRow label="Batch" value={admission.batch_no ?? "—"} />
          <InfoRow label="Joined" value={formatDate(admission.created_at)} />
          <InfoRow
            label="Age"
            value={admission.age != null ? String(admission.age) : "—"}
          />
          <InfoRow label="Phone" value={profile.phone ?? "—"} />
          <InfoRow label="Address" value={admission.address ?? "—"} />
          <InfoRow label="Aadhar" value={maskAadhar(admission.aadhar_no)} />
          <InfoRow
            label="Family"
            value={
              admission.family_name
                ? `${admission.family_name}${admission.family_relation ? ` (${admission.family_relation})` : ""}${admission.family_phone ? ` · ${admission.family_phone}` : ""}`
                : "—"
            }
          />
        </Group>
      ) : (
        <div className="bg-white border border-line rounded-2xl px-4 py-4 text-sm text-muted">
          No admission record is linked to this account yet. Contact the
          institute office if your course details should appear here.
        </div>
      )}

      {/* Portal access */}
      <SectionLabel>Account</SectionLabel>
      <Group>
        <InfoRow
          label="Access valid till"
          value={
            profile.access_expires_at
              ? formatDateOnly(profile.access_expires_at)
              : "—"
          }
        />
        <InfoRow
          label="Approved on"
          value={profile.approved_at ? formatDate(profile.approved_at) : "—"}
        />
        <InfoRow label="Created" value={formatDate(profile.created_at)} />
      </Group>

      <form action={signOutStudent} className="mt-6">
        <button
          type="submit"
          className="w-full h-12 rounded-2xl bg-white border border-line text-[15px] font-semibold text-red-600 active:bg-red-50 transition"
        >
          Sign out
        </button>
      </form>
    </>
  );
}
