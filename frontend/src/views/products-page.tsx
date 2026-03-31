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
import { apiFetch } from "@/lib/api";

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

const filterTabs: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
];

export function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () =>
      apiFetch("/api/products").then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      }),
  });

  const filtered = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((p) => {
      const matchesFilter = filter === "all" || p.status === filter;
      const matchesSearch =
        !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [query.data, filter, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Products</h1>
        <Button onClick={() => navigate("/products/new")}>+ Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
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
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Could not load products.{" "}
          <button onClick={() => query.refetch()} className="underline ml-1">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? "No products match your search" : "No products yet"}
          description={
            debouncedSearch ? "Try a different search term" : "Add your first product to get started"
          }
          action={
            !debouncedSearch
              ? { label: "+ Add product", onClick: () => navigate("/products/new") }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={{ ...p, companySlug: user?.companySlug }} />
          ))}
        </div>
      )}
    </div>
  );
}
