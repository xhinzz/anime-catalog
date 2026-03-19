"use client";

/**
 * Pure CSS section indicator - no icon library.
 * Uses a colored dot/ring as visual marker.
 */
interface Props {
  color: string;
  variant?: "dot" | "ring" | "bar";
}

export default function SectionIcon({ color, variant = "ring" }: Props) {
  if (variant === "dot") {
    return (
      <span
        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
    );
  }

  if (variant === "bar") {
    return (
      <span
        className="inline-block h-5 w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
    );
  }

  // ring (default)
  return (
    <span
      className="inline-block h-3 w-3 rounded-full flex-shrink-0 border-[2.5px]"
      style={{ borderColor: color }}
    />
  );
}
