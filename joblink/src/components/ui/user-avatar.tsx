"use client";

import BoringAvatar from "boring-avatars";
import { cn } from "@/lib/utils";

/** JOMP navy family, so generated avatars feel on-brand. */
const PALETTE = ["#01224F", "#3d6aa8", "#8fb4e8", "#dbe7f7", "#f4b860"];

/**
 * Profile photo when we have one (e.g. from Google), otherwise a generated
 * "marble" avatar seeded by the user's email so it stays the same everywhere.
 */
export function UserAvatar({
  seed,
  imageUrl,
  size = 32,
  className,
}: {
  seed: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const url = imageUrl?.trim();

  if (url?.startsWith("http")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external avatar hosts vary; no need for next/image config
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-full", className)} style={{ width: size, height: size }}>
      <BoringAvatar name={seed || "jomp"} size={size} variant="marble" colors={PALETTE} />
    </span>
  );
}
