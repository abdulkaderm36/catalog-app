import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/settings", label: "Settings" },
];

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <header className="sticky top-0 z-50 h-[52px] border-b border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-sm">
      <div className="max-w-[960px] mx-auto px-6 h-full flex items-center gap-6">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-white" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Catalogr</span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user?.companySlug && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex gap-1.5 text-[var(--text-secondary)]"
              asChild
            >
              <Link to={`/catalog/${user.companySlug}`} target="_blank">
                View Catalog <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <Button size="sm" onClick={() => navigate("/products/new")} className="hidden sm:flex">
            + Add Product
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] flex items-center justify-center hover:border-[var(--accent)] transition-colors">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user?.companyName}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
