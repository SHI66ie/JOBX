import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { SVGAttributes } from "react";

export type { IconSvgElement };

/** Hugeicons with the app's defaults: currentColor, 18px, 1.5 stroke. */
export function Icon({
  icon,
  size = 18,
  strokeWidth = 1.5,
  className,
  ...rest
}: {
  icon: IconSvgElement;
  size?: number;
  strokeWidth?: number;
  className?: string;
} & Omit<SVGAttributes<SVGSVGElement>, "strokeWidth">) {
  return (
    <HugeiconsIcon
      aria-hidden
      className={className}
      color="currentColor"
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

export default Icon;
