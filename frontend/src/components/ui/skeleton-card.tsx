import { cn } from "@/lib/utils";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden animate-pulse">
      <div className="h-[100px] bg-[var(--bg-elevated)]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[var(--bg-elevated)] rounded w-3/4" />
        <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/3" />
        <div className="h-2.5 bg-[var(--bg-elevated)] rounded w-1/4" />
      </div>
      <div className="h-5 w-12 bg-[var(--bg-elevated)] rounded" />
    </div>
  );
}

export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 animate-pulse", className)}>
      <div className="h-2.5 bg-[var(--bg-elevated)] rounded w-20 mb-3" />
      <div className="h-8 bg-[var(--bg-elevated)] rounded w-16" />
    </div>
  );
}
