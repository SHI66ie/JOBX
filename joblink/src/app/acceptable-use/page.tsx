import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | JOMP",
  description: "Rules, fraud prevention guidelines, candidate protection standards, and prohibited conduct on JOMP.",
};

export default function AcceptableUsePage() {
  return (
    <LegalLayout title="JOMP Acceptable Use Policy">
      <h2>1. Purpose</h2>
      <p>
        This Acceptable Use Policy establishes conduct that is prohibited on JOMP.
      </p>
      <p>
        It applies to candidates, employers and other users.
      </p>

      <h2>2. Fraud and Deception</h2>
      <p>Users must not:</p>
      <ul>
        <li>create fraudulent accounts;</li>
        <li>impersonate another person or organisation;</li>
        <li>upload forged documents;</li>
        <li>submit false qualifications;</li>
        <li>falsify employment history;</li>
        <li>create fake vacancies;</li>
        <li>manipulate application outcomes; or</li>
        <li>misrepresent their identity.</li>
      </ul>

      <h2>3. Fraudulent Recruitment</h2>
      <p>JOMP must not be used to:</p>
      <ul>
        <li>operate fake recruitment schemes;</li>
        <li>deceive candidates into sending money;</li>
        <li>collect identity documents for fraudulent purposes;</li>
        <li>advertise nonexistent employment;</li>
        <li>impersonate government agencies or legitimate companies; or</li>
        <li>conduct recruitment for unlawful purposes.</li>
      </ul>

      <h2>4. Candidate Protection</h2>
      <p>Users must not:</p>
      <ul>
        <li>harass candidates;</li>
        <li>threaten candidates;</li>
        <li>request inappropriate personal information;</li>
        <li>engage in sexual harassment;</li>
        <li>discriminate unlawfully;</li>
        <li>exploit candidates; or</li>
        <li>misuse candidate information.</li>
      </ul>

      <h2>5. Employer Conduct</h2>
      <p>
        Employers must ensure that vacancy information is accurate and not misleading.
      </p>
      <p>
        Employers must not intentionally conceal material employment conditions in order to deceive candidates.
      </p>

      <h2>6. Candidate Conduct</h2>
      <p>Candidates must not:</p>
      <ul>
        <li>submit fraudulent documents;</li>
        <li>impersonate another applicant;</li>
        <li>manipulate assessment results;</li>
        <li>cheat during skill assessments;</li>
        <li>provide deliberately false information; or</li>
        <li>use JOMP to obtain employment through deception.</li>
      </ul>

      <h2>7. Cybersecurity</h2>
      <p>Users must not:</p>
      <ul>
        <li>attempt unauthorised access;</li>
        <li>interfere with JOMP&apos;s infrastructure;</li>
        <li>introduce malicious software;</li>
        <li>scrape information through unauthorised methods;</li>
        <li>attack or overload JOMP systems;</li>
        <li>bypass security controls; or</li>
        <li>exploit vulnerabilities without authorisation.</li>
      </ul>

      <h2>8. Privacy Abuse</h2>
      <p>
        Users must not collect, copy, sell, publish or distribute another person&apos;s personal information obtained through JOMP except where legally authorised and necessary for the intended recruitment purpose.
      </p>

      <h2>9. Harassment and Abuse</h2>
      <p>JOMP must not be used for:</p>
      <ul>
        <li>threats;</li>
        <li>stalking;</li>
        <li>intimidation;</li>
        <li>bullying;</li>
        <li>abusive conduct; or</li>
        <li>targeted harassment.</li>
      </ul>

      <h2>10. Unlawful Content</h2>
      <p>
        Users must not upload or distribute material that violates Nigerian law or infringes another person&apos;s legal rights.
      </p>

      <h2>11. Enforcement</h2>
      <p>
        JOMP may investigate suspected violations. Depending on the circumstances, JOMP may:
      </p>
      <ul>
        <li>remove content;</li>
        <li>restrict functionality;</li>
        <li>suspend an account;</li>
        <li>revoke employer verification;</li>
        <li>terminate an account;</li>
        <li>preserve relevant information where legally permitted; or</li>
        <li>report suspected unlawful conduct to an appropriate authority.</li>
      </ul>

      <h2>12. Reporting</h2>
      <p>
        Users may report suspected violations through:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:jomponline.mail@gmail.com" className="text-[#01224F] underline">
          jomponline.mail@gmail.com
        </a>
      </p>
      <p>
        Reports should contain enough information for JOMP to investigate.
      </p>

      <h2>13. Appeals</h2>
      <p>
        Where appropriate, users whose accounts have been suspended or terminated may request a review.
      </p>
      <p>
        JOMP may maintain restrictions where necessary for safety, fraud prevention, security, legal compliance or protection of other users.
      </p>
    </LegalLayout>
  );
}
