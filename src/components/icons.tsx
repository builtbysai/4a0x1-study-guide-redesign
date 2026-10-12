import React from 'react';

/**
 * Hand-drawn icon set for the 4A0X1 study app.
 * Drop-in replacement for lucide-react: same props (size, strokeWidth, className).
 * All icons: 24x24 viewBox, stroke=currentColor, fill=none, round caps/joins.
 */

export interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  strokeWidth = 2,
  className,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const make = (paths: React.ReactNode) => {
  const C: React.FC<IconProps> = (p) => <Svg {...p}>{paths}</Svg>;
  return C;
};

export const Home = make(
  <>
    <path d="M4 11.2 12 4l8 7.2" />
    <path d="M6 9.8V20h12V9.8" />
    <path d="M10 20v-5.2h4V20" />
  </>
);

export const BookOpen = make(
  <>
    <path d="M12 6.5C10 5 7.6 4.5 4 4.5v13.8c3.6 0 6 .5 8 2 2-1.5 4.4-2 8-2V4.5c-3.6 0-6 .5-8 2Z" />
    <path d="M12 6.5v13.8" />
  </>
);

export const Zap = make(
  <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
);

export const AlertCircle = make(
  <>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.6v5.2" />
    <path d="M12 16.4h.01" />
  </>
);

export const BarChart2 = make(
  <>
    <path d="M4 20h16" />
    <path d="M7 20v-6" />
    <path d="M12 20V6" />
    <path d="M17 20v-9" />
  </>
);

export const Settings = make(
  <>
    <path d="M4 7.5h9" />
    <path d="M17 7.5h3" />
    <circle cx="15" cy="7.5" r="2" />
    <path d="M4 16.5h3" />
    <path d="M11 16.5h9" />
    <circle cx="9" cy="16.5" r="2" />
  </>
);

export const Bookmark = make(
  <path d="M7 3.5h10V21l-5-3.4L7 21Z" />
);

export const Check = make(
  <path d="M4.5 12.5 10 18 19.5 6.5" />
);

export const X = make(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>
);

export const Star = make(
  <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" />
);

export const Flag = make(
  <>
    <path d="M5.5 21.5v-17" />
    <path d="M5.5 5c4-2.2 7 2.2 12 0v8.6c-5 2.2-8-2.2-12 0" />
  </>
);

export const ChevronRight = make(
  <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
);

export const ChevronDown = make(
  <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />
);

export const ChevronUp = make(
  <path d="m5.5 14.5 6.5-6.5 6.5 6.5" />
);

export const RefreshCw = make(
  <>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3.5V8h-4.5" />
  </>
);

export const RotateCcw = make(
  <>
    <path d="M4 12a8 8 0 1 0 2.34-5.66" />
    <path d="M4 3.5V8h4.5" />
  </>
);

export const ArrowLeft = make(
  <>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </>
);

export const ArrowRight = make(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>
);

export const CheckSquare = make(
  <>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="m8.5 12.3 2.4 2.4 4.8-5.4" />
  </>
);

export const Trash2 = make(
  <>
    <path d="M4 7h16" />
    <path d="M9.5 7V4.5h5V7" />
    <path d="M6.5 7l.9 13h9.2l.9-13" />
    <path d="M10 11v5.5M14 11v5.5" />
  </>
);

export const Download = make(
  <>
    <path d="M12 4v10.5" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M4.5 20h15" />
  </>
);

export const Upload = make(
  <>
    <path d="M12 14.5V4" />
    <path d="m7.5 8.5 4.5-4.5L16.5 8.5" />
    <path d="M4.5 20h15" />
  </>
);

export const AlertTriangle = make(
  <>
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
    <path d="M12 9.5v4.5" />
    <path d="M12 17.2h.01" />
  </>
);

export const ExternalLink = make(
  <>
    <path d="M14 4.5h5.5V10" />
    <path d="M19.5 4.5 11 13" />
    <path d="M18.5 13.5v6h-13v-13h6" />
  </>
);
