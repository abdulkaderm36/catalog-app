import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Plus, BookOpen, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type NavTab = { kind: "nav"; to: string; label: string; icon: LucideIcon };
type ActionTab = { kind: "action"; to: string; label: string; icon: LucideIcon };
type CatalogTab = { kind: "catalog"; label: string; icon: LucideIcon };
type Tab = NavTab | ActionTab | CatalogTab;

const tabs: Tab[] = [
  { kind: "nav", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { kind: "nav", to: "/products", label: "Products", icon: Package },
  { kind: "action", to: "/products/new", label: "Add", icon: Plus },
  { kind: "catalog", label: "Catalog", icon: BookOpen },
];

export function MobileTabBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-[60px]">
        {tabs.map((tab) => {
          if (tab.kind === "catalog") {
            return (
              <button
                key={tab.label}
                type="button"
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                onClick={() => user?.companySlug && navigate(`/catalog/${user.companySlug}`)}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          if (tab.kind === "action") {
            return (
              <NavLink
                key={tab.label}
                to={tab.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                  <tab.icon className="w-5 h-5 text-white" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.label}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon className="w-5 h-5" />
                  <span className={cn("text-[10px] font-medium", isActive && "text-[var(--accent)]")}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
