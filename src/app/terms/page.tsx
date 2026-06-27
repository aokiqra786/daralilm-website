import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

// Board-approved effective date.
const EFFECTIVE_DATE = "June 1, 2026";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing use of the SoCal Academy of Knowledge website.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Terms of Use" effectiveDate={EFFECTIVE_DATE}>
      <p>
        These Terms of Use (&quot;Terms&quot;) govern your use of socalaok.org (the &quot;Site&quot;), operated
        by SoCal Academy of Knowledge, Inc. (&quot;SoCal AoK&quot;). By accessing or using the Site, you agree to
        these Terms. If you do not agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        You may use the Site for lawful, personal, and informational purposes. You agree not to misuse the Site,
        including by attempting to disrupt it, access it without authorization, scrape it, or use it to violate
        any law.
      </p>

      <h2>Accounts and portals</h2>
      <p>
        Certain areas (parent, teacher, and administrator portals) require an account and are restricted to
        authorized users. You are responsible for keeping your login credentials confidential and for activity
        under your account. Notify us immediately of any unauthorized use.
      </p>

      <h2>Admissions, programs, and tuition</h2>
      <p>
        Submitting an application does not guarantee admission. Program details, schedules, and tuition or fees
        are subject to change and are confirmed during enrollment. Tuition and fee payment terms, and any refund
        policy, are as posted or provided at the time of enrollment.
      </p>

      <h2>Donations</h2>
      <p>
        Donations are voluntary and are generally <strong>non-refundable</strong>. Donations are processed by
        third-party providers. <strong>Tax-exempt status:</strong> SoCal AoK&apos;s 501(c)(3) application is
        pending; until the IRS issues a determination letter, we do <strong>not</strong> represent that
        donations are tax-deductible. We will update this section once tax-exempt status is confirmed.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Site&apos;s content, logo, name, and design are the property of SoCal AoK or its licensors and may
        not be copied or used without permission. Qur&apos;anic and religious content is presented respectfully
        and remains subject to applicable rights.
      </p>

      <h2>Third-party links and services</h2>
      <p>
        The Site may link to or integrate third-party services (for example, donation platforms and social
        media). We are not responsible for their content, products, or practices, and your use of them is at
        your own risk and subject to their terms.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
        express or implied, including accuracy, fitness for a particular purpose, or uninterrupted availability.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, SoCal AoK and its officers, volunteers, and staff will not be
        liable for any indirect, incidental, or consequential damages arising from your use of the Site.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless SoCal AoK from claims arising out of your misuse of the Site or
        violation of these Terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of California, without regard to conflict-of-laws
        rules. Any dispute will be brought in the state or federal courts located in Los Angeles County,
        California.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site after changes constitutes
        acceptance of the updated Terms.
      </p>

      <h2>Contact us</h2>
      <p>
        SoCal Academy of Knowledge, Inc. &middot; 8414 Tampa Ave, Northridge, CA 91324 &middot; 818-452-5237
        &middot; <a href="mailto:info@socalaok.org">info@socalaok.org</a>
      </p>
    </LegalPage>
  );
}
