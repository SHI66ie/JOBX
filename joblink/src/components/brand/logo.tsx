import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { cn } from "@/lib/utils";

type LogoVariant = "mark" | "wordmark" | "lockup" | "stacked";
type LogoTone = "navy" | "white" | "current";

interface LogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  tagline?: boolean;
  className?: string;
  markClassName?: string;
  priority?: boolean;
}

const TONE: Record<LogoTone, string> = {
  navy: "#01224F",
  white: "#FFFFFF",
  current: "currentColor",
};

/** Official JOMP monogram (vectorized brand mark). */
export function JompMark({
  className,
  tone = "navy",
  title = APP_NAME,
}: {
  className?: string;
  tone?: LogoTone;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 124 125"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <g
        transform="translate(0,125) scale(0.1,-0.1)"
        fill={TONE[tone]}
        stroke="none"
      >
        <path d="M553 1065 c-40 -28 -23 -115 22 -115 14 0 145 -153 145 -170 0 -6 27-10 65 -10 69 0 118 -17 129 -45 13 -36 6 -82 -17 -103 -19 -18 -36 -22 -127-24 l-105 -3 -3 -204 c-1 -120 2 -209 7 -214 14 -14 68 20 105 66 28 35 31 46 35 123 l3 84 37 0 c63 0 111 20 155 63 46 46 66 99 66 172 0 70 -19 121 -61 165 -41 42 -113 70 -181 70 -33 0 -38 -3 -38 -23 0 -28 -26 -67 -45 -67 -12 0 -12 6 1 35 8 20 12 40 9 45 -4 6 -23 10 -44 10 -25 0 -44 7 -56 20 -15 17 -16 23 -5 50 11 28 11 34 -7 58 -24 32 -59 39 -90 17z M482 908 c-9 -9 -12 -84 -12 -275 l0 -264 -25 -24 c-41 -42 -96 -28 -121 31 l-14 34 -70 0 c-66 0 -70 -1 -70 -22 0 -87 69 -177 156 -205 45 -14 61 -15 108 -4 72 16 113 45 151 105 l30 49 5 211 5 210 33 8 c18 5 32 12 30 16 -2 5 -25 38 -53 75 -49 66 -51 67 -95 67 -26 0 -51 -5 -58 -12z" />
      </g>
    </svg>
  );
}

/** Official JOMP wordmark. */
export function JompWordmark({
  className,
  tone = "navy",
}: {
  className?: string;
  tone?: LogoTone;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 144 44"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={APP_NAME}
    >
      <title>{APP_NAME}</title>
      <g
        transform="translate(0,44) scale(0.1,-0.1)"
        fill={TONE[tone]}
        stroke="none"
      >
        <path d="M415 315 c-22 -8 -41 -15 -42 -15 -1 0 -14 -17 -28 -37 -18 -28 -25-51 -25 -88 0 -67 27 -111 86 -137 62 -27 118 -19 170 26 35 31 38 37 41 97 3 51 0 70 -16 96 -36 58 -117 83 -186 58z m105 -65 c10 -5 23 -25 29 -43 15 -45 -2 -93 -41 -113 -43 -22 -91 -4 -113 42 -18 39 -13 67 18 102 22 24 74 30 107 12z M140 211 c0 -84 -3 -111 -15 -121 -12 -10 -20 -9 -39 4 -23 14 -26 14 -47-3 -20 -16 -21 -21 -10 -34 7 -9 28 -21 47 -27 25 -9 43 -9 69 0 53 18 65 50 65 180 l0 110 -35 0 -35 0 0 -109z M730 175 l0 -145 30 0 29 0 3 86 3 87 35-61 c21 -36 42 -62 52 -62 9 0 32 24 52 57 l36 57 0 -82 0 -82 35 0 35 0 0 145 0 145 -34 0 c-32 0 -37 -5 -79 -76 l-44 -76 -44 76 c-40 70 -47 76 -76 76 l-33 0 0 -145z M1152 178 l3 -143 33 -3 c32 -3 32 -3 32 41 l0 45 57 4 c46 4 61 10 80 32 16 19 23 40 23 67 0 31 -7 47 -29 70 -28 28 -34 29 -116 29 l-86 0 3 -142z m156 48 c4 -34 -10 -46 -55 -46 -32 0 -33 1 -33 41 l0 40 43 -3 c38 -3 42 -6 45 -32z" />
      </g>
    </svg>
  );
}

export function Logo({
  variant = "lockup",
  tone = "navy",
  tagline = false,
  className,
  markClassName,
}: LogoProps) {
  const color = TONE[tone];

  if (variant === "mark") {
    return <JompMark className={cn("h-8 w-8", markClassName, className)} tone={tone} />;
  }

  if (variant === "wordmark") {
    return <JompWordmark className={cn("h-7 w-auto", className)} tone={tone} />;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-1.5", className)}>
        <JompMark className={cn("h-12 w-12", markClassName)} tone={tone} />
        <JompWordmark className="h-7 w-auto" tone={tone} />
        {tagline && (
          <p
            className="text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color, fontFamily: "var(--font-heading), Poppins, sans-serif" }}
          >
            {APP_TAGLINE}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <JompMark className={cn("h-9 w-9", markClassName)} tone={tone} />
      <span
        aria-hidden
        className="hidden h-8 w-px sm:block"
        style={{ backgroundColor: color, opacity: 0.35 }}
      />
      <div className="flex min-w-0 flex-col justify-center">
        <JompWordmark className="h-6 w-auto sm:h-7" tone={tone} />
        {tagline && (
          <p
            className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.16em] sm:block"
            style={{ color, fontFamily: "var(--font-heading), Poppins, sans-serif" }}
          >
            {APP_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );
}

export default Logo;
