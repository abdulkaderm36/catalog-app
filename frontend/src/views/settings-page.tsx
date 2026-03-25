export function SettingsPage() {
  return (
    <>
      <section className="studio-lead">
        <div className="section-label">Settings</div>
        <h1>Control catalog behavior, public visibility, and storage settings.</h1>
        <p>
          Keep store-wide rules in one place so every shared catalog link stays consistent.
        </p>
      </section>

      <section className="settings-columns">
        <div>
          <div className="plain-block">
            <h3>Public pricing</h3>
            <p>Show or hide product prices across the public catalog while still storing them in the backend.</p>
          </div>
          <div className="plain-block">
            <h3>Catalog route</h3>
            <p>`/catalog/demo-company` is the public-facing URL customers will open from messages, posts, and emails.</p>
          </div>
          <div className="plain-block">
            <h3>Object storage</h3>
            <p>MinIO stores original product images and powers the upload workflow for the catalog builder.</p>
          </div>
        </div>
        <aside className="aside-note">
          <div className="section-label">Implementation note</div>
          <p>Once persistence is wired, this page becomes the source of truth for every company-level catalog rule.</p>
        </aside>
      </section>
    </>
  );
}
