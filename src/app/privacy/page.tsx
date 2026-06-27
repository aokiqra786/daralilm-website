import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

// Board-approved effective date.
const EFFECTIVE_DATE = "June 1, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SoCal Academy of Knowledge collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        SoCal Academy of Knowledge, Inc. (&quot;SoCal AoK,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;) operates the website socalaok.org (the &quot;Site&quot;). This Privacy Policy explains
        what information we collect, how we use it, and the choices you have. By using the Site, you agree to
        this Policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Information you provide.</strong> When you submit a contact form, enrollment/admissions
          application, volunteer form, newsletter signup, or donation, we may collect your name, email address,
          phone number, mailing address, your child&apos;s name and date of birth (for enrollment), program
          interests, and any information you choose to include.
        </li>
        <li>
          <strong>Information collected automatically.</strong> Like most websites, we may collect basic
          technical data (IP address, browser type, pages visited) through cookies and analytics to operate and
          improve the Site.
        </li>
        <li>
          <strong>Payment information.</strong> Donations and any online payments are processed by third-party
          providers (for example, LaunchGood, Zeffy, or a card processor). We do <strong>not</strong> collect or
          store your full card or bank numbers on our servers.
        </li>
      </ul>

      <h2>Children&apos;s privacy</h2>
      <p>
        The Site is intended for parents, guardians, and adult community members. We do not knowingly collect
        personal information directly from children under 13 for marketing purposes. Information about a minor
        that we receive (for example, on an enrollment application) is provided <strong>by a parent or
        guardian</strong> for the purpose of school admission and administration. If you believe a child has
        provided us information without parental consent, contact us and we will delete it.
      </p>

      <h2>How we use information</h2>
      <p>
        We use the information we collect to: respond to inquiries; process and manage enrollment, volunteering,
        and donations; send program updates and newsletters you request; operate, secure, and improve the Site;
        and comply with legal obligations.
      </p>

      <h2>How we share information</h2>
      <p>
        We do <strong>not</strong> sell your personal information. We share it only with: service providers who
        help us operate (for example, our hosting/database provider Supabase, our email provider Resend, and our
        payment providers); and as required by law or to protect the rights and safety of our community.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We use cookies and similar technologies for essential functionality and to understand Site usage. You
        can control cookies through your browser settings. If we use an analytics tool, it is configured to
        collect aggregate usage data.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We keep personal information only as long as needed for the purposes described here or as required by
        law, and we maintain reasonable administrative and technical safeguards to protect it. No method of
        transmission or storage is 100% secure.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You may unsubscribe from our newsletter at any time using the link in each email. You may request access
        to, correction of, or deletion of your personal information by emailing{" "}
        <a href="mailto:info@socalaok.org">info@socalaok.org</a>. California residents have rights under the
        CCPA/CPRA, including the right to know, delete, and correct personal information, and the right not to be
        discriminated against for exercising these rights; we will honor verified requests as required by law.
      </p>

      <h2>Third-party links</h2>
      <p>
        The Site links to third-party sites and services (for example, donation platforms and social media).
        Their privacy practices are governed by their own policies; we are not responsible for their content or
        practices.
      </p>

      <h2>Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. Material changes will be posted on this page with a new
        effective date.
      </p>

      <h2>Contact us</h2>
      <p>
        SoCal Academy of Knowledge, Inc. &middot; 8414 Tampa Ave, Northridge, CA 91324 &middot; 818-452-5237
        &middot; <a href="mailto:info@socalaok.org">info@socalaok.org</a>
      </p>
    </LegalPage>
  );
}
