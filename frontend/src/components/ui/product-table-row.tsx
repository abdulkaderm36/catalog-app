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
