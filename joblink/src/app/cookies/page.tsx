import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | JOMP",
  description: "Explanation of how JOMP uses cookies and similar technologies in compliance with NDPC guidelines.",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="JOMP Cookie Policy">
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small files or similar technologies stored on a device when a user visits a website.
      </p>
      <p>
        They can help websites remember users, maintain sessions, improve security and understand how services are used.
      </p>

      <h2>2. How JOMP Uses Cookies</h2>
      <p>JOMP may use cookies and similar technologies for:</p>
      <ul>
        <li>account authentication;</li>
        <li>maintaining user sessions;</li>
        <li>security;</li>
        <li>remembering preferences;</li>
        <li>website functionality;</li>
        <li>performance monitoring;</li>
        <li>analytics; and</li>
        <li>improving JOMP&apos;s services.</li>
      </ul>

      <h2>3. Necessary Cookies</h2>
      <p>
        Some cookies may be necessary for JOMP to operate. These may support:
      </p>
      <ul>
        <li>login;</li>
        <li>authentication;</li>
        <li>security;</li>
        <li>account functionality;</li>
        <li>fraud prevention; and</li>
        <li>essential website functions.</li>
      </ul>

      <h2>4. Analytics and Optional Cookies</h2>
      <p>
        Where JOMP uses optional analytics or similar technologies that require consent, JOMP will provide an appropriate consent mechanism.
      </p>
      <p>
        Users may be able to accept or reject optional cookies through JOMP&apos;s cookie settings.
      </p>

      <h2>5. Cookie Consent</h2>
      <p>
        JOMP will seek consent where applicable law requires consent for the use of cookies or similar technologies.
      </p>
      <p>
        The NDPC&apos;s current guidance materials state that consent requirements can apply to cookies and that consent should be freely given, informed and specific.
      </p>

      <h2>6. Third-Party Cookies</h2>
      <p>
        Third-party providers integrated into JOMP may place or access cookies or similar technologies according to their own policies.
      </p>
      <p>
        Examples may include analytics, payment, security or other technology providers.
      </p>

      <h2>7. Managing Cookies</h2>
      <p>Users may control cookies through:</p>
      <ul>
        <li>JOMP&apos;s cookie settings where available;</li>
        <li>browser settings; or</li>
        <li>device settings.</li>
      </ul>
      <p>
        Disabling necessary cookies may cause certain JOMP features to stop functioning correctly.
      </p>

      <h2>8. Changes to This Cookie Policy</h2>
      <p>
        JOMP may update this Cookie Policy when its technology, services or legal requirements change.
      </p>

      <h2>9. Contact</h2>
      <p>
        <strong>JOMP</strong><br />
        Website: <a href="https://jomponline.com" target="_blank" rel="noopener noreferrer" className="text-[#01224F] underline">https://jomponline.com</a><br />
        Email: <a href="mailto:jomponline.mail@gmail.com" className="text-[#01224F] underline">jomponline.mail@gmail.com</a><br />
        Address: No 9, Nwafor Street, Amawire Orji, Owerri, Imo State, Nigeria.
      </p>
    </LegalLayout>
  );
}
