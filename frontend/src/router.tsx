import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./components/layout/app-shell";
import { AuthLayout } from "./components/layout/auth-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { CatalogPage } from "./views/catalog-page";
import { CatalogProductPage } from "./views/catalog-product-page";
import { DashboardPage } from "./views/dashboard-page";
import { LoginPage } from "./views/login-page";
import { ProductEditorPage } from "./views/product-editor-page";
import { ProductsPage } from "./views/products-page";
import { SettingsPage } from "./views/settings-page";
import { SignupPage } from "./views/signup-page";

export const router = createBrowserRouter([
  // Auth routes — redirect to /dashboard if already logged in
  {
    element: <AuthGuard reverse />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
        ],
      },
    ],
  },
  // Public catalog — no auth required
  { path: "/catalog/:companySlug", element: <CatalogPage /> },
  { path: "/catalog/:companySlug/products/:productId", element: <CatalogProductPage /> },
  // Authenticated routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/products/new", element: <ProductEditorPage /> },
          { path: "/products/:productId/edit", element: <ProductEditorPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
