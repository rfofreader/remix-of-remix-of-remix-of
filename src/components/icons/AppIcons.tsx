import type { SVGProps } from "react";

/** أيقونات الواجهة — مستوردة من مجموعة الأيقونات المرفقة (currentColor). */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 17H19M5 12H19M5 7H19" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" />
    </svg>
  );
}

export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6.5C10.5 5.2 8.5 4.5 6 4.5H3V19h3c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2h3V4.5h-3c-2.5 0-4.5.7-6 2Z" />
      <path d="M12 6.5V21" />
    </svg>
  );
}

export function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.75L6 21V4.5Z" />
    </svg>
  );
}
