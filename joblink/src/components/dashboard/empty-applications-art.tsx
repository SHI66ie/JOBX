/** Grey illustration for "no applications": a sent application with a paper plane and a progress track. */
export function EmptyApplicationsArt() {
  return (
    <svg viewBox="0 0 160 120" className="empty-float h-[120px] w-[160px]" aria-hidden fill="none">
      <ellipse className="fill-neutral-900" cx="76" cy="112" rx="46" ry="4" opacity="0.05" />

      {/* application sheet */}
      <rect className="fill-surface" x="30" y="16" width="84" height="90" rx="14" />
      <rect className="stroke-neutral-900" x="30.75" y="16.75" width="82.5" height="88.5" rx="13.25" strokeOpacity="0.08" strokeWidth="1.5" />

      {/* avatar + name */}
      <circle className="fill-neutral-200" cx="50" cy="36" r="8" />
      <rect className="fill-neutral-400" x="63" y="31" width="34" height="5" rx="2.5" />
      <rect className="fill-neutral-200" x="63" y="40" width="22" height="4" rx="2" />

      {/* progress track */}
      <circle className="fill-neutral-400" cx="46" cy="64" r="4" />
      <rect className="fill-neutral-400" x="50" y="63" width="14" height="2" rx="1" />
      <circle className="fill-neutral-400" cx="68" cy="64" r="4" />
      <rect className="fill-neutral-200" x="72" y="63" width="14" height="2" rx="1" />
      <circle className="fill-surface stroke-neutral-300" cx="90" cy="64" r="3.5" strokeWidth="1.5" />
      <rect className="fill-neutral-200" x="94" y="63" width="6" height="2" rx="1" />

      {/* body lines */}
      <rect className="fill-neutral-100" x="42" y="80" width="58" height="4" rx="2" />
      <rect className="fill-neutral-100" x="42" y="89" width="40" height="4" rx="2" />

      {/* paper plane + trail */}
      <path className="stroke-neutral-300" d="M104 22c10-6 20-9 30-10" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" />
      <g transform="translate(132 2) rotate(12)">
        <path className="fill-neutral-50 stroke-neutral-400" d="M0 10 22 0 14 22 10 13z" strokeWidth="1.8" strokeLinejoin="round" />
        <path className="stroke-neutral-400" d="M10 13 22 0" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
