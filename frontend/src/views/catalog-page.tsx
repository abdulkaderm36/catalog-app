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
  products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
    featured?: boolean;
  }>;
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
      if (res.status === 404) {
        const err = Object.assign(new Error("Not found"), { status: 404 });
        throw err;
      }
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const categories = useMemo(() => {
    if (!query.data) return [];
    return [
      ...new Set(query.data.products.map((p) => p.category).filter(Boolean)),
    ] as string[];
  }, [query.data]);

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return query.data.products.filter((p) => {
      const matchesSearch =
        !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [query.data, debouncedSearch, activeCategory]);

  if (query.isError && (query.error as { status?: number }).status === 404) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">This catalog doesn't exist</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            The link may be wrong or this company no longer exists.
          </p>
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
            {query.data?.company.name ?? "\u00a0"}
          </h1>
          {query.data?.company.description && (
            <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto">
              {query.data.company.description}
            </p>
          )}
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                !activeCategory
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize",
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

        {/* Product grid */}
        {query.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? "No products match your search" : "No products published yet"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <CatalogCard key={p.id} product={p} onDetails={() => {}} />
            ))}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}
