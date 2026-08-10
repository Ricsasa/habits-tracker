'use client';

export type IconName = 'plus' | 'pencil' | 'trash';

export interface IconProps {
  name: IconName;
  className?: string;
}

const PATHS: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  pencil: 'M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16v4zM14.5 5.5l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
};

export default function Icon({ name, className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
