import { APP_SOCIALS } from "@/lib/config";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ig-a" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-a)" />
      <circle cx="12" cy="12" r="4.15" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.6" cy="7.4" r="1.05" fill="#fff" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#111111" />
      <path d="M14.1 6.2c.28 1.7 1.28 2.85 3 3.05v1.85c-1.02-.03-1.96-.35-2.85-.9v4.55c0 2.35-1.82 4.15-4.2 4.15S5.85 17.1 5.85 14.75 7.67 10.6 10.05 10.6c.28 0 .55.03.82.08v1.9c-.26-.1-.54-.16-.82-.16-1.28 0-2.32 1.05-2.32 2.33s1.04 2.33 2.32 2.33 2.32-1.05 2.32-2.33V6.2h1.73z" fill="#fff" />
      <path d="M14.1 6.2c.28 1.7 1.28 2.85 3 3.05v1.85c-1.02-.03-1.96-.35-2.85-.9" fill="none" stroke="#25F4EE" strokeWidth="1.1" transform="translate(-0.7 0.5)" />
      <path d="M14.1 6.2c.28 1.7 1.28 2.85 3 3.05v1.85c-1.02-.03-1.96-.35-2.85-.9" fill="none" stroke="#FE2C55" strokeWidth="1.1" transform="translate(0.55 -0.35)" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2" />
      <path d="M13.4 19.2v-5.3h1.78l.27-2.08h-2.05V10.5c0-.6.17-1.01 1.03-1.01h1.1V7.6c-.19-.03-.84-.08-1.6-.08-1.58 0-2.66.97-2.66 2.74v1.56H9.4v2.08h1.87v5.3h2.13z" fill="#fff" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#111111" />
      <path d="M8.05 7.2h2.02l2.16 2.92 2.5-2.92h1.92l-3.46 4.04L17 16.8h-2.04l-2.3-3.12-2.66 3.12H8.1l3.64-4.26L8.05 7.2zm1.3.95 5.55 7.5h.86L10.2 8.15H9.35z" fill="#fff" />
    </svg>
  );
}

const ICONS = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Facebook: FacebookIcon,
  X: XIcon,
} as const;

export function SocialLinks({
  className,
  iconClassName,
  compact = false,
}: {
  className?: string;
  iconClassName?: string;
  compact?: boolean;
}) {
  return (
    <nav aria-label="JOMP on social media" className={cn("flex items-center gap-2.5", className)}>
      {APP_SOCIALS.map((social) => {
        const Icon = ICONS[social.name];
        return (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.name} — @jomponline`}
            title={`${social.name} @jomponline`}
            className={cn(
              "inline-flex items-center justify-center rounded-xl transition hover:scale-105 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              compact ? "h-9 w-9" : "h-11 w-11"
            )}
          >
            <Icon className={cn(compact ? "h-8 w-8" : "h-10 w-10", iconClassName)} />
          </a>
        );
      })}
    </nav>
  );
}
