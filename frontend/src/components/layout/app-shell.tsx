import { Outlet } from "react-router-dom";
import { TopNav } from "./top-nav";
import { MobileTabBar } from "./mobile-tab-bar";
import { Toaster } from "@/components/ui/sonner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TopNav />
      <main className="max-w-[960px] mx-auto px-6 py-8 pb-20 sm:pb-8">
        <Outlet />
      </main>
      <MobileTabBar />
      <Toaster />
    </div>
  );
}
