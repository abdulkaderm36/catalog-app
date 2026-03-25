# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire frontend with the Chalk + Warm Amber + Midnight Slate design system across all 7 pages with light/dark theme, mobile responsiveness, and full API integration.

**Architecture:** Top-nav authenticated layout with `AuthContext` for session state, `AuthGuard` for route protection, Sonner for toasts, and TanStack Query for all data fetching. CSS custom properties for all design tokens, Tailwind v4 dark mode via `data-theme` attribute on `<html>`.

**Tech Stack:** React 19, Vite 6, Tailwind CSS v4, shadcn/ui (New York), React Router v7, TanStack Query v5, react-hook-form + zod, Geist font (npm), Sonner, @dnd-kit/core + sortable

---

## File Map

### New files to create
- `frontend/src/index.css` — replace entirely: Geist import, Tailwind v4 config, CSS tokens
- `frontend/src/hooks/use-theme.ts` — theme toggle hook
- `frontend/src/context/auth-context.tsx` — auth context + provider
- `frontend/src/components/layout/auth-guard.tsx`
- `frontend/src/components/layout/auth-layout.tsx`
- `frontend/src/components/layout/app-shell.tsx` — replaces `src/ui/app-shell.tsx`
- `frontend/src/components/layout/top-nav.tsx`
- `frontend/src/components/layout/public-nav.tsx`
- `frontend/src/components/layout/mobile-tab-bar.tsx`
- `frontend/src/components/ui/theme-toggle.tsx`
- `frontend/src/components/ui/stat-card.tsx`
- `frontend/src/components/ui/status-badge.tsx`
- `frontend/src/components/ui/product-card.tsx`
- `frontend/src/components/ui/product-table-row.tsx`
- `frontend/src/components/ui/catalog-card.tsx`
- `frontend/src/components/ui/image-upload.tsx`
- `frontend/src/components/ui/owner-notice.tsx`
- `frontend/src/components/ui/empty-state.tsx`
- `frontend/src/components/ui/skeleton-card.tsx`

### Files to replace entirely
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/input.tsx`
- `frontend/src/components/ui/textarea.tsx`
- `frontend/src/views/login-page.tsx`
- `frontend/src/views/signup-page.tsx`
- `frontend/src/views/dashboard-page.tsx`
- `frontend/src/views/products-page.tsx`
- `frontend/src/views/product-editor-page.tsx`
- `frontend/src/views/catalog-page.tsx`
- `frontend/src/views/settings-page.tsx`
- `frontend/src/router.tsx`
- `frontend/src/main.tsx`
- `frontend/vite.config.ts`

### Files to add new shadcn components
- `frontend/src/components/ui/switch.tsx` — Radix Switch
- `frontend/src/components/ui/alert-dialog.tsx` — Radix AlertDialog
- `frontend/src/components/ui/dropdown-menu.tsx` — Radix DropdownMenu
- `frontend/src/components/ui/select.tsx` — Radix Select
- `frontend/src/components/ui/sonner.tsx` — Sonner Toaster wrapper

### Files to delete after migration
- `frontend/src/ui/app-shell.tsx` (old location)

### Keep as-is
- `frontend/src/lib/utils.ts` — `cn()` helper

---

## Task 1: Install missing dependencies + fix port conflict

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Install packages**

```bash
cd frontend && bun add geist sonner react-hook-form @hookform/resolvers zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @radix-ui/react-switch @radix-ui/react-alert-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
```

- [ ] **Step 2: Verify package.json has all new deps**

Run: `cat frontend/package.json | grep -E "geist|sonner|react-hook-form|zod|dnd-kit"`
Expected: all 5 lines present

- [ ] **Step 3: Fix port conflict — change Vite to port 5173, add API proxy to backend port 3001**

Replace `frontend/vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd frontend && git add package.json bun.lockb vite.config.ts
git commit -m "chore: install design system deps, fix vite port + api proxy"
```

---

## Task 2: Replace index.css — design tokens + Tailwind v4 config

**Files:**
- Replace: `frontend/src/index.css`

- [ ] **Step 1: Write new index.css**

```css
@import 'geist/dist/geist.css';
@import 'geist/dist/geist-mono.css';
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@layer base {
  :root {
    --bg-base: #fafaf9;
    --bg-surface: #ffffff;
    --bg-elevated: #f5f5f3;
    --border: #e8e8e5;
    --border-subtle: #f0f0ee;
    --text-primary: #111111;
    --text-secondary: #888888;
    --text-muted: #bbbbbb;
    --accent: #d97706;
    --accent-light: #f59e0b;
    --accent-pale-bg: #fef3c7;
    --accent-pale-text: #92400e;
    --accent-pale-border: #fde68a;
    --shadow-card: 0 1px 3px rgba(0,0,0,0.04);
    --shadow-elevated: 0 4px 16px rgba(0,0,0,0.06);
  }

  [data-theme="dark"] {
    --bg-base: #0f1117;
    --bg-surface: #161b27;
    --bg-elevated: #1e2537;
    --border: #2d3748;
    --border-subtle: #1e2537;
    --text-primary: #f1f5f9;
    --text-secondary: #64748b;
    --text-muted: #3d4f6e;
    --accent: #d97706;
    --accent-light: #f59e0b;
    --accent-pale-bg: rgba(217,119,6,0.15);
    --accent-pale-text: #f59e0b;
    --accent-pale-border: rgba(217,119,6,0.3);
    --shadow-card: none;
    --shadow-elevated: none;
  }

  *, *::before, *::after {
    transition-property: background-color, border-color, color;
    transition-duration: 200ms;
    transition-timing-function: ease;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Geist', system-ui, sans-serif;
    background-color: var(--bg-base);
    color: var(--text-primary);
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: replace index.css with Chalk design tokens + Tailwind v4 config"
```

---

## Task 3: useTheme hook + AuthContext

**Files:**
- Create: `frontend/src/hooks/use-theme.ts`
- Create: `frontend/src/context/auth-context.tsx`

- [ ] **Step 1: Create use-theme.ts**

```ts
// frontend/src/hooks/use-theme.ts
import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState(t => t === "dark" ? "light" : "dark"), []);

  return { theme, setTheme, toggleTheme };
}
```

- [ ] **Step 2: Create auth-context.tsx**

```tsx
// frontend/src/context/auth-context.tsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companySlug: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((u: User) => setUser(u), []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/use-theme.ts frontend/src/context/auth-context.tsx
git commit -m "feat: add useTheme hook and AuthContext"
```

---

## Task 4: Replace shadcn primitives (button, card, input, textarea)

**Files:**
- Replace: `frontend/src/components/ui/button.tsx`
- Replace: `frontend/src/components/ui/card.tsx`
- Replace: `frontend/src/components/ui/input.tsx`
- Replace: `frontend/src/components/ui/textarea.tsx`

- [ ] **Step 1: Replace button.tsx**

```tsx
// frontend/src/components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-white hover:bg-[var(--accent-light)]",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
        outline: "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
        destructive: "bg-red-600 text-white hover:bg-red-500",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

- [ ] **Step 2: Replace card.tsx**

```tsx
// frontend/src/components/ui/card.tsx
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-[var(--text-primary)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
```

- [ ] **Step 3: Replace input.tsx**

```tsx
// frontend/src/components/ui/input.tsx
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Replace textarea.tsx**

```tsx
// frontend/src/components/ui/textarea.tsx
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[100px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-y",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/button.tsx frontend/src/components/ui/card.tsx frontend/src/components/ui/input.tsx frontend/src/components/ui/textarea.tsx
git commit -m "style: replace shadcn primitives with Chalk design system variants"
```

---

## Task 5: Add new shadcn/Radix components (select, switch, alert-dialog, dropdown-menu, sonner)

**Files:**
- Create: `frontend/src/components/ui/select.tsx`
- Create: `frontend/src/components/ui/switch.tsx`
- Create: `frontend/src/components/ui/alert-dialog.tsx`
- Create: `frontend/src/components/ui/dropdown-menu.tsx`
- Create: `frontend/src/components/ui/sonner.tsx`

- [ ] **Step 1: Create select.tsx**

```tsx
// frontend/src/components/ui/select.tsx
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent data-[placeholder]:text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)]",
          className
        )}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:bg-[var(--bg-elevated)] data-[state=checked]:text-[var(--accent)]",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
```

- [ ] **Step 2: Create switch.tsx**

```tsx
// frontend/src/components/ui/switch.tsx
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--accent)] data-[state=unchecked]:bg-[var(--border)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}
```

- [ ] **Step 3: Create alert-dialog.tsx**

```tsx
// frontend/src/components/ui/alert-dialog.tsx
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({ className, children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-elevated)]",
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title className={cn("text-base font-semibold text-[var(--text-primary)]", className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description className={cn("mt-1 text-sm text-[var(--text-secondary)]", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-3 mt-6", className)} {...props} />;
}

export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
```

- [ ] **Step 4: Create dropdown-menu.tsx**

```tsx
// frontend/src/components/ui/dropdown-menu.tsx
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-elevated)]",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:bg-[var(--bg-elevated)] gap-2",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("my-1 h-px bg-[var(--border-subtle)]", className)} {...props} />;
}
```

- [ ] **Step 5: Create sonner.tsx**

```tsx
// frontend/src/components/ui/sonner.tsx
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        },
      }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/select.tsx frontend/src/components/ui/switch.tsx frontend/src/components/ui/alert-dialog.tsx frontend/src/components/ui/dropdown-menu.tsx frontend/src/components/ui/sonner.tsx
git commit -m "feat: add select, switch, alert-dialog, dropdown-menu, sonner components"
```

---

## Task 6: Shared UI components

**Files:**
- Create: `frontend/src/components/ui/theme-toggle.tsx`
- Create: `frontend/src/components/ui/status-badge.tsx`
- Create: `frontend/src/components/ui/stat-card.tsx`
- Create: `frontend/src/components/ui/empty-state.tsx`
- Create: `frontend/src/components/ui/skeleton-card.tsx`
- Create: `frontend/src/components/ui/owner-notice.tsx`
- Create: `frontend/src/components/ui/product-table-row.tsx`
- Create: `frontend/src/components/ui/product-card.tsx`
- Create: `frontend/src/components/ui/catalog-card.tsx`
- Create: `frontend/src/components/ui/image-upload.tsx`

- [ ] **Step 1: Create theme-toggle.tsx**

```tsx
// frontend/src/components/ui/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

- [ ] **Step 2: Create status-badge.tsx**

```tsx
// frontend/src/components/ui/status-badge.tsx
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
```

- [ ] **Step 3: Create stat-card.tsx**

```tsx
// frontend/src/components/ui/stat-card.tsx
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
```

- [ ] **Step 4: Create empty-state.tsx**

```tsx
// frontend/src/components/ui/empty-state.tsx
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
```

- [ ] **Step 5: Create skeleton-card.tsx**

```tsx
// frontend/src/components/ui/skeleton-card.tsx
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

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 animate-pulse">
      <div className="h-2.5 bg-[var(--bg-elevated)] rounded w-20 mb-3" />
      <div className="h-8 bg-[var(--bg-elevated)] rounded w-16" />
    </div>
  );
}
```

- [ ] **Step 6: Create owner-notice.tsx**

```tsx
// frontend/src/components/ui/owner-notice.tsx
export function OwnerNotice() {
  return (
    <div className="rounded-lg border border-[var(--accent-pale-border)] bg-[var(--accent-pale-bg)] px-4 py-3 mb-5">
      <p className="text-xs font-medium text-[var(--accent-pale-text)]">
        Catalogr is for company owners. Create an account to start building your product catalog.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Create product-table-row.tsx**

```tsx
// frontend/src/components/ui/product-table-row.tsx
import { StatusBadge } from "./status-badge";

interface Product {
  id: string;
  name: string;
  price: number;
  status: "published" | "draft";
  createdAt: string;
  imageUrl?: string;
}

function getStatus(p: Product): "published" | "draft" | "new" {
  if (p.status === "draft") return "draft";
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  return isNew ? "new" : "published";
}

export function ProductTableRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex-shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
      </div>
      <span className="font-mono text-sm text-[var(--accent)] font-semibold mr-3">
        ${product.price.toLocaleString()}
      </span>
      <StatusBadge status={getStatus(product)} />
    </div>
  );
}
```

- [ ] **Step 8: Create product-card.tsx**

```tsx
// frontend/src/components/ui/product-card.tsx
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./status-badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  status: "published" | "draft";
  featured?: boolean;
  imageUrl?: string;
  createdAt: string;
  companySlug?: string;
}

function getStatus(p: Product): "published" | "draft" | "new" {
  if (p.status === "draft") return "draft";
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  return isNew ? "new" : "published";
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "rounded-xl border bg-[var(--bg-surface)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-150",
        product.featured ? "border-[var(--accent-pale-border)]" : "border-[var(--border)]"
      )}
    >
      <div className="relative h-[100px] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--border)]">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-2 left-2">
          <StatusBadge status={getStatus(product)} />
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate mb-0.5">{product.name}</p>
        <p className="font-mono text-sm text-[var(--accent)] font-bold">${product.price.toLocaleString()}</p>
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${product.id}/edit`)}>Edit</Button>
          {product.status === "published" && product.companySlug && (
            <Button size="sm" asChild>
              <a href={`/catalog/${product.companySlug}`} target="_blank" rel="noopener">View ↗</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create catalog-card.tsx**

```tsx
// frontend/src/components/ui/catalog-card.tsx
interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export function CatalogCard({ product, onDetails }: { product: CatalogProduct; onDetails: () => void }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden hover:border-[var(--accent-pale-border)] transition-colors duration-150 cursor-pointer" onClick={onDetails}>
      <div className="h-[130px] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--border)]">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{product.name}</p>
        {product.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-[var(--accent)]">${product.price.toLocaleString()}</span>
          <button className="text-xs font-semibold text-[var(--accent)] hover:underline">Details →</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create image-upload.tsx**

```tsx
// frontend/src/components/ui/image-upload.tsx
import { useRef, useState, useCallback } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  url: string;
  isCover: boolean;
  progress?: number;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  onUpload: (file: File) => Promise<void>;
}

function SortableImage({ image, onRemove, onSetCover }: { image: UploadedImage; onRemove: (id: string) => void; onSetCover: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative rounded-lg overflow-hidden border-2 cursor-default", image.isCover ? "border-[var(--accent)]" : "border-[var(--border)]")}
    >
      <img src={image.url} alt="" className="w-full h-20 object-cover" />
      {image.progress !== undefined && image.progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]">
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${image.progress}%` }} />
        </div>
      )}
      <button
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
        onClick={() => onRemove(image.id)}
      >
        <X className="w-3 h-3" />
      </button>
      <button
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      {!image.isCover && (
        <button
          className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded"
          onClick={() => onSetCover(image.id)}
        >
          Set cover
        </button>
      )}
      {image.isCover && (
        <span className="absolute bottom-1 left-1 text-[10px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded">Cover</span>
      )}
    </div>
  );
}

export function ImageUpload({ images, onChange, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(f => onUpload(f));
  }, [onUpload]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(i => i.id === active.id);
      const newIndex = images.findIndex(i => i.id === over.id);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const removeImage = (id: string) => onChange(images.filter(i => i.id !== id));
  const setCover = (id: string) => onChange(images.map(i => ({ ...i, isCover: i.id === id })));

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-150",
          isDragOver ? "border-[var(--accent)] bg-[var(--accent-pale-bg)]" : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-pale-bg)]"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <p className="text-sm text-[var(--text-secondary)]">Click to upload or drag and drop</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG up to 10MB · Max 10 images</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {images.map(img => (
                <SortableImage key={img.id} image={img} onRemove={removeImage} onSetCover={setCover} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add frontend/src/components/ui/
git commit -m "feat: add shared UI components (stat-card, product-card, catalog-card, image-upload, etc.)"
```

---

## Task 7: Layout components

**Files:**
- Create: `frontend/src/components/layout/auth-guard.tsx`
- Create: `frontend/src/components/layout/auth-layout.tsx`
- Create: `frontend/src/components/layout/top-nav.tsx`
- Create: `frontend/src/components/layout/mobile-tab-bar.tsx`
- Create: `frontend/src/components/layout/public-nav.tsx`
- Create: `frontend/src/components/layout/app-shell.tsx`

- [ ] **Step 1: Create auth-guard.tsx**

```tsx
// frontend/src/components/layout/auth-guard.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface AuthGuardProps {
  reverse?: boolean; // if true, redirect logged-in users away (for /login, /signup)
  children?: React.ReactNode;
}

export function AuthGuard({ reverse = false, children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reverse && !user) return <Navigate to="/login" replace />;
  if (reverse && user) return <Navigate to="/dashboard" replace />;

  return children ? <>{children}</> : <Outlet />;
}
```

- [ ] **Step 2: Create auth-layout.tsx**

```tsx
// frontend/src/components/layout/auth-layout.tsx
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
```

- [ ] **Step 3: Create top-nav.tsx**

```tsx
// frontend/src/components/layout/top-nav.tsx
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

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/settings", label: "Settings" },
  ];

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

        {/* Nav — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {navLinks.map(link => (
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
          {/* View Catalog — hidden on tablet md */}
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
          {/* Avatar dropdown */}
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
              <DropdownMenuItem onClick={async () => { await logout(); navigate("/login"); }}>
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create mobile-tab-bar.tsx**

```tsx
// frontend/src/components/layout/mobile-tab-bar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Plus, BookOpen } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/products/new", label: "Add", icon: Plus, action: true },
  { to: "#catalog", label: "Catalog", icon: BookOpen, isCatalog: true },
];

export function MobileTabBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-[60px]">
        {tabs.map(tab => {
          if (tab.isCatalog) {
            return (
              <button
                key={tab.label}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                onClick={() => user?.companySlug && navigate(`/catalog/${user.companySlug}`)}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }
          if (tab.action) {
            return (
              <NavLink key={tab.label} to={tab.to} className="flex-1 flex flex-col items-center justify-center gap-0.5">
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
                cn("flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon className="w-5 h-5" />
                  <span className={cn("text-[10px] font-medium", isActive && "text-[var(--accent)]")}>{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create public-nav.tsx**

```tsx
// frontend/src/components/layout/public-nav.tsx
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
          <span className="text-[var(--border)] select-none">·</span>
          <span className="text-xs text-[var(--text-muted)]">Product Catalog</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
            Powered by Catalogr
          </span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Create app-shell.tsx**

```tsx
// frontend/src/components/layout/app-shell.tsx
import { Outlet } from "react-router-dom";
import { TopNav } from "./top-nav";
import { MobileTabBar } from "./mobile-tab-bar";
import { Toaster } from "@/components/ui/sonner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TopNav />
      <main className="max-w-[960px] mx-auto px-6 py-8 pb-20 sm:pb-8">
        <Outlet />
      </main>
      <MobileTabBar />
      <Toaster />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout/
git commit -m "feat: add layout components (AppShell, TopNav, AuthGuard, MobileTabBar, PublicNav, AuthLayout)"
```

---

## Task 8: Login + Signup pages

**Files:**
- Replace: `frontend/src/views/login-page.tsx`
- Replace: `frontend/src/views/signup-page.tsx`

- [ ] **Step 1: Replace login-page.tsx**

```tsx
// frontend/src/views/login-page.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Invalid email or password");
      return;
    }
    const user = await res.json();
    login(user);
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px] sm:rounded-[14px] sm:border sm:border-[var(--border)] sm:bg-[var(--bg-surface)] sm:shadow-[var(--shadow-elevated)] px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">Catalogr</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">Password</label>
            <button
              type="button"
              aria-disabled="true"
              className="text-xs text-[var(--accent)] opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              Forgot password?
            </button>
          </div>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in →"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--accent)] font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Replace signup-page.tsx**

```tsx
// frontend/src/views/signup-page.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OwnerNotice } from "@/components/ui/owner-notice";

const schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companySlug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const companyName = watch("companyName");
  useEffect(() => {
    if (companyName) setValue("companySlug", toSlug(companyName), { shouldValidate: false });
  }, [companyName, setValue]);

  const onSubmit = async (data: FormData) => {
    const { confirmPassword, ...payload } = data;
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.message ?? "Failed to create account");
      return;
    }
    const user = await res.json();
    login(user);
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-[420px] sm:rounded-[14px] sm:border sm:border-[var(--border)] sm:bg-[var(--bg-surface)] sm:shadow-[var(--shadow-elevated)] px-8 py-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-sm bg-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">Catalogr</span>
      </div>

      <OwnerNotice />

      <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mb-1">Create your account</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Set up your company catalog in minutes</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Company name</label>
          <Input placeholder="Acme Co." {...register("companyName")} />
          {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
            Catalog URL: <span className="text-[var(--text-muted)]">catalogr.app/</span>
            <span className="text-[var(--accent)] font-mono">{watch("companySlug") || "your-slug"}</span>
          </label>
          <Input placeholder="acme-co" {...register("companySlug")} className="font-mono" />
          {errors.companySlug && <p className="text-xs text-red-500 mt-1">{errors.companySlug.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Your name</label>
            <Input placeholder="Jane Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
            <Input type="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
          <Input type="password" placeholder="Min 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Confirm password</label>
          <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account →"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/login-page.tsx frontend/src/views/signup-page.tsx
git commit -m "feat: login and signup pages with react-hook-form + zod validation"
```

---

## Task 9: Dashboard page

**Files:**
- Replace: `frontend/src/views/dashboard-page.tsx`

- [ ] **Step 1: Replace dashboard-page.tsx**

```tsx
// frontend/src/views/dashboard-page.tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { StatCard } from "@/components/ui/stat-card";
import { ProductTableRow } from "@/components/ui/product-table-row";
import { SkeletonStat, SkeletonRow } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  catalogViews: number;
  productViews: number;
  topProduct: { name: string; views: number } | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  status: "published" | "draft";
  createdAt: string;
  imageUrl?: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const statsQuery = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetch("/api/dashboard/stats", { credentials: "include" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ["recent-products"],
    queryFn: () => fetch("/api/products?limit=5&sort=createdAt", { credentials: "include" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {getGreeting()}, {user?.companyName}
        </p>
      </div>

      {/* Stats */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SkeletonStat /><SkeletonStat /><SkeletonStat className="col-span-2 sm:col-span-1" />
        </div>
      ) : statsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Could not load stats. <button onClick={() => statsQuery.refetch()} className="underline ml-1">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Products"
            value={statsQuery.data!.totalProducts}
            meta={`${statsQuery.data!.publishedProducts} published · ${statsQuery.data!.draftProducts} drafts`}
          />
          <StatCard
            label="Catalog Views"
            value={statsQuery.data!.catalogViews.toLocaleString()}
            accent
          />
          <StatCard
            label="Product Views"
            value={statsQuery.data!.productViews.toLocaleString()}
            meta={statsQuery.data!.topProduct ? `Top: ${statsQuery.data!.topProduct.name}` : undefined}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
            View all →
          </Button>
        </CardHeader>
        {productsQuery.isLoading ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : productsQuery.isError ? (
          <CardContent>
            <p className="text-sm text-[var(--text-secondary)]">Could not load products.</p>
          </CardContent>
        ) : productsQuery.data?.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add your first product to get started"
            action={{ label: "+ Add product", onClick: () => navigate("/products/new") }}
          />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {productsQuery.data!.map(p => <ProductTableRow key={p.id} product={p} />)}
          </div>
        )}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/dashboard-page.tsx
git commit -m "feat: dashboard page with stats + recent products"
```

---

## Task 10: Products page

**Files:**
- Replace: `frontend/src/views/products-page.tsx`

- [ ] **Step 1: Replace products-page.tsx**

```tsx
// frontend/src/views/products-page.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ui/product-card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  status: "published" | "draft";
  featured?: boolean;
  imageUrl?: string;
  createdAt: string;
}

type Filter = "all" | "published" | "draft";

export function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products", { credentials: "include" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  });

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter(p => {
      const matchesFilter = filter === "all" || p.status === filter;
      const matchesSearch = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [query.data, filter, debouncedSearch]);

  const filterTabs: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Products</h1>
        <Button onClick={() => navigate("/products/new")}>+ Add Product</Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Could not load products. <button onClick={() => query.refetch()} className="underline ml-1">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? "No products match your search" : "No products yet"}
          description={debouncedSearch ? "Try a different search term" : "Add your first product to get started"}
          action={!debouncedSearch ? { label: "+ Add product", onClick: () => navigate("/products/new") } : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={{ ...p, companySlug: user?.companySlug }} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create use-debounce hook**

```ts
// frontend/src/hooks/use-debounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/products-page.tsx frontend/src/hooks/use-debounce.ts
git commit -m "feat: products page with search, filter, grid layout"
```

---

## Task 11: Product Editor page

**Files:**
- Replace: `frontend/src/views/product-editor-page.tsx`

- [ ] **Step 1: Replace product-editor-page.tsx**

```tsx
// frontend/src/views/product-editor-page.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  sku: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  slug: z.string().optional(),
  externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductEditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!productId;
  const [images, setImages] = useState<Array<{ id: string; url: string; isCover: boolean; progress?: number }>>([]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "draft", featured: false },
  });

  const productName = watch("name");
  useEffect(() => {
    if (!isEditing && productName) {
      setValue("slug", toSlug(productName), { shouldValidate: false });
    }
  }, [productName, isEditing, setValue]);

  useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetch(`/api/products/${productId}`, { credentials: "include" }).then(r => r.json()),
    enabled: isEditing,
    select: (data: any) => { reset(data); setImages(data.images ?? []); return data; },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, images }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "Save failed");
      return res.json();
    },
    onSuccess: () => {
      toast("Product saved");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (file: File) => {
    const tempId = Math.random().toString(36).slice(2);
    setImages(prev => [...prev, { id: tempId, url: URL.createObjectURL(file), isCover: prev.length === 0, progress: 0 }]);
    try {
      const { uploadUrl, imageId } = await fetch(`/api/products/${productId ?? "new"}/images/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      }).then(r => r.json());

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setImages(prev => prev.map(i => i.id === tempId ? { ...i, progress: pct } : i));
        }
      };
      await new Promise<void>((res, rej) => {
        xhr.onload = () => res();
        xhr.onerror = () => rej();
        xhr.open("PUT", uploadUrl);
        xhr.send(file);
      });

      const confirmed = await fetch(`/api/products/${productId ?? "new"}/images/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageId }),
      }).then(r => r.json());

      setImages(prev => prev.map(i => i.id === tempId ? { ...confirmed, progress: 100 } : i));
    } catch {
      setImages(prev => prev.filter(i => i.id !== tempId));
      toast.error("Image upload failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          {isEditing ? "Edit Product" : "New Product"}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/products")}>Discard</Button>
          <Button variant="outline" onClick={handleSubmit(d => saveMutation.mutate({ ...d, status: "draft" }))}>
            Save draft
          </Button>
          <Button onClick={handleSubmit(d => saveMutation.mutate({ ...d, status: "published" }))} disabled={isSubmitting}>
            Publish →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Product details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Product name *</label>
                <Input placeholder="e.g. Wool Scarf" {...register("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description *</label>
                <Textarea placeholder="Describe your product…" {...register("description")} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Price *</label>
                  <Input type="number" step="0.01" placeholder="0.00" {...register("price")} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">SKU</label>
                  <Input placeholder="PROD-001" {...register("sku")} className="font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
                <Select onValueChange={v => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} onUpload={handleUpload} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
                <Select
                  defaultValue="draft"
                  onValueChange={v => setValue("status", v as "draft" | "published")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Feature in catalog</p>
                  <p className="text-xs text-[var(--text-secondary)]">Highlighted at the top</p>
                </div>
                <Switch
                  checked={watch("featured")}
                  onCheckedChange={v => setValue("featured", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Slug</label>
                <Input placeholder="my-product" {...register("slug")} className="font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">External URL</label>
                <Input placeholder="https://…" {...register("externalUrl")} />
                {errors.externalUrl && <p className="text-xs text-red-500 mt-1">{errors.externalUrl.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/product-editor-page.tsx
git commit -m "feat: product editor page (new + edit) with image upload, sidebar, react-hook-form"
```

---

## Task 12: Settings page

**Files:**
- Replace: `frontend/src/views/settings-page.tsx`

- [ ] **Step 1: Replace settings-page.tsx**

```tsx
// frontend/src/views/settings-page.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  companyName: z.string().min(1, "Required"),
  companySlug: z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
});

const accountSchema = z.object({
  name: z.string().min(1, "Required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { companyName: user?.companyName ?? "", companySlug: user?.companySlug ?? "" } });
  const accountForm = useForm({ resolver: zodResolver(accountSchema), defaultValues: { name: user?.name ?? "" } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: z.infer<typeof profileSchema>) => {
    const res = await fetch("/api/settings/company", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
    if (!res.ok) { toast.error("Failed to save"); return; }
    toast("Company profile saved");
  };

  const saveAccount = async (data: z.infer<typeof accountSchema>) => {
    const res = await fetch("/api/settings/account", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
    if (!res.ok) { toast.error("Failed to save"); return; }
    toast("Account saved");
  };

  const savePassword = async (data: z.infer<typeof passwordSchema>) => {
    const res = await fetch("/api/auth/password", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }) });
    if (!res.ok) { toast.error("Failed to update password"); return; }
    toast("Password updated");
    setShowPasswordForm(false);
    passwordForm.reset();
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    const res = await fetch("/api/auth/account", { method: "DELETE", credentials: "include" });
    setIsDeleting(false);
    if (!res.ok) { toast.error("Failed to delete account"); return; }
    setDeleteDialogOpen(false);
    await logout();
    navigate("/login");
    toast("Account deleted");
  };

  return (
    <div className="space-y-6 max-w-[600px]">
      <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>

      {/* Company Profile */}
      <Card>
        <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Company name</label>
              <Input {...profileForm.register("companyName")} />
              {profileForm.formState.errors.companyName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Catalog URL: <span className="font-mono text-[var(--accent)]">catalogr.app/{profileForm.watch("companySlug")}</span>
              </label>
              <Input {...profileForm.register("companySlug")} className="font-mono" />
              {profileForm.formState.errors.companySlug && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.companySlug.message}</p>}
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>Save</Button>
          </form>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={accountForm.handleSubmit(saveAccount)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Your name</label>
              <Input {...accountForm.register("name")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <Input value={user?.email} disabled className="opacity-60" />
            </div>
            <Button type="submit" disabled={accountForm.formState.isSubmitting}>Save account</Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            {!showPasswordForm ? (
              <button onClick={() => setShowPasswordForm(true)} className="text-sm text-[var(--accent)] font-medium hover:underline">
                Change password
              </button>
            ) : (
              <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Current password</label>
                  <Input type="password" {...passwordForm.register("currentPassword")} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">New password</label>
                  <Input type="password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Confirm new password</label>
                  <Input type="password" {...passwordForm.register("confirmPassword")} />
                  {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={passwordForm.formState.isSubmitting}>Update password</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Catalog Appearance — placeholder */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Catalog Appearance</CardTitle>
          <span className="text-xs bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">Coming soon</span>
        </CardHeader>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        <p className="text-sm text-[var(--text-secondary)]">Permanently delete your account and all associated data.</p>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your company, all products, and your catalog. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={deleteAccount} disabled={isDeleting}>
                  {isDeleting ? "Deleting…" : "Yes, delete everything"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/settings-page.tsx
git commit -m "feat: settings page (company profile, account, password change, delete account)"
```

---

## Task 13: Public Catalog page

**Files:**
- Replace: `frontend/src/views/catalog-page.tsx`

- [ ] **Step 1: Replace catalog-page.tsx**

```tsx
// frontend/src/views/catalog-page.tsx
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicNav } from "@/components/layout/public-nav";
import { CatalogCard } from "@/components/ui/catalog-card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Toaster } from "@/components/ui/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface CatalogData {
  company: { name: string; description?: string; logoUrl?: string };
  products: Array<{ id: string; name: string; description?: string; price: number; imageUrl?: string; category?: string; featured?: boolean }>;
}

export function CatalogPage() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery<CatalogData>({
    queryKey: ["catalog", companySlug],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/${companySlug}`);
      if (res.status === 404) throw Object.assign(new Error("Not found"), { status: 404 });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const categories = useMemo(() => {
    if (!query.data) return [];
    const cats = [...new Set(query.data.products.map(p => p.category).filter(Boolean))] as string[];
    return cats;
  }, [query.data]);

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return query.data.products.filter(p => {
      const matchesSearch = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [query.data, debouncedSearch, activeCategory]);

  if (query.isError && (query.error as any).status === 404) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">This catalog doesn't exist</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">The link may be wrong or this company no longer exists.</p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <PublicNav
        companyName={query.data?.company.name ?? ""}
        logoUrl={query.data?.company.logoUrl}
      />

      <div className="max-w-[960px] mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          {query.data && (
            <span className="inline-block bg-[var(--accent-pale-bg)] text-[var(--accent-pale-text)] border border-[var(--accent-pale-border)] text-xs font-semibold px-3 py-1 rounded-full">
              {query.data.products.length} products
            </span>
          )}
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {query.data?.company.name ?? " "}
          </h1>
          {query.data?.company.description && (
            <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto">{query.data.company.description}</p>
          )}
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn("flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                !activeCategory
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]"
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn("flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize",
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {query.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? "No products match your search" : "No products published yet"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <CatalogCard key={p.id} product={p} onDetails={() => {}} />
            ))}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/catalog-page.tsx
git commit -m "feat: public catalog page with search, category filter, hero section"
```

---

## Task 14: Rewire router + main.tsx

**Files:**
- Replace: `frontend/src/router.tsx`
- Replace: `frontend/src/main.tsx`

- [ ] **Step 1: Replace router.tsx**

```tsx
// frontend/src/router.tsx
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./components/layout/app-shell";
import { AuthLayout } from "./components/layout/auth-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { CatalogPage } from "./views/catalog-page";
import { DashboardPage } from "./views/dashboard-page";
import { LoginPage } from "./views/login-page";
import { ProductEditorPage } from "./views/product-editor-page";
import { ProductsPage } from "./views/products-page";
import { SettingsPage } from "./views/settings-page";
import { SignupPage } from "./views/signup-page";

export const router = createBrowserRouter([
  // Auth routes (redirect to /dashboard if logged in)
  {
    element: <AuthGuard reverse />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
        ],
      },
    ],
  },
  // Public catalog
  {
    path: "/catalog/:companySlug",
    element: <CatalogPage />,
  },
  // Authenticated routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/products/new", element: <ProductEditorPage /> },
          { path: "/products/:productId/edit", element: <ProductEditorPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
```

- [ ] **Step 2: Replace main.tsx**

```tsx
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./context/auth-context";
import { router } from "./router";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/router.tsx frontend/src/main.tsx
git commit -m "feat: rewire router with AuthGuard + AuthLayout + AppShell nesting"
```

---

## Task 15: Cleanup + TypeScript check

**Files:**
- Delete: `frontend/src/ui/app-shell.tsx`

- [ ] **Step 1: Delete old app-shell**

```bash
rm frontend/src/ui/app-shell.tsx
# If src/ui/ is now empty:
rmdir frontend/src/ui/ 2>/dev/null || true
```

- [ ] **Step 2: Run TypeScript check**

Run: `cd frontend && bun run check`
Expected: 0 errors

If errors appear, fix them before proceeding.

- [ ] **Step 3: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old src/ui/, fix TypeScript errors"
```

---

## Task 16: Browser verification

- [ ] **Step 1: Start dev server**

```bash
cd frontend && bun run dev
```

Verify in browser at `http://localhost:5173`:

- [ ] `/login` — centered card, amber button, Geist font, no layout issues
- [ ] `/signup` — 2-col name/email grid doesn't overflow, slug auto-generates from company name
- [ ] Theme toggle — switches between light/dark, persists on reload
- [ ] `/dashboard` — loads stats (or shows skeletons), recent products list
- [ ] `/products` — grid layout, search debounces, filter tabs work
- [ ] `/products/new` — 2-col layout on desktop, all fields present, image drop zone works
- [ ] `/settings` — forms prefilled with user data, delete account dialog opens
- [ ] `/catalog/:slug` — public page renders, no auth required, category pills work
- [ ] Mobile (DevTools 390px) — bottom tab bar visible, top nav links hidden, auth card edge-to-edge
- [ ] Dark mode persists on page reload

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "chore: verified frontend redesign complete"
```
