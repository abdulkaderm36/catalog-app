const stats = [
  { label: "Catalog views", value: "12,480", detail: "+14% vs last month" },
  { label: "Product views", value: "38,210", detail: "Ridge Chair leads the month" },
  { label: "Published products", value: "124", detail: "16 drafts are still in review" },
  { label: "CTA clicks", value: "1,204", detail: "9.7% product click-through rate" },
];

export function DashboardPage() {
  return (
    <>
      <section className="studio-lead">
        <div className="section-label">Dashboard</div>
        <h1>Catalog activity, product updates, and share performance in one workspace.</h1>
        <p>
          Review what customers opened, which products are getting attention, and what still needs to be published.
        </p>
      </section>

      <section className="dashboard-band">
        <div className="dashboard-hero-image" />
        <aside className="dashboard-summary">
          <div className="section-label">This month</div>
          <div className="metric-list">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-label">Recent inventory movement</span>
          <h2>Products updated most recently.</h2>
          <p>Keep track of what changed, what went live, and what is still waiting for final review.</p>
        </div>
        <div className="inventory-list">
          <article className="inventory-row">
            <img
              className="inventory-thumb"
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
              alt="Runner Pro Sneakers"
            />
            <div>
              <h3>Runner Pro Sneakers</h3>
              <p>Updated product photos and size notes, then moved into the featured collection.</p>
            </div>
            <span className="status-mark">Updated 2 hours ago</span>
          </article>
          <article className="inventory-row">
            <img
              className="inventory-thumb"
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80"
              alt="Camera Kit"
            />
            <div>
              <h3>Camera Kit</h3>
              <p>Moved from draft to published and is now visible in the customer-facing catalog.</p>
            </div>
            <span className="status-mark">Published yesterday</span>
          </article>
          <article className="inventory-row">
            <img
              className="inventory-thumb"
              src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80"
              alt="Sunglasses"
            />
            <div>
              <h3>Cityline Sunglasses</h3>
              <p>Created as a draft product with hidden price while the final description is still being reviewed.</p>
            </div>
            <span className="status-mark">Drafted yesterday</span>
          </article>
        </div>
      </section>
    </>
  );
}
