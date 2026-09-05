"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";
import WelcomeOnboarding from "./WelcomeOnboarding";

export default function LandingPage() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".jomp-landing .reveal"));
    if (!els.length) return;
    const show = (el: Element) => el.classList.add("in");
    if (typeof IntersectionObserver === "undefined") {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) show(el);
      else io.observe(el);
    });
    const fallback = window.setTimeout(() => els.forEach(show), 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
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
            Pursue real career paths through employer-posted positions, connect with top companies, and access free tools backed by {APP_NAME}'s expertise — built for applicants and employers who want to work on open ground.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <Link href="/signup" className="rounded-xl bg-white px-6 py-3 text-[14.5px] font-semibold text-[#01224F]">Find work</Link>
            <Link href="/signup?role=employer" className="rounded-xl border border-white/20 px-6 py-3 text-[14.5px] font-semibold text-white hover:border-white">Hire talent</Link>
          </div>
          <div className="mt-8">
            <p className="mb-3 text-[12.5px] font-medium uppercase tracking-[0.16em] text-white/60">Follow JOMP</p>
            <SocialLinks />
          </div>
          <div className="mt-16 flex flex-wrap gap-12">
            <div><strong className="block text-[26px] font-bold text-white">12k+</strong><span className="text-[13.5px] text-white/70">Verified applicants</span></div>
            <div><strong className="block text-[26px] font-bold text-white">3.4k+</strong><span className="text-[13.5px] text-white/70">Employers hiring</span></div>
            <div><strong className="block text-[26px] font-bold text-white">98%</strong><span className="text-[13.5px] text-white/70">Jobs completed on time</span></div>
          </div>
        </div>
      </header>
      <section id="employers" className="bg-white py-24">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 px-7 lg:grid-cols-2">
          <div className="reveal">
            <span className="inline-flex rounded-full bg-[#01224F]/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#01224F]">For employers</span>
            <h2 className="mt-5 max-w-[520px] text-[clamp(28px,4vw,42px)] font-bold leading-tight text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>Get the best applicants to get the job done.</h2>
            <p className="mt-5 max-w-[480px] text-[16.5px] leading-relaxed text-[#111111]/70">Post a role once and reach vetted applicants with real work history and ratings.</p>
            <div className="mt-8 flex flex-col gap-5">
              {[
                ["01", "Vetted, ranked talent", "Check track records before you hire."],
                ["02", "Post once, reach thousands", "Reach applicants looking for your exact skill set."],
                ["03", "Free hiring tools", "Screening, messaging and tracking built in."],
              ].map(([n, title, body]) => (
                <div key={n} className="flex gap-3.5">
                  <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#01224F] text-[14px] font-bold text-white">{n}</div>
                  <div>
                    <h4 className="text-[15.5px] font-semibold text-[#01224F]">{title}</h4>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-[#111111]/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal relative min-h-[380px] overflow-hidden rounded-[28px] bg-[#01224F] p-8 text-white">
            <span className="absolute right-6 top-6 h-[38px] w-[38px] rotate-[10deg] rounded-[10px] bg-[#ee1a63]" />
            {[
              { name: "Product Designer", meta: "4.9 · 62 jobs", rate: "$45/hr", bg: "linear-gradient(135deg,#2fd8d0,#1aa9a2)" },
              { name: "Backend Engineer", meta: "5.0 · 40 jobs", rate: "$60/hr", bg: "linear-gradient(135deg,#ee1a63,#ff4d8d)" },
              { name: "Content Strategist", meta: "4.8 · 88 jobs", rate: "$32/hr", bg: "linear-gradient(135deg,#f2871f,#ffb35c)" },
            ].map((card) => (
              <div key={card.name} className="mb-3.5 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#001c40] px-5 py-4">
                <div className="h-11 w-11 shrink-0 rounded-full" style={{ background: card.bg }} />
                <div>
                  <h5 className="text-[14.5px] font-semibold text-white">{card.name}</h5>
                  <span className="text-[12.5px] text-white/60">{card.meta}</span>
                </div>
                <div className="ml-auto text-[13.5px] font-bold text-white">{card.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="connection" className="relative overflow-hidden bg-[#01224F] py-28 text-center text-white">
        <div className="relative z-10 mx-auto max-w-[1120px] px-7">
          <span className="reveal inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-white">How it works</span>
          <h2 className="reveal mx-auto mt-5 max-w-[680px] text-[clamp(28px,4vw,44px)] font-bold" style={{ fontFamily: "var(--font-heading)" }}>An open connection between applicants and employers.</h2>
          <p className="reveal mx-auto mt-5 max-w-[560px] text-[16.5px] leading-relaxed text-white/70">No hidden gatekeeping. Applicants apply directly, employers respond directly.</p>
          <div className="mt-16 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
            {[
              ["TRANSPARENT", "Open job listings", "Every posting shows its scope, budget, and requirements up front."],
              ["DIRECT", "No hidden middlemen", "Applicants and employers message and negotiate directly on the platform."],
              ["FAIR", "Reputation both ways", "Ratings run in both directions, so trust is earned by everyone on JOMP."],
            ].map(([kicker, title, body]) => (
              <div key={kicker} className="reveal rounded-[18px] border border-white/10 bg-white/5 p-6">
                <div className="text-[13px] font-bold tracking-[0.1em] text-white">{kicker}</div>
                <h4 className="mt-2.5 text-[16px] font-semibold text-white">{title}</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="stats" className="bg-white py-24">
        <div className="mx-auto max-w-[1120px] px-7">
          <div className="reveal max-w-[600px]">
            <span className="inline-flex rounded-full bg-[#01224F]/10 px-4 py-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-[#01224F]">Platform stats</span>
            <h2 className="mt-5 text-[clamp(28px,3.6vw,40px)] font-bold text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>{APP_NAME} by the numbers</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#111111]/70">A quick look at who's on the platform, and how many applicants go on to get hired.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="reveal rounded-[28px] bg-[#01224F] p-9 text-white">
              <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/70">Platform mix</span>
              <h3 className="mt-2.5 text-[20px] font-semibold text-white">Applicants vs Employers</h3>
              <div className="my-8 flex justify-center">
                <div className="flex h-[190px] w-[190px] shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#2fd8d0 0% 72%, #ee1a63 72% 100%)" }}>
                  <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-[#01224F]">
                    <strong className="text-[26px] font-bold text-white">72%</strong>
                    <span className="mt-1 text-xs text-white/60">Applicants</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[14px] text-[#dfe6f5]"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2fd8d0]" /><span>Applicants</span><span className="ml-auto font-bold text-white">72%</span></div>
                <div className="flex items-center gap-2.5 text-[14px] text-[#dfe6f5]"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ee1a63]" /><span>Employers</span><span className="ml-auto font-bold text-white">28%</span></div>
              </div>
            </div>
            <div className="reveal rounded-[28px] bg-[#01224F] p-9 text-white">
              <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#f2871f]">Growth index</span>
              <h3 className="mt-2.5 text-[20px] font-semibold text-white">Applicants & Employed Applicants</h3>
              <svg className="mt-7 block h-auto w-full" viewBox="0 0 640 280" preserveAspectRatio="xMidYMid meet">
                <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
                  <line x1="40" y1="250" x2="620" y2="250" />
                  <line x1="40" y1="193" x2="620" y2="193" />
                  <line x1="40" y1="135" x2="620" y2="135" />
                  <line x1="40" y1="78" x2="620" y2="78" />
                  <line x1="40" y1="20" x2="620" y2="20" />
                </g>
                <g fill="#93a1c0" fontSize="11" fontFamily="Inter, sans-serif">
                  <text x="10" y="254">0</text>
                  <text x="4" y="197">3k</text>
                  <text x="4" y="139">6k</text>
                  <text x="4" y="82">9k</text>
                  <text x="0" y="24">12k</text>
                </g>
                <g fill="#93a1c0" fontSize="11" fontFamily="Inter, sans-serif" textAnchor="middle">
                  <text x="40" y="268">Jan</text>
                  <text x="156" y="268">Feb</text>
                  <text x="272" y="268">Mar</text>
                  <text x="388" y="268">Apr</text>
                  <text x="504" y="268">May</text>
                  <text x="620" y="268">Jun</text>
                </g>
                <defs>
                  <linearGradient id="applicantFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2fd8d0" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2fd8d0" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="employedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f2871f" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f2871f" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M40,250 L40,210 L156,185 L272,154 L388,112 L504,62 L620,20 L620,250 Z" fill="url(#applicantFill)" />
                <path d="M40,210 L156,185 L272,154 L388,112 L504,62 L620,20" fill="none" stroke="#2fd8d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M40,250 L40,239 L156,229 L272,214 L388,196 L504,173 L620,148 L620,250 Z" fill="url(#employedFill)" />
                <path d="M40,239 L156,229 L272,214 L388,196 L504,173 L620,148" fill="none" stroke="#f2871f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <g fill="#2fd8d0">
                  <circle cx="40" cy="210" r="4" />
                  <circle cx="156" cy="185" r="4" />
                  <circle cx="272" cy="154" r="4" />
                  <circle cx="388" cy="112" r="4" />
                  <circle cx="504" cy="62" r="4" />
                  <circle cx="620" cy="20" r="4" />
                </g>
                <g fill="#f2871f">
                  <circle cx="40" cy="239" r="4" />
                  <circle cx="156" cy="229" r="4" />
                  <circle cx="272" cy="214" r="4" />
                  <circle cx="388" cy="196" r="4" />
                  <circle cx="504" cy="173" r="4" />
                  <circle cx="620" cy="148" r="4" />
                </g>
              </svg>
              <div className="mt-5 flex flex-wrap gap-6">
                <div className="flex items-center gap-2.5 text-[14px] text-[#dfe6f5]"><span className="h-2.5 w-2.5 rounded-full bg-[#2fd8d0]" />Applicants</div>
                <div className="flex items-center gap-2.5 text-[14px] text-[#dfe6f5]"><span className="h-2.5 w-2.5 rounded-full bg-[#f2871f]" />Employed applicants</div>
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-[13.5px] leading-relaxed text-white/60">By June, <strong className="text-[#2fd8d0]">44%</strong> of applicants on JOMP had been hired for at least one role.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="register" className="bg-[#f5f6fa] py-28">
        <div className="mx-auto max-w-[1120px] px-7">
          <div className="reveal mx-auto max-w-[600px] text-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#01224F]">Get started</span>
            <h2 className="mt-4 text-[clamp(28px,4vw,42px)] font-bold text-[#01224F]" style={{ fontFamily: "var(--font-heading)" }}>Register as an applicant or an employer.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#111111]/70">Two paths, one open platform. Pick the one that's yours and set up your profile in minutes.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2">
            <div className="reveal rounded-[26px] border border-white/15 bg-[#01224F] p-10 text-white">
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-white/10 text-[20px] font-bold text-white">A</div>
              <h3 className="text-[23px] font-bold">I'm an applicant</h3>
              <p className="mt-3 max-w-[340px] text-[14.5px] leading-relaxed text-white/70">Find real, employer-posted work in your field and get paid for jobs you finish.</p>
              <ul className="mt-6 space-y-2.5 text-[13.5px] text-[#cfd7ea]">
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />Build a profile that shows your track record</li>
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />Apply directly to open roles, no bidding wars</li>
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />Get rated and build your reputation over time</li>
              </ul>
              <Link href="/signup" className="mt-7 flex w-full items-center justify-center rounded-xl bg-white py-3.5 text-[14.5px] font-semibold text-[#01224F]">Register as an applicant</Link>
            </div>
            <div className="reveal rounded-[26px] border border-[#01224F]/15 bg-white p-10 text-[#111111]">
              <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-[#01224F] text-[20px] font-bold text-white">E</div>
              <h3 className="text-[23px] font-bold text-[#01224F]">I'm an employer</h3>
              <p className="mt-3 max-w-[340px] text-[14.5px] leading-relaxed text-[#111111]/70">Post a role and connect with applicants who are ready to get the job done.</p>
              <ul className="mt-6 space-y-2.5 text-[13.5px] text-[#111111]/80">
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#01224F]" />Post jobs and reach vetted applicants fast</li>
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#01224F]" />Review real work history before you hire</li>
                <li className="flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#01224F]" />Manage hires with free built-in tools</li>
              </ul>
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
              <a href="#stats" className="hover:text-white">Platform stats</a>
              <Link href="/signup" className="hover:text-white">Register</Link>
              <Link href="/login" className="hover:text-white">Log in</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-white/55">Follow @jomponline</p>
              <SocialLinks compact />
            </div>
            <div className="text-[12.5px]">
              <span>© {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
