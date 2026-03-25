import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PublicNavProps {
  companyName: string;
  logoUrl?: string;
}

export function PublicNav({ companyName, logoUrl }: PublicNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-sm">
      <div className="max-w-[960px] mx-auto px-6 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
              {companyName[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-[var(--text-primary)]">{companyName}</span>
          <span className="text-[var(--border)] select-none hidden sm:inline">·</span>
          <span className="text-xs text-[var(--text-muted)] hidden sm:inline">Product Catalog</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full hidden sm:inline">
            Powered by Catalogr
          </span>
        </div>
      </div>
    </header>
  );
}
