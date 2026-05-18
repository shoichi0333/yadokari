import { MinpakuType, MINPAKU_TYPE_LABELS, MINPAKU_TYPE_COLORS } from "@/lib/minpaku";

interface Props {
  type: MinpakuType;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export default function MinpakuBadge({ type, showLabel = true, size = "md" }: Props) {
  const colorClass = MINPAKU_TYPE_COLORS[type];
  const label = MINPAKU_TYPE_LABELS[type];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      <span className="text-[10px]">{type === "NG" ? "✕" : "✓"}</span>
      {showLabel && label}
    </span>
  );
}
