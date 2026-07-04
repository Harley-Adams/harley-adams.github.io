/* Inline SVG icons (stroke follows currentColor) used across PuzzleTime chrome. */
import React from "react";

type IconProps = { size?: number };

const base = (size: number): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const BackIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const HintIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
  </svg>
);

export const HelpIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.5" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const StatsIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 20V10" />
    <path d="M12 20V4" />
    <path d="M19 20v-7" />
  </svg>
);

export const MoreIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

export const CloseIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const BackspaceIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M21 5H8L2 12l6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
    <path d="M15 9l-4 6M11 9l4 6" />
  </svg>
);
