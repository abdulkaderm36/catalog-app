import { NavLink, Outlet, useLocation } from "react-router-dom";

const studioLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/products/new", label: "New Product" },
  { to: "/settings", label: "Settings" },
];

const publicLinks = [
  { to: "/catalog/demo-company", label: "Catalog" },
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Signup" },
];

export function AppShell() {
  const location = useLocation();
  const isStudio = /^\/(dashboard|products|settings)/.test(location.pathname);

  return (
    <div className="app-shell">
      {isStudio ? (
        <div className="studio-shell">
          <header className="studio-header">
            <div className="wordmark">
              <strong>Meridian</strong>
              <span>Catalog studio</span>
            </div>
            <nav className="studio-nav" aria-label="Studio">
              {studioLinks.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </header>
          <main className="studio-main">
            <Outlet />
          </main>
        </div>
      ) : (
        <div className="public-shell">
          <header className="public-header">
            <div className="wordmark">
              <strong>Meridian</strong>
              <span>Objects for modern rooms</span>
            </div>
            <nav className="public-nav" aria-label="Public">
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </header>
          <Outlet />
        </div>
      )}
    </div>
  );
}
