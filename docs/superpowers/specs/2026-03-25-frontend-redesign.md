# Frontend Redesign — Design Spec
**Date:** 2026-03-25
**Status:** Approved

---

## Overview

A full replacement of the existing frontend for the Catalog App — a SaaS product where company owners create and manage public-facing product catalogs. The redesign covers all 6 pages with a cohesive design system, light/dark theme, and full mobile responsiveness.

---

## Design System

### Identity
**Name:** Catalogr
**Stack:** React 19 + Vite + Tailwind CSS v4 + shadcn/ui (New York) + React Router v7 + react-hook-form + zod

### Aesthetic Direction: Chalk
Obsessive whitespace, hairline borders, soft elevation. Inspired by Linear, Vercel, and Raycast. Clarity as personality — every element earns its place.

### Font Loading
Geist is **not** on Google Fonts. Install via npm:
```bash
bun add geist
```
Import in `index.css`:
```css
@import 'geist/dist/geist.css';
@import 'geist/dist/geist-mono.css';
```
Then reference as `font-family: 'Geist', system-ui, sans-serif` and `'Geist Mono', monospace`.

### Color Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--bg-base` | `#fafaf9` | `#0f1117` |
| `--bg-surface` | `#ffffff` | `#161b27` |
| `--bg-elevated` | `#f5f5f3` | `#1e2537` |
| `--border` | `#e8e8e5` | `#2d3748` |
| `--border-subtle` | `#f0f0ee` | `#1e2537` |
| `--text-primary` | `#111111` | `#f1f5f9` |
| `--text-secondary` | `#888888` | `#64748b` |
| `--text-muted` | `#bbbbbb` | `#3d4f6e` |
| `--accent` | `#d97706` | `#d97706` |
| `--accent-light` | `#f59e0b` | `#f59e0b` |
| `--accent-pale-bg` | `#fef3c7` | `rgba(217,119,6,0.15)` |
| `--accent-pale-text` | `#92400e` | `#f59e0b` |
| `--accent-pale-border` | `#fde68a` | `rgba(217,119,6,0.3)` |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04)` | `none` |
| `--shadow-elevated` | `0 4px 16px rgba(0,0,0,0.06)` | `none` |

Note: In dark mode, depth is created through background color differences (`--bg-surface` vs `--bg-elevated`) rather than shadows.

**Dark base:** Midnight Slate `#0f1117` — cool blue-black. Amber accent pops with high contrast.

### Tailwind v4 Dark Mode Setup
In `index.css`, configure Tailwind's dark variant to use the `data-theme` attribute:
```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```
This aligns `dark:` utility classes with the `data-theme="dark"` attribute on `<html>`. CSS variable tokens also switch via the same selector:
```css
[data-theme="dark"] { --bg-base: #0f1117; /* ... */ }
```

### Typography
- **Display / Headings:** Geist (800–900 weight), `letter-spacing: -0.5px` to `-1px`
- **Body / UI:** Geist (400–600 weight)
- **Monospaced:** Geist Mono — prices, SKUs, slugs, code fields
- **Scale:** `text-xs` (11px) labels · `text-sm` (13px) body · `text-base` (15px) titles · `text-xl` (20px) page titles · `text-3xl` (28px) catalog hero

### Spacing & Shape
- Base border-radius: `8px` (inputs, cards), `6px` (badges, small elements), `12px` (catalog cards), `14px` (auth card desktop)
- Consistent padding: `16px` (cards), `24px` (containers), `28px` (page containers)
- Max content width: `960px`

---

## Theme Switching

Theme stored in `localStorage` key `'theme'` as `'dark' | 'light'`. On load, read storage first, then fall back to `window.matchMedia('(prefers-color-scheme: dark)')`. Applied via `document.documentElement.setAttribute('data-theme', theme)`.

**`useTheme` hook** (`frontend/src/hooks/use-theme.ts`):
```ts
// Returns { theme, setTheme, toggleTheme }
// Syncs to localStorage and sets data-theme on <html>
```

**Toast notifications:** Use shadcn **Sonner** (`<Toaster>` mounted once in `AppShell` and `AuthLayout`). Success: default, Error: `toast.error(...)`.

**`<ThemeToggle>`** placement:
- Authenticated top nav: right side, between "View Catalog" and avatar
- Public catalog nav: right side, after "Powered by Catalogr"
- Mobile: inside the top bar (icon-only, sun/moon icon)
- **Not** in the mobile bottom tab bar

---

## Authentication & Route Protection

### Auth Strategy
JWT with refresh tokens stored in HttpOnly cookies (handled by backend). Frontend stores minimal user state (id, name, company name, company slug) in React context — **not** localStorage.

### Auth Context (`frontend/src/context/auth-context.tsx`)
Provides `{ user, isLoading, login, logout }`. On app mount, calls `GET /api/auth/me` to verify session. While loading, show a full-screen spinner.

Expected `GET /api/auth/me` response shape:
```ts
{ id: string; name: string; email: string; companyName: string; companySlug: string }
```
If the API returns different field names, update the context mapping — do not rename the frontend fields.

On `401`: set `user = null`, do not redirect (let `<AuthGuard>` handle it).

### Route Protection (`frontend/src/components/layout/auth-guard.tsx`)
```tsx
// Wraps protected routes. If !user && !isLoading → redirect to /login
// If user && path is /login or /signup → redirect to /dashboard
```
Router config wraps authenticated routes in `<AuthGuard>` and public routes in a plain layout.

### AppShell (`frontend/src/components/layout/app-shell.tsx`)
Renders the full authenticated page chrome:
```tsx
<>
  <TopNav />
  <main>{children /* or <Outlet /> */}</main>
  <MobileTabBar />   {/* rendered only on mobile via CSS / useIsMobile hook */}
  <Toaster />        {/* Sonner toast container */}
</>
```
`<AuthGuard>` wraps `<AppShell>` in the router. Public routes render their own layout (e.g., `<AuthLayout>` for login/signup, bare wrapper for catalog).

---

## Navigation

### Authenticated Layout (Top Navigation)
```
[ Logo + Brand name ]  [ Dashboard | Products | Settings ]  [ View Catalog ↗ | 🌙 | + Add Product | Avatar ]
```
- Height: `52px`, sticky at top, `z-index: 50`
- Active state: pill with `bg-elevated` + border
- Avatar: shows user initials, dropdown with "Sign out"
- Mobile: logo + "Add Product" CTA only; nav links hidden; bottom tab bar replaces

### Bottom Tab Bar (Mobile, authenticated only)
Four tabs: **Dashboard · Products · Add · Catalog**
Anchored to bottom of viewport (fixed), amber accent on active tab icon + label. Height: `60px` + safe-area inset.

### Public Layout (Catalog page)
Minimal top bar: company logo/name + "Product Catalog" label + ThemeToggle + "Powered by Catalogr" badge. No auth links.

---

## Pages

### 1. Login — `/login`
- Centered card, `420px` wide, max-width `calc(100vw - 48px)`, floating on `bg-base`
- Subtle amber radial glow behind card (`radial-gradient` at top)
- Fields: Email, Password (with "Forgot password?" inline link — **UI only in Phase 1, no route; use `aria-disabled` + tooltip "Coming soon"**)
- CTA: "Sign in →" (full-width, amber)
- Footer link → Sign Up
- **Mobile:** card goes edge-to-edge (`width: 100%`, no border-radius on left/right, no box-shadow)

**Validation (react-hook-form + zod):**
- Email: required, valid email format
- Password: required, min 8 chars
- Inline error messages below each field (text-xs, red-500)
- On submit error (401): show toast "Invalid email or password"

### 2. Sign Up — `/signup`
- Same card layout as Login
- **Owner-only notice banner** (amber tint, `--accent-pale-bg` bg + border) at top of card
- Fields:
  - Company name (full width, required)
  - Company slug (full width, mono font, required) — auto-generated from company name but editable. Label: "Your catalog URL: catalogr.app/**your-slug**". Validates: lowercase, hyphens only, unique (async).
  - Your name + Email (2-col grid, both required)
  - Password (required, min 8 chars)
  - Confirm password (required, must match)
- CTA: "Create account →" (full-width, amber)
- Footer link → Sign In
- **Mobile:** card edge-to-edge

### 3. Dashboard — `/dashboard` (authenticated)
**Header:** "Dashboard" title + "Good morning, {Company Name}" subtitle

**Stats row (3 cards):**
- Total Products: count + "X published · Y drafts" meta — from `GET /api/dashboard/stats`
- Catalog Views: **amber accent card** (inverted) — count of `catalog_view` events from `analytics_events` table, via same endpoint
- Product Views: "Top: {product name} ({count})" meta — from same endpoint

All three stats come from a single `GET /api/dashboard/stats` call returning `{ totalProducts, publishedProducts, draftProducts, catalogViews, productViews, topProduct: { name, views } }`.

**Recent Products card:**
- Columns: thumbnail (36×36, bg-elevated rounded), name, price (Geist Mono, amber), status badge
- Status badges: `Live` (amber-pale, product status = `published`), `Draft` (muted, status = `draft`), `New` (amber-tinted, status = `published` AND created within last 7 days)
- "View all →" ghost button in card header → links to `/products`

**Empty state (0 products):** illustration placeholder + "Add your first product" CTA button

**Loading state:** skeleton loaders for stats cards (animated pulse) and table rows

**Error state:** "Could not load dashboard" with retry button

Mobile: stats 2-col (third card spans full width); table rows readable at 390px.

### 4. Products — `/products` (authenticated)
**Toolbar:** Search input (debounced 300ms) + filter tabs (All / Published / Drafts)

**Product grid:** 4-col desktop, 3-col tablet (≥768px), 2-col mobile

Each card:
- Image area (gradient placeholder, 100px tall)
- Status badge overlaid bottom-left of image
- Name (truncated 1 line), price (Geist Mono, amber)
- Actions: "Edit" ghost | "View ↗" amber (if live) or "Publish" (if draft)
- Featured products: `--accent-pale-border` border highlight

**Empty state (no products / no search results):** distinct messages for each case

**Loading:** 8 skeleton cards in grid layout

**Error:** inline error banner with retry

### 5. Add / Edit Product — `/products/new` and `/products/:id/edit` (authenticated)

**Two-column layout** (desktop, ≥768px): `1fr 320px` main + sidebar
**Single column** on mobile/tablet

**Nav action swap:** when on this page, top nav right side shows "Discard" ghost + "Save draft" ghost; "Publish →" amber CTA is in the page header right.

**Main form card:**
- Product name (full, required)
- Description (textarea, full, required)
- Price (required, numeric) + SKU (Geist Mono, optional) — 2-col
- Category (select, optional) — full width

Note: **Status field lives only in the sidebar Visibility card** (single source of truth). It is not repeated in the main form card.

**Image upload card (`<ImageUpload>`):**
- Dashed drop zone with amber hover state
- "Click to upload or drag and drop · PNG, JPG up to 10MB · Max 10 images"
- After upload: thumbnail grid (3-col) with:
  - Remove (×) button on each thumbnail
  - Drag handle for reordering (drag-to-reorder via `@dnd-kit/core`)
  - Cover image radio — first image is default cover; user can click any to promote
  - Progress bar per upload

**Image upload API flow:**
1. `POST /api/products/:id/images/presign` → `{ uploadUrl: string, imageId: string }` (presigned S3 PUT URL)
2. Client PUTs file directly to `uploadUrl` (tracks progress for progress bar)
3. `POST /api/products/:id/images/confirm` with `{ imageId }` → confirms upload, returns image record
4. New uploads (before product exists on `/products/new`) buffer locally; upload after product is created on first save

**Sidebar cards:**
1. **Visibility:** Status select (Draft / Published) + "Feature in catalog" toggle (amber when on)
2. **SEO:** Slug (Geist Mono, auto-generated from name, editable) + External URL (optional)

**Validation:** all required fields inline. On save: success toast "Product saved" / error toast with message.

**Edit mode:** pre-fills all fields from existing product data. Page title changes to "Edit Product".

Mobile: two columns collapse to single stack.

### 6. Settings — `/settings` (authenticated)
Simple single-column page, `600px` max-width.

**Sections (cards):**
1. **Company Profile**
   - Company name (editable)
   - Company slug (editable, mono font, with live URL preview)
   - Save button

2. **Account**
   - Your name
   - Email (display only, not editable inline)
   - Change password (expand to show current + new + confirm fields) — submits to `PUT /api/auth/password` with `{ currentPassword, newPassword }`
   - Save button

3. **Catalog Appearance** *(Phase 2 placeholder — greyed out with "Coming soon" badge)*

**Destructive zone (bottom):**
- "Delete account" — triggers a shadcn `<AlertDialog>` confirmation: "This will permanently delete your company, all products, and your catalog. This cannot be undone."
- On confirm: `DELETE /api/auth/account` → clear auth context → redirect to `/login` with toast "Account deleted"
- On error: toast error message, dialog stays open

Loading: skeleton for form fields. Save: inline success/error feedback below each section's save button.

### 7. Public Catalog — `/catalog/:companySlug` (public)
**Minimal top bar:** company avatar circle + company name + "Product Catalog" label + ThemeToggle + "Powered by Catalogr" badge

**Hero section:**
- Product count badge (amber pill)
- Company name as `text-3xl` heading
- Company tagline/description
- Search input (debounced 300ms) + Search button

**Category filter pills:** horizontal scroll (no wrap on mobile), amber active pill

**Product grid:** 3-col desktop, 2-col tablet, 1-col mobile

Each card:
- Full-width image (130px tall, gradient placeholder or real image)
- Name, description excerpt (2 lines, truncated), price (amber, Geist Mono), "Details →" pill button
- Hover: `--accent-pale-border` border transition (150ms)

**Empty state:** "No products found" for search, "No products published yet" for empty catalog

**404 (unknown slug):** centered message "This catalog doesn't exist"

---

## Component Inventory

| Component | File | Used in |
|-----------|------|---------|
| `<TopNav>` | `layout/top-nav.tsx` | All authenticated pages |
| `<PublicNav>` | `layout/public-nav.tsx` | Catalog page |
| `<MobileTabBar>` | `layout/mobile-tab-bar.tsx` | Authenticated pages (mobile) |
| `<AuthGuard>` | `layout/auth-guard.tsx` | Router config |
| `<AuthLayout>` | `layout/auth-layout.tsx` | Login, Signup |
| `<AppShell>` | `layout/app-shell.tsx` | Authenticated pages |
| `<ThemeToggle>` | `ui/theme-toggle.tsx` | TopNav, PublicNav |
| `<StatCard>` | `ui/stat-card.tsx` | Dashboard |
| `<ProductTableRow>` | `ui/product-table-row.tsx` | Dashboard |
| `<ProductCard>` | `ui/product-card.tsx` | Products page |
| `<CatalogCard>` | `ui/catalog-card.tsx` | Public catalog |
| `<StatusBadge>` | `ui/status-badge.tsx` | Products, Dashboard |
| `<ImageUpload>` | `ui/image-upload.tsx` | Add/Edit page |
| `<OwnerNotice>` | `ui/owner-notice.tsx` | Signup |
| `<EmptyState>` | `ui/empty-state.tsx` | Dashboard, Products, Catalog |
| `<SkeletonCard>` | `ui/skeleton-card.tsx` | Dashboard, Products |

---

## Form Validation Pattern
- Library: `react-hook-form` + `zod` (already in project)
- Schema defined per-page as a `zod` object
- `useForm` with `zodResolver`
- Inline errors: `<p className="text-xs text-red-500 mt-1">{error.message}</p>` below each field
- Toast notifications: **shadcn Sonner** only (`toast()` / `toast.error()`). `<Toaster>` mounted in `AppShell` and `AuthLayout`.
- Async validation (slug uniqueness): `validate` option in `register`, debounced 500ms

---

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | < 640px | Bottom tab bar, 2-col stats (3rd full-width), 2-col products, 1-col catalog, single-col editor, edge-to-edge auth |
| Tablet (sm) | 640–767px | Top nav visible, single-col editor, 2-col products, 1-col catalog |
| Tablet (md) | 768–1023px | 3-col products, 2-col catalog, single-col editor, "View Catalog" ghost hidden |
| Desktop | ≥ 1024px | Full 4-col products, 3-col catalog, 2-col editor (`1fr 320px`), all nav items visible |

Note: the two-column editor layout and 3-col product grid both activate at `768px` (`md` breakpoint), not `640px`.

---

## Animations & Interactions
- Page transitions: fade `opacity 0→1` 150ms ease
- Card hover: `border-color` + `box-shadow` transition 150ms
- Theme toggle: `background-color`, `color`, `border-color` transition 200ms on `:root`
- Button press: `scale(0.97)` 100ms
- Image upload hover: border-color + background-color 150ms
- Skeleton: `animate-pulse` (Tailwind built-in)

---

## Files to Replace / Create

**Views (full replacement):**
- `frontend/src/views/login-page.tsx`
- `frontend/src/views/signup-page.tsx`
- `frontend/src/views/dashboard-page.tsx`
- `frontend/src/views/products-page.tsx`
- `frontend/src/views/product-editor-page.tsx`
- `frontend/src/views/catalog-page.tsx`
- `frontend/src/views/settings-page.tsx`

**Layout components:**
- `frontend/src/components/layout/top-nav.tsx`
- `frontend/src/components/layout/public-nav.tsx`
- `frontend/src/components/layout/mobile-tab-bar.tsx`
- `frontend/src/components/layout/auth-guard.tsx`
- `frontend/src/components/layout/auth-layout.tsx`
- `frontend/src/components/layout/app-shell.tsx` (replace existing)

**UI components:**
- `frontend/src/components/ui/stat-card.tsx`
- `frontend/src/components/ui/product-card.tsx`
- `frontend/src/components/ui/product-table-row.tsx`
- `frontend/src/components/ui/catalog-card.tsx`
- `frontend/src/components/ui/status-badge.tsx`
- `frontend/src/components/ui/image-upload.tsx`
- `frontend/src/components/ui/theme-toggle.tsx`
- `frontend/src/components/ui/owner-notice.tsx`
- `frontend/src/components/ui/empty-state.tsx`
- `frontend/src/components/ui/skeleton-card.tsx`

**Context & hooks:**
- `frontend/src/context/auth-context.tsx`
- `frontend/src/hooks/use-theme.ts`

**Styles:**
- `frontend/src/index.css` (full replacement — design tokens, Geist import, Tailwind v4 dark variant config)
