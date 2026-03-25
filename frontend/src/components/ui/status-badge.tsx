import { cn } from "@/lib/utils";

type Status = "published" | "draft" | "new";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const styles: Record<Status, string> = {
  published: "bg-[var(--accent-pale-bg)] text-[var(--accent-pale-text)] border border-[var(--accent-pale-border)]",
  draft: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]",
  new: "bg-[var(--accent-pale-bg)] text-[var(--accent)] border border-[var(--accent-pale-border)]",
};

const labels: Record<Status, string> = {
  published: "Live",
  draft: "Draft",
  new: "New",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", styles[status], className)}>
      {labels[status]}
    </span>
  );
}
