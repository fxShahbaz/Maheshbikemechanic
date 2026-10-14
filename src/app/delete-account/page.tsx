import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Delete your account",
  description: `How to delete your ${SITE_NAME} student portal account.`,
};

export default function DeleteAccountPage() {
  return (
    <LegalPage title="Delete your account" updated="9 October 2026">
      <h2>In the MBI Student app</h2>
      <ul>
        <li>Open the app and sign in.</li>
        <li>Go to the Profile tab (or the approval screen if your account is still pending).</li>
        <li>Tap <strong>Delete account</strong> and confirm.</li>
      </ul>

      <h2>Without the app</h2>
      <p>
        Call or WhatsApp the institute office on{" "}
        <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneFormatted}</a> from your registered phone
        number and ask for your portal account to be deleted.
      </p>

      <h2>What gets deleted</h2>
      <p>
        Your portal login and your practice history are deleted permanently and immediately.
        Admission and fee records are kept by the institute as business records. See the{" "}
        <a href="/privacy">privacy policy</a>.
      </p>
    </LegalPage>
  );
}
