import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

const items = [
  {
    title: "Runner Pro Sneakers",
    description: "Lightweight everyday sneakers with breathable mesh and three color options.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Travel Camera Kit",
    description: "Compact camera bundle with lens kit, carry case, and starter accessories.",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Cityline Sunglasses",
    description: "Classic square frames with polarized lenses and a hard-shell case.",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Active Bottle",
    description: "Vacuum insulated bottle designed for all-day carry and simple custom branding.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  },
];

export function CatalogPage() {
  const { companySlug } = useParams();
  const brand = companySlug?.replace(/-/g, " ") ?? "demo company";

  return (
    <div className="page-stack">
      <section className="hero-composition hero-composition--catalog">
        <div className="hero-panel">
          <div className="section-label">Public catalog</div>
          <h1 className="hero-brand">{brand}</h1>
          <h2 className="hero-title">A clean product catalog customers can browse from one shareable link.</h2>
          <p className="hero-copy">
            This route should publish only approved products, keep scanning easy on mobile, and make it simple to share inventory anywhere online.
          </p>
          <div className="hero-actions">
            <Button asChild>
              <a href="#collection">View collection</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/login">Enter studio</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="section" id="collection">
        <div className="section-header">
          <span className="section-label">Collection</span>
          <h2>Published products ready for customers to browse.</h2>
          <p>Images lead, titles stay clear, and descriptions stay short enough to scan without friction.</p>
        </div>

        <div className="catalog-grid">
        {items.map((item) => (
          <article className="catalog-item" key={item.title}>
            <img className="catalog-item-image" src={item.image} alt={item.title} />
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
        </div>
      </section>
    </div>
  );
}
