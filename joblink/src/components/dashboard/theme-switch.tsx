"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Sun/moon toggle. The new theme spreads out from the button as a circle
 * (View Transitions API); browsers without it just switch instantly.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // Soft crossfade between themes (duration/easing set in globals.css).
    doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative flex size-9 items-center justify-center overflow-hidden rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        className,
      )}
    >
      <span
        className={cn(
          "absolute flex transition-[transform,opacity] duration-200 ease-out",
          isDark ? "-rotate-45 opacity-0" : "rotate-0 opacity-100",
        )}
      >
        <Icon icon={Sun03Icon} size={19} />
      </span>
      <span
        className={cn(
          "absolute flex transition-[transform,opacity] duration-200 ease-out",
          isDark ? "rotate-0 opacity-100" : "rotate-45 opacity-0",
        )}
      >
        <Icon icon={Moon02Icon} size={18} />
      </span>
    </button>
  );
}
