"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { Logo } from "@/components/brand/logo";
import WelcomeOnboarding from "./WelcomeOnboarding";

export default function LandingPage() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="jomp-landing min-h-screen bg-white text-[#111111]">
      <Suspense fallback={null}>
        <WelcomeOnboarding />
      </Suspense>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#01224F]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-7">
          <Link href="/" className="text-white">
            <Logo variant="lockup" tone="white" className="h-10" markClassName="h-8 w-8" />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#employers" className="text-[14.5px] font-medium text-white/70 hover:text-white">For employers</a>
            <a href="#connection" className="text-[14.5px] font-medium text-white/70 hover:text-white">How it works</a>
            <a href="#stats" className="text-[14.5px] font-medium text-white/70 hover:text-white">Platform stats</a>
            <a href="#register" className="text-[14.5px] font-medium text-white/70 hover:text-white">Get started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl border border-white/20 px-5 py-2.5 text-[14.5px] font-semibold text-white hover:border-white">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-white px-5 py-2.5 text-[14.5px] font-semibold text-[#01224F]">Register</Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[#01224F] pb-[120px] pt-[100px]">
        <div className="relative z-10 mx-auto max-w-[1120px] px-7">
          <div className="mb-1 text-[13px] font-semibold uppercase tracking-[0.22em] text-white/70">
            <Logo variant="lockup" tone="white" className="h-12" markClassName="h-10 w-10" />
            <span className="mt-4 block text-[12.5px] font-medium tracking-[0.16em]">{APP_TAGLINE.toUpperCase()}</span>
          </div>
          <h1 className="mt-6 max-w-[780px] text-[clamp(36px,6vw,64px)] font-bold leading-[1.05] text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Build Your Career<br />With {APP_NAME}
          </h1>
          <p className="mt-7 max-w-[520px] text-[17px] leading-relaxed text-white/70">
            Pursue real career paths through employer-posted positions, connect with top companies, and access free tools — built for applicants and employers on open ground.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <Link href="/signup" className="rounded-xl bg-white px-6 py-3 text-[14.5px] font-semibold text-[#01224F]">Find work</Link>
            <Link href="/signup?role=employer" className="rounded-xl border border-white/20 px-6 py-3 text-[14.5px] font-semibold text-white hover:border-white">Hire talent</Link>
          </div>
        </div>
      </header>

      <section id="employers" className="bg-white py-24">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 px-7 lg:grid-cols-2">
          <div className="reveal">
            <span className="inline-flex rounded-full bg-[#01224F]/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#01224F]">For employers</span>
            <h2 className="mt-5 max-w-[520px] text-[clamp(28px,4vw,42px)] font-bold leading-tight text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>Get the best applicants to get the job done.</h2>
            <p className="mt-5 max-w-[480px] text-[16.5px] leading-relaxed text-[#111111]/70">Post a role once and reach vetted applicants with real work history and ratings.</p>
          </div>
          <div className="reveal rounded-[28px] bg-[#01224F] p-8 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/70">Primary lockup</p>
            <div className="mt-6"><Logo variant="lockup" tone="white" tagline markClassName="h-14 w-14" /></div>
          </div>
        </div>
      </section>

      <section id="connection" className="bg-[#01224F] py-28 text-center text-white">
        <div className="mx-auto max-w-[1120px] px-7">
          <span className="reveal inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-white">How it works</span>
          <h2 className="reveal mx-auto mt-5 max-w-[680px] text-[clamp(28px,4vw,44px)] font-bold" style={{ fontFamily: "var(--font-heading)" }}>An open connection between applicants and employers.</h2>
          <p className="reveal mx-auto mt-5 max-w-[560px] text-[16.5px] leading-relaxed text-white/70">No hidden gatekeeping. Applicants apply directly, employers respond directly.</p>
        </div>
      </section>

      <section id="stats" className="bg-white py-24">
        <div className="mx-auto max-w-[1120px] px-7">
          <span className="inline-flex rounded-full bg-[#01224F]/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#01224F]">Platform stats</span>
          <h2 className="mt-5 text-[clamp(28px,3.6vw,40px)] font-bold text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>{APP_NAME} by the numbers</h2>
          <div className="mt-10 flex flex-wrap gap-12">
            <div><strong className="block text-[26px] font-bold text-[#01224F]">12k+</strong><span className="text-[13.5px] text-[#111111]/70">Verified applicants</span></div>
            <div><strong className="block text-[26px] font-bold text-[#01224F]">3.4k+</strong><span className="text-[13.5px] text-[#111111]/70">Employers hiring</span></div>
            <div><strong className="block text-[26px] font-bold text-[#01224F]">98%</strong><span className="text-[13.5px] text-[#111111]/70">Jobs completed on time</span></div>
          </div>
        </div>
      </section>

      <section id="register" className="bg-[#f5f6fa] py-28">
        <div className="mx-auto max-w-[1120px] px-7">
          <div className="mx-auto max-w-[600px] text-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#01224F]">Get started</span>
            <h2 className="mt-4 text-[clamp(28px,4vw,42px)] font-bold text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>Register as an applicant or an employer.</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2">
            <div className="rounded-[26px] border border-[#01224F]/15 bg-[#01224F] p-10 text-white">
              <h3 className="text-[23px] font-bold">I'm an applicant</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">Find real employer-posted work and get paid for jobs you finish.</p>
              <Link href="/signup" className="mt-7 flex w-full items-center justify-center rounded-xl bg-white py-3.5 text-[14.5px] font-semibold text-[#01224F]">Register as an applicant</Link>
            </div>
            <div className="rounded-[26px] border border-[#01224F]/15 bg-white p-10">
              <h3 className="text-[23px] font-bold text-[#01224F]">I'm an employer</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#111111]/70">Post a role and connect with applicants ready to get the job done.</p>
              <Link href="/signup?role=employer" className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#01224F] py-3.5 text-[14.5px] font-semibold text-white">Register as an employer</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#01224F] px-7 pb-8 pt-12 text-white/70">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8">
            <Link href="/" className="text-white">
              <Logo variant="lockup" tone="white" markClassName="h-8 w-8" />
            </Link>
            <div className="flex flex-wrap gap-6 text-[13.5px]">
              <a href="#employers" className="hover:text-white">For employers</a>
              <a href="#connection" className="hover:text-white">How it works</a>
              <Link href="/signup" className="hover:text-white">Register</Link>
              <Link href="/login" className="hover:text-white">Log in</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-2 text-[12.5px]">
            <span>© {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .jomp-landing .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .jomp-landing .reveal.in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .jomp-landing .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
    </div>
  );
}
