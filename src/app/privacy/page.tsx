import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles student data on the website and the MBI Student app.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="9 October 2026">
      <p>
        This policy explains what information {SITE_NAME} (&ldquo;we&rdquo;) collects through
        the student portal on this website and the MBI Student mobile app, and how it is used.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address, phone number and password (stored hashed). If you sign in with Google, your Google name and email.</li>
        <li>Practice logs: the engine you punch in on, notes you add, and punch-in/punch-out times.</li>
        <li>Records the institute already holds about you from your admission (batch, address, family contact, masked Aadhar, fees) — shown to you, not collected by the app.</li>
        <li>A watermark with your name and email is drawn on study material while you view it.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run the student portal: approving your access, recording your workshop practice,
        showing you study material, announcements for your batch, and your admission and fee
        details. We do not sell your data, show ads, or use tracking or advertising SDKs.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Data is stored with Supabase (database and authentication) and served through Vercel
        (website hosting). Data is encrypted in transit. Institute staff can see your portal
        account and practice logs.
      </p>

      <h2>Deleting your account</h2>
      <p>
        You can delete your portal account at any time in the app (Profile → Delete account) or by
        contacting the office — see <a href="/delete-account">how to delete your account</a>.
        This removes your login and practice history. Admission and fee records are kept by the
        institute as business records.
      </p>

      <h2>Contact</h2>
      <p>
        {SITE_NAME}, {CONTACT.city}, {CONTACT.region}. Phone{" "}
        <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneFormatted}</a>.
      </p>
    </LegalPage>
  );
}
