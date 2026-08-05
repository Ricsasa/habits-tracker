export interface BadgeProps {
  label: string;
  color?: string;
}

export default function Badge({ label, color }: BadgeProps) {
  return (
    <span
      style={color ? { borderColor: color } : undefined}
      className="inline-block border border-border-light bg-transparent px-2.5 py-1.5 text-xs text-content-primary rounded-none dark:border-border-light-dark dark:text-content-primary-dark"
    >
      {label}
    </span>
  );
}
