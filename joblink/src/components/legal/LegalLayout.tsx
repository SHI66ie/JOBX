import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { Logo } from "@/components/brand/logo";

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  effectiveDate?: string;
  children: React.ReactNode;
}

const LEGAL_NAV = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/employer-terms", label: "Employer Terms" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/copyright", label: "Copyright & IP" },
];

export function LegalLayout({
  title,
  lastUpdated = "October 2026",
  effectiveDate = "October 2026",
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-neutral-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo variant="lockup" tone="navy" markClassName="h-7 w-7" />
          </Link>
          <div className="flex items-center gap-4 text-[13.5px]">
            <Link
              href="/"
              className="text-neutral-600 transition hover:text-[#01224F]"
            >
              Back to Home
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#01224F] px-4 py-2 font-medium text-white shadow-sm transition hover:bg-[#001738]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Legal & Policies
              </p>
              {LEGAL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          {/* Document Content */}
          <main className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm sm:p-12">
            <div className="border-b border-neutral-100 pb-8">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#01224F]">
                Legal Agreement
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
                <span>Effective Date: {effectiveDate}</span>
                <span>•</span>
                <span>Last Updated: {lastUpdated}</span>
              </div>
            </div>

            <article className="prose prose-neutral mt-8 max-w-none text-[15px] leading-relaxed text-neutral-700 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-neutral-900 prose-h2:mt-10 prose-h2:border-b prose-h2:border-neutral-100 prose-h2:pb-2 prose-h2:text-xl prose-h3:text-lg prose-ul:my-4 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1.5">
              {children}
            </article>

            {/* Quick contact card at bottom */}
            <div className="mt-12 rounded-xl border border-neutral-100 bg-[#F8FAFC] p-6 text-sm text-neutral-600">
              <h3 className="font-semibold text-neutral-900">Questions about our policies?</h3>
              <p className="mt-1">
                You can reach our compliance and support team directly at{" "}
                <a
                  href="mailto:jomponline.mail@gmail.com"
                  className="font-medium text-[#01224F] underline underline-offset-2"
                >
                  jomponline.mail@gmail.com
                </a>{" "}
                or visit our headquarters at No 9, Nwafor Street, Amawire Orji, Owerri, Imo State, Nigeria.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-5xl px-6 flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {LEGAL_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-neutral-900">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
