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
              <a href={`/catalog/${product.companySlug}`} target="_blank" rel="noopener noreferrer">View ↗</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
