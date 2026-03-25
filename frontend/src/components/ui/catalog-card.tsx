interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export function CatalogCard({ product, onDetails }: { product: CatalogProduct; onDetails: () => void }) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden hover:border-[var(--accent-pale-border)] transition-colors duration-150 cursor-pointer"
      onClick={onDetails}
    >
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
