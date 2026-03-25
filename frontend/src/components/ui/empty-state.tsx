import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-2">
        <div className="w-8 h-8 rounded-xl bg-[var(--border)]" />
      </div>
      <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>}
      {action && (
        <Button className="mt-2" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
