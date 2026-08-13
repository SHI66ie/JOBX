"use client";

import Link from "next/link";
import { useEffect } from "react";
import { APP_NAME } from "@/lib/config";

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
    <div className="jomp-landing min-h-screen bg-[#f5f6fa] text-[#0b1424]">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(8,13,26,0.88)] backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-7">
          <Link href="/" className="flex items-center gap-2.5 text-[19px] font-bold tracking-wide text-white" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="h-[11px] w-[11px] rotate-12 rounded-[4px] bg-[#ee1a63]" />
            {APP_NAME}
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#employers" className="text-[14.5px] font-medium text-[#93a1c0] hover:text-white">For employers</a>
            <a href="#connection" className="text-[14.5px] font-medium text-[#93a1c0] hover:text-white">How it works</a>
            <a href="#register" className="text-[14.5px] font-medium text-[#93a1c0] hover:text-white">Get started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl border border-white/20 px-5 py-2.5 text-[14.5px] font-semibold text-white hover:border-white">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-[#2fd8d0] px-5 py-2.5 text-[14.5px] font-semibold text-[#032523] shadow-[0_8px_24px_-8px_rgba(47,216,208,0.4)] hover:-translate-y-0.5">Register</Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-[radial-gradient(120%_140%_at_78%_8%,#14213e_0%,#0b1424_45%,#080d1a_100%)] pb-[120px] pt-[100px]">
        <span className="absolute right-[8%] top-[78px] h-[100px] w-[100px] rotate-[8deg] rounded-[28px] bg-gradient-to-br from-[#ee1a63] to-[#ff4d8d] shadow-[0_30px_60px_-20px_rgba(238,26,99,0.45)] max-md:h-[70px] max-md:w-[70px]" />
        <span className="absolute right-[3%] top-[220px] h-8 w-8 rounded-full bg-[#c81361]" />
        <div className="relative z-10 mx-auto max-w-[1120px] px-7">
          <div className="mb-1 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#93a1c0]">
            <span className="block text-sm font-bold tracking-[0.24em] text-white">{APP_NAME}</span>
            <span className="mt-1 block text-[12.5px] font-semibold tracking-[0.12em]">JOB OPPORTUNITIES MEETS PREPARATION</span>
          </div>
          <h1 className="mt-6 max-w-[780px] text-[clamp(36px,6vw,64px)] font-bold leading-[1.05] text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Build Your Career<br />With {APP_NAME}
          </h1>
          <p className="mt-7 max-w-[520px] text-[17px] leading-relaxed text-[#93a1c0]">
            Pursue real career paths through employer-posted positions, connect with top companies, and access free tools — built for applicants and employers on open ground.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <Link href="/signup" className="rounded-xl bg-[#2fd8d0] px-6 py-3 text-[14.5px] font-semibold text-[#032523] hover:-translate-y-0.5">Find work</Link>
            <Link href="/signup?role=employer" className="rounded-xl border border-white/20 px-6 py-3 text-[14.5px] font-semibold text-white hover:border-white">Hire talent</Link>
          </div>
          <div className="mt-16 flex flex-wrap gap-12">
            <div><strong className="block text-[26px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>12k+</strong><span className="text-[13.5px] text-[#93a1c0]">Verified applicants</span></div>
            <div><strong className="block text-[26px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>3.4k+</strong><span className="text-[13.5px] text-[#93a1c0]">Employers hiring</span></div>
            <div><strong className="block text-[26px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>98%</strong><span className="text-[13.5px] text-[#93a1c0]">Jobs completed on time</span></div>
          </div>
        </div>
      </header>

      <section id="employers" className="bg-white py-24">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 px-7 lg:grid-cols-2">
          <div className="reveal">
            <span className="inline-flex rounded-full bg-[rgba(238,26,99,0.1)] px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#ee1a63]">For employers</span>
            <h2 className="mt-5 max-w-[520px] text-[clamp(28px,4vw,42px)] font-bold leading-tight text-[#0b1424]" style={{ fontFamily: "var(--font-heading)" }}>Get the best applicants to get the job done.</h2>
            <p className="mt-5 max-w-[480px] text-[16.5px] leading-relaxed text-[#5b6478]">Post a role once and reach vetted applicants with real work history and ratings.</p>
            <div className="mt-8 space-y-5">
              {[{n:"01",t:"Vetted, ranked talent",d:"Check track records before you hire."},{n:"02",t:"Post once, reach thousands",d:"Reach applicants looking for your exact skill set."},{n:"03",t:"Free hiring tools",d:"Screening, messaging and tracking built in."}].map(i=>(
                <div key={i.n} className="flex gap-3.5">
                  <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#0b1424] text-sm font-bold text-[#2fd8d0]" style={{ fontFamily: "var(--font-heading)" }}>{i.n}</div>
                  <div><h4 className="text-[15.5px] font-semibold text-[#0b1424]" style={{ fontFamily: "var(--font-heading)" }}>{i.t}</h4><p className="mt-1 text-[14.5px] text-[#5b6478]">{i.d}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal relative min-h-[340px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b1424] to-[#080d1a] p-8">
            <span className="absolute right-6 top-6 h-9 w-9 rotate-[10deg] rounded-[10px] bg-[#ee1a63]" />
            {[{n:"Product Designer",m:"4.9 · 62 jobs",r:"$45/hr",c:"from-[#2fd8d0] to-[#1aa9a2]"},{n:"Backend Engineer",m:"5.0 · 40 jobs",r:"$60/hr",c:"from-[#ee1a63] to-[#ff4d8d]"},{n:"Content Strategist",m:"4.8 · 88 jobs",r:"$32/hr",c:"from-[#f2871f] to-[#ffb35c]"}].map(t=>(
              <div key={t.n} className="mb-3 flex items-center gap-3.5 rounded-2xl border border-white/5 bg-[#101c33] px-5 py-4">
                <div className={`h-11 w-11 flex-none rounded-full bg-gradient-to-br ${t.c}`} />
                <div className="min-w-0 flex-1"><h5 className="text-[14.5px] font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>{t.n}</h5><span className="text-[12.5px] text-[#93a1c0]">{t.m}</span></div>
                <div className="text-[13.5px] font-bold text-[#2fd8d0]" style={{ fontFamily: "var(--font-heading)" }}>{t.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="connection" className="relative overflow-hidden bg-[radial-gradient(130%_130%_at_15%_0%,#14213e_0%,#0b1424_45%,#080d1a_100%)] py-28 text-center text-white">
        <div className="relative z-10 mx-auto max-w-[1120px] px-7">
          <span className="reveal inline-flex rounded-full bg-[rgba(47,216,208,0.12)] px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#2fd8d0]">How it works</span>
          <h2 className="reveal mx-auto mt-5 max-w-[680px] text-[clamp(28px,4vw,44px)] font-bold" style={{ fontFamily: "var(--font-heading)" }}>An open connection between applicants and employers.</h2>
          <p className="reveal mx-auto mt-5 max-w-[560px] text-[16.5px] leading-relaxed text-[#93a1c0]">No hidden gatekeeping. Applicants apply directly, employers respond directly.</p>
          <div className="reveal mt-14 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
            {[{l:"TRANSPARENT",t:"Open job listings",d:"Scope, budget and requirements shown up front."},{l:"DIRECT",t:"No hidden middlemen",d:"Message and negotiate directly on the platform."},{l:"FAIR",t:"Reputation both ways",d:"Ratings run in both directions."}].map(p=>(
              <div key={p.l} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-6">
                <div className="text-[13px] font-bold tracking-widest text-[#2fd8d0]" style={{ fontFamily: "var(--font-heading)" }}>{p.l}</div>
                <h4 className="mt-2.5 text-base font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>{p.t}</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#93a1c0]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="bg-[#f5f6fa] py-28">
        <div className="mx-auto max-w-[1120px] px-7">
          <div className="reveal mx-auto max-w-[600px] text-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#ee1a63]">Get started</span>
            <h2 className="mt-4 text-[clamp(28px,4vw,42px)] font-bold text-[#0b1424]" style={{ fontFamily: "var(--font-heading)" }}>Register as an applicant or an employer.</h2>
            <p className="mt-4 text-base leading-relaxed text-[#5b6478]">Two paths, one open platform. Set up your profile in minutes.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2">
            <div className="reveal rounded-[26px] border border-[rgba(47,216,208,0.18)] bg-gradient-to-br from-[#0e2a2c] to-[#080d1a] p-10">
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-[rgba(47,216,208,0.15)] text-xl font-bold text-[#2fd8d0]" style={{ fontFamily: "var(--font-heading)" }}>A</div>
              <h3 className="text-[23px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>I&apos;m an applicant</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#93a1c0]">Find real employer-posted work and get paid for jobs you finish.</p>
              <ul className="mt-5 space-y-2.5 text-[13.5px] text-[#cfd7ea]">
                {["Build a profile that shows your track record","Apply directly — no bidding wars","Build reputation over time"].map(t=><li key={t} className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-[#2fd8d0]" />{t}</li>)}
              </ul>
              <Link href="/signup" className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#2fd8d0] py-3.5 text-[14.5px] font-semibold text-[#032523] hover:-translate-y-0.5">Register as an applicant</Link>
            </div>
            <div className="reveal rounded-[26px] border border-[rgba(238,26,99,0.18)] bg-gradient-to-br from-[#2a1730] to-[#080d1a] p-10">
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-[rgba(238,26,99,0.15)] text-xl font-bold text-[#ee1a63]" style={{ fontFamily: "var(--font-heading)" }}>E</div>
              <h3 className="text-[23px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>I&apos;m an employer</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#93a1c0]">Post a role and connect with applicants ready to get the job done.</p>
              <ul className="mt-5 space-y-2.5 text-[13.5px] text-[#cfd7ea]">
                {["Post jobs and reach vetted applicants","Review real work history","Manage hires with free tools"].map(t=><li key={t} className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 rounded-full bg-[#ee1a63]" />{t}</li>)}
              </ul>
              <Link href="/signup?role=employer" className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#ee1a63] py-3.5 text-[14.5px] font-semibold text-white shadow-[0_10px_26px_-10px_rgba(238,26,99,0.55)] hover:-translate-y-0.5">Register as an employer</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#080d1a] px-7 pb-8 pt-12 text-[#93a1c0]">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8">
            <div className="flex items-center gap-2.5 text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="h-2.5 w-2.5 rotate-12 rounded-[4px] bg-[#ee1a63]" />{APP_NAME}
            </div>
            <div className="flex flex-wrap gap-6 text-[13.5px]">
              <a href="#employers" className="hover:text-white">For employers</a>
              <a href="#connection" className="hover:text-white">How it works</a>
              <Link href="/signup" className="hover:text-white">Register</Link>
              <Link href="/login" className="hover:text-white">Log in</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-2 text-[12.5px]">
            <span>© {new Date().getFullYear()} {APP_NAME} Career Platform.</span>
            <span>Built on open ground for applicants and employers.</span>
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
