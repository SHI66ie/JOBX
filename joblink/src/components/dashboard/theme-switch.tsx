"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, type MouseEvent } from "react";
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

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
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
          "absolute flex transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark ? "-rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      >
        <Icon icon={Sun03Icon} size={19} />
      </span>
      <span
        className={cn(
          "absolute flex transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0",
        )}
      >
        <Icon icon={Moon02Icon} size={18} />
      </span>
    </button>
  );
}
