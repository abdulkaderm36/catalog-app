import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
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
    queryFn: () =>
      apiFetch("/api/dashboard/stats").then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      }),
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ["recent-products"],
    queryFn: () =>
      apiFetch("/api/products?limit=5&sort=createdAt").then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {getGreeting()}, {user?.companyName}
        </p>
      </div>

      {/* Stats */}
      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat className="col-span-2 sm:col-span-1" />
        </div>
      ) : statsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Could not load stats.{" "}
          <button onClick={() => statsQuery.refetch()} className="underline ml-1">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Products"
            value={statsQuery.data!.totalProducts}
            meta={`${statsQuery.data!.publishedProducts} published · ${statsQuery.data!.draftProducts} drafts`}
          />
          <StatCard label="Catalog Views" value={statsQuery.data!.catalogViews.toLocaleString()} accent />
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
            {[...Array(4)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <CardContent>
            <p className="text-sm text-[var(--text-secondary)]">
              Could not load products.{" "}
              <button onClick={() => productsQuery.refetch()} className="underline text-[var(--accent)]">
                Retry
              </button>
            </p>
          </CardContent>
        ) : productsQuery.data?.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add your first product to get started"
            action={{ label: "+ Add product", onClick: () => navigate("/products/new") }}
          />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {productsQuery.data!.map((p) => (
              <ProductTableRow key={p.id} product={p} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
