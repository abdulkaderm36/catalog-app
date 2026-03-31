import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, FileImage } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Toaster } from "@/components/ui/sonner";

interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: Array<{ id: string; url: string; isCover: boolean }>;
  category?: string;
  externalUrl?: string;
}

interface CatalogData {
  company: { name: string; description?: string; logoUrl?: string };
  products: CatalogProduct[];
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <FileImage className="w-12 h-12 text-[var(--text-muted)]" />
    </div>
  );
}

function CarouselImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return <ImagePlaceholder />;
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />;
}

export function CatalogProductPage() {
  const { companySlug, productId } = useParams<{ companySlug: string; productId: string }>();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const query = useQuery<CatalogData>({
    queryKey: ["catalog", companySlug],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/${companySlug}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const product = query.data?.products.find((p) => p.id === productId);
  const rawImages = product?.images ?? [];
  const coverIndex = rawImages.findIndex((i) => i.isCover);
  const images = coverIndex > 0
    ? [rawImages[coverIndex], ...rawImages.filter((_, i) => i !== coverIndex)]
    : rawImages;

  const prev = useCallback(() =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setActiveIndex((i) => (i + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (images.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length, prev, next]);

  if (query.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <PublicNav companyName="" />
        <div className="max-w-[720px] mx-auto px-6 py-12 animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-[var(--bg-elevated)]" />
          <div className="h-80 rounded-2xl bg-[var(--bg-elevated)]" />
          <div className="h-6 w-48 rounded bg-[var(--bg-elevated)]" />
          <div className="h-4 w-full rounded bg-[var(--bg-elevated)]" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">Product not found</p>
          <button
            onClick={() => navigate(`/catalog/${companySlug}`)}
            className="mt-4 text-sm text-[var(--accent)] hover:underline"
          >
            ← Back to catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <PublicNav companyName={query.data?.company.name ?? ""} logoUrl={query.data?.company.logoUrl} />

      <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
        <button
          onClick={() => navigate(`/catalog/${companySlug}`)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalog
        </button>

        {/* Carousel */}
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--border)] h-72 sm:h-[420px] select-none">
            {images.length > 0 ? (
              <CarouselImage src={images[activeIndex].url} alt={product.name} />
            ) : (
              <ImagePlaceholder />
            )}

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === activeIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIndex
                      ? "border-[var(--accent)]"
                      : "border-[var(--border)] opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{product.name}</h1>
              {product.category && (
                <span className="inline-block mt-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 rounded-full capitalize">
                  {product.category}
                </span>
              )}
            </div>
            <span className="font-mono text-2xl font-black text-[var(--accent)] flex-shrink-0">
              ${product.price.toLocaleString()}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
          )}

          {product.externalUrl && (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              View product →
            </a>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
