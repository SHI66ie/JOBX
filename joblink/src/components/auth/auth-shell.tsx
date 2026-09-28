import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/config";
import { JompMark, JompWordmark, Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";

type Showcase = { title: ReactNode; body: string };

/** Split auth layout: quiet form column on the left, navy showcase panel on the right. */
export function AuthShell({
  alternate,
  showcase,
  children,
}: {
  alternate: { prompt: string; label: string; href: string };
  showcase: Showcase;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-screen flex-col px-5 py-5 sm:px-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            aria-label={`${APP_NAME} home`}
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F] focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <JompMark className="h-8 w-8" />
              <JompWordmark className="h-[18px] w-auto" />
            </span>
          </Link>
          <p className="text-[13px] text-neutral-500">
            <span className="hidden sm:inline">{alternate.prompt} </span>
            <Link
              href={alternate.href}
              className="rounded-sm font-medium text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F]"
            >
              {alternate.label}
            </Link>
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[380px]">{children}</div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <a
            href="https://www.instagram.com/jomponline"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700"
          >
            @jomponline
          </a>
        </footer>
      </div>

      <AuthShowcase {...showcase} />
    </div>
  );
}

export function AuthHeading({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="auth-rise">
      <h1 className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-neutral-950 sm:text-[30px]">
        {title}
      </h1>
      {description ? <p className="mt-3 text-[15px] leading-6 text-neutral-500">{description}</p> : null}
    </div>
  );
}

function AuthShowcase({ title, body }: Showcase) {
  return (
    <aside className="sticky top-0 hidden h-screen p-3 lg:block">
      <div className="auth-showcase relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#000f24] p-10 xl:p-12">
        <div aria-hidden className="auth-aurora">
          <span className="auth-blob auth-blob-1" />
          <span className="auth-blob auth-blob-2" />
          <span className="auth-blob auth-blob-3" />
        </div>
        <div aria-hidden className="auth-grain" />

        <Logo variant="mark" tone="white" className="relative h-10 w-10 opacity-90" />

        <div className="relative">
          <h2 className="auth-rise max-w-lg text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white [animation-delay:120ms] xl:text-6xl">
            {title}
          </h2>
          <p className="auth-rise mt-5 max-w-md text-base leading-7 text-white/65 [animation-delay:220ms]">
            {body}
          </p>
          <div className="auth-rise mt-9 flex items-center gap-4 [animation-delay:320ms]">
            <SocialLinks compact />
            <p className="text-sm leading-5 text-white/55">
              Follow along
              <br />
              @jomponline
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
