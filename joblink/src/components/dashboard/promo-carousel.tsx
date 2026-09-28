"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6500;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
  art: ReactNode;
};

export type ProfileStrength = { percent: number; missing: string[] };

/* ---------- illustrations: quiet, geometric, on-brand ---------- */

function Ring({ percent, label }: { percent: number; label: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-[120px]">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#8fb4e8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-semibold tracking-[-0.03em] tabular-nums">{percent}%</span>
        <span className="text-[11px] text-white/60">{label}</span>
      </div>
    </div>
  );
}

function ProfileArt({ strength }: { strength: ProfileStrength }) {
  return (
    <div className="flex items-center gap-5">
      <Ring percent={strength.percent} label="complete" />
      <ul className="space-y-2 text-[12.5px]">
        {strength.missing.slice(0, 3).map((item) => (
          <li key={item} className="flex items-center gap-2 text-white/80">
            <span className="flex size-4 items-center justify-center rounded-full ring-1 ring-inset ring-white/40 text-[10px]">+</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchArt() {
  const bars = [0.92, 0.74, 0.55];
  return (
    <div className="w-[220px] space-y-3">
      {bars.map((value, index) => (
        <div key={value} className="flex items-center gap-3">
          <span className={cn("h-2 flex-1 overflow-hidden rounded-full bg-white/12")}>
            <span className="block h-full rounded-full bg-[#8fb4e8]" style={{ width: `${value * 100}%`, opacity: 1 - index * 0.25 }} />
          </span>
          <span className="w-9 text-right text-[12px] tabular-nums text-white/70">{Math.round(value * 100)}%</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-white/50">Skill match per job</p>
    </div>
  );
}

function RemoteArt() {
  return (
    <div className="relative flex size-[130px] items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-white/15" />
      <span className="absolute inset-4 rounded-full border border-white/20" />
      <span className="absolute inset-8 rounded-full bg-white/[0.07]" />
      <svg viewBox="0 0 48 48" className="relative size-12 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="24" cy="24" r="18" />
        <ellipse cx="24" cy="24" rx="8" ry="18" />
        <path d="M6 24h36M9 15h30M9 33h30" strokeLinecap="round" />
      </svg>
      <span className="absolute -right-7 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#01224F] shadow-sm">
        Lagos
      </span>
      <span className="absolute -left-9 bottom-7 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#01224F] shadow-sm">
        London
      </span>
      <span className="absolute -right-10 bottom-1 rounded-full bg-[#8fb4e8] px-2.5 py-1 text-[11px] font-semibold text-[#01224F] shadow-sm">
        Remote
      </span>
    </div>
  );
}

function TrackArt() {
  const steps = ["Applied", "Reviewed", "Interview"];
  return (
    <div className="w-[230px]">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <span className={cn("size-3 rounded-full", index < 2 ? "bg-[#8fb4e8]" : "ring-2 ring-inset ring-white/50")} />
            {index < steps.length - 1 ? <span className={cn("h-0.5 flex-1", index < 1 ? "bg-[#8fb4e8]" : "bg-white/20")} /> : null}
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-[11px] text-white/60">
        {steps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </div>
  );
}

function buildSlides(strength: ProfileStrength): Slide[] {
  const slides: Slide[] = [];
  if (strength.percent < 100) {
    slides.push({
      id: "profile",
      eyebrow: "Boost your chances",
      title: "Finish your profile so employers can find and trust you",
      cta: "Update profile",
      href: "/dashboard/settings",
      art: <ProfileArt strength={strength} />,
    });
  }
  slides.push(
    {
      id: "matches",
      eyebrow: "Best matches",
      title: "Jobs ranked by the skills on your profile",
      cta: "See your matches",
      href: "/dashboard",
      art: <MatchArt />,
    },
    {
      id: "remote",
      eyebrow: "Remote-first",
      title: "Every role on JOMP is remote. Work from wherever you are.",
      cta: "Browse latest jobs",
      href: "/dashboard?tab=recent",
      art: <RemoteArt />,
    },
    {
      id: "track",
      eyebrow: "Stay in the loop",
      title: "Follow every application from applied to hired",
      cta: "My applications",
      href: "/dashboard/applications",
      art: <TrackArt />,
    },
  );
  return slides;
}

export function PromoCarousel({ strength }: { strength: ProfileStrength }) {
  const slides = buildSlides(strength);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const dragStart = useRef<number | null>(null);

  const running = !paused && !reducedMotion;
  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="JOMP highlights"
      className="relative overflow-hidden rounded-2xl bg-[#01224F] text-white"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onPointerDown={(event) => {
          dragStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (dragStart.current === null) return;
          const delta = event.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
        }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${slides.length}`}
            aria-hidden={slideIndex !== index}
            className="grid min-h-[168px] w-full shrink-0 grid-cols-1 items-center gap-6 px-6 pb-10 pt-6 sm:px-8 md:grid-cols-[minmax(0,1fr)_260px]"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#8fb4e8]">{slide.eyebrow}</p>
              <h2 className="mt-2 max-w-lg text-balance text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[23px]">
                {slide.title}
              </h2>
              <Link
                href={slide.href}
                tabIndex={slideIndex === index ? undefined : -1}
                draggable={false}
                className="mt-5 inline-flex h-9 items-center rounded-full bg-white px-4 text-[13px] font-medium text-[#01224F] transition-colors hover:bg-[#dbe7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#01224F]"
              >
                {slide.cta}
              </Link>
            </div>
            <div aria-hidden className="hidden select-none justify-center md:flex">
              {slide.art}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Play highlights" : "Pause highlights"}
          className="mr-1 flex size-5 items-center justify-center rounded-full text-white/60 ring-1 ring-inset ring-white/30 transition-colors hover:text-white hover:ring-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {paused || reducedMotion ? (
            <svg viewBox="0 0 12 12" className="ml-px size-2" fill="currentColor">
              <path d="M3 1.8v8.4L10 6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="size-2" fill="currentColor">
              <rect x="2.5" y="2" width="2.3" height="8" rx="0.6" />
              <rect x="7.2" y="2" width="2.3" height="8" rx="0.6" />
            </svg>
          )}
        </button>

        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(slideIndex)}
            aria-label={`Show highlight ${slideIndex + 1}: ${slide.eyebrow}`}
            aria-current={slideIndex === index ? "true" : undefined}
            className="group/bar flex h-5 w-7 items-center sm:w-9"
          >
            <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/25 transition-colors group-hover/bar:bg-white/40">
              {slideIndex < index ? <span className="absolute inset-0 bg-white" /> : null}
              {slideIndex === index ? (
                <span
                  key={index}
                  onAnimationEnd={() => go(index + 1)}
                  className={cn("absolute inset-y-0 left-0 bg-white", reducedMotion ? "w-full" : "promo-progress")}
                  style={reducedMotion ? undefined : { animationDuration: `${SLIDE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
