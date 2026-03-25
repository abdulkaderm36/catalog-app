const products = [
  {
    name: "Runner Pro Sneakers",
    status: "Published",
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    copy: "Best-performing product this week with the highest share and click activity.",
  },
  {
    name: "Travel Camera Kit",
    status: "Published",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
    copy: "Recently published with a refreshed gallery and updated product copy.",
  },
  {
    name: "Cityline Sunglasses",
    status: "Draft",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
    copy: "Still waiting on final pricing and the last two approved images.",
  },
];

export function ProductsPage() {
  return (
    <>
      <section className="studio-lead">
        <div className="section-label">Products</div>
        <h1>Manage the products customers will see in your shareable catalog.</h1>
        <p>
          Update product details, images, and status from one list before publishing changes to the public catalog link.
        </p>
      </section>

      <section className="inventory-list">
        {products.map((product) => (
          <article className="inventory-row" key={product.name}>
            <img className="inventory-thumb" src={product.image} alt={product.name} />
            <div>
              <h3>{product.name}</h3>
              <p>{product.copy}</p>
            </div>
            <span className="status-mark">
              {product.category} · {product.status}
            </span>
          </article>
        ))}
      </section>
    </>
  );
}
