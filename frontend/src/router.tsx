import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./ui/app-shell";
import { CatalogPage } from "./views/catalog-page";
import { DashboardPage } from "./views/dashboard-page";
import { LoginPage } from "./views/login-page";
import { ProductEditorPage } from "./views/product-editor-page";
import { ProductsPage } from "./views/products-page";
import { SettingsPage } from "./views/settings-page";
import { SignupPage } from "./views/signup-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "catalog/:companySlug", element: <CatalogPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <ProductEditorPage /> },
      { path: "products/:productId/edit", element: <ProductEditorPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
