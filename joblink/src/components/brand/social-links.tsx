import { APP_SOCIALS } from "@/lib/config";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.5 3c.4 2.6 1.9 4.3 4.5 4.6v2.6c-1.5 0-2.9-.5-4.2-1.3v6.6c0 3.4-2.6 6-6.1 6S2.6 18.3 2.6 14.9 5.2 8.9 8.7 8.9c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-1.9 0-3.4 1.6-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.6 3.4-3.4V3h2.4z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.3 1.4-1.3H16.5V5.4c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.5v2.8h2.4V21h2.6z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.2 10.3 21.2 3h-1.7l-6 6.6L8.7 3H3.3l7.4 10.3L3.3 21h1.7l6.5-7.1 5.2 7.1h5.4L14.2 10.3zM12.3 13l-.7-1-6-8.2h2.6l4.8 6.6.8 1 6.3 8.6h-2.6L12.3 13z" />
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
    <nav aria-label="JOMP on social media" className={cn("flex items-center gap-2", className)}>
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
              "inline-flex items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:bg-white hover:text-[#01224F]",
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            <Icon className={cn(compact ? "h-4 w-4" : "h-[18px] w-[18px]", iconClassName)} />
          </a>
        );
      })}
    </nav>
  );
}
