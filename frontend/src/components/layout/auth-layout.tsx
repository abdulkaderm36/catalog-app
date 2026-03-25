import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
