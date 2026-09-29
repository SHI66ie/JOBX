/**
 * Constructed empty-state illustration in greys: two stacked job cards with an accent.
 * "search" = magnifying glass (no results); "empty" = clock + sparkles (nothing posted yet).
 */
export function EmptyJobsArt({ variant }: { variant: "search" | "empty" }) {
  return (
    <svg viewBox="0 0 140 120" className="empty-float h-[120px] w-[140px]" aria-hidden fill="none">
      {/* soft ground shadow */}
      <ellipse className="fill-neutral-900" cx="68" cy="112" rx="42" ry="4" opacity="0.05" />

      {/* back card */}
      <rect className="fill-neutral-200" x="18" y="26" width="72" height="78" rx="14" transform="rotate(-6 54 65)" />

      {/* front card */}
      <g>
        <rect className="fill-surface" x="32" y="14" width="74" height="84" rx="14" />
        <rect className="stroke-neutral-900" x="32.75" y="14.75" width="72.5" height="82.5" rx="13.25" strokeOpacity="0.08" strokeWidth="1.5" />
        {/* company chip + title lines */}
        <rect className="fill-neutral-300" x="44" y="27" width="16" height="16" rx="5" />
        <rect className="fill-neutral-400" x="65" y="29" width="30" height="5" rx="2.5" />
        <rect className="fill-neutral-200" x="65" y="38" width="20" height="4" rx="2" />
        {/* body lines */}
        <rect className="fill-neutral-100" x="44" y="54" width="50" height="4" rx="2" />
        <rect className="fill-neutral-100" x="44" y="63" width="42" height="4" rx="2" />
        <rect className="fill-neutral-100" x="44" y="72" width="30" height="4" rx="2" />
        {/* tag pills */}
        <rect className="fill-neutral-200" x="44" y="83" width="18" height="6" rx="3" />
        <rect className="fill-neutral-200" x="65" y="83" width="14" height="6" rx="3" />
      </g>

      {variant === "search" ? (
        <g>
          <circle className="fill-neutral-50" cx="104" cy="80" r="17" />
          <circle className="stroke-neutral-400" cx="104" cy="80" r="17" strokeWidth="5" />
          <path className="stroke-neutral-400" d="M116.5 92.5 128 104" strokeWidth="7" strokeLinecap="round" />
          <path className="stroke-neutral-300" d="M97 75.5a8 8 0 0 1 7-4" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle className="fill-neutral-400" cx="106" cy="82" r="18" />
          <circle className="stroke-neutral-300" cx="106" cy="82" r="12.5" strokeWidth="2.5" />
          <path className="stroke-surface" d="M106 75.5V82l4.5 3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="fill-neutral-300" d="M124 52l1.6 3.9 3.9 1.6-3.9 1.6-1.6 3.9-1.6-3.9-3.9-1.6 3.9-1.6z" />
          <path className="fill-neutral-300" d="M16 18l1.1 2.7 2.7 1.1-2.7 1.1-1.1 2.7-1.1-2.7-2.7-1.1 2.7-1.1z" />
        </g>
      )}
    </svg>
  );
}
