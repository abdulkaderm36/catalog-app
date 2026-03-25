import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  meta?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, meta, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 border",
        accent
          ? "bg-[var(--accent)] border-[var(--accent)] text-white"
          : "bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-card)]",
        className
      )}
    >
      <p className={cn("text-xs uppercase tracking-widest font-medium mb-1", accent ? "text-white/60" : "text-[var(--text-muted)]")}>
        {label}
      </p>
      <p className={cn("text-3xl font-black tracking-tight", accent ? "text-white" : "text-[var(--text-primary)]")}>
        {value}
      </p>
      {meta && (
        <p className={cn("text-xs mt-1", accent ? "text-white/70" : "text-[var(--text-secondary)]")}>
          {meta}
        </p>
      )}
    </div>
  );
}
