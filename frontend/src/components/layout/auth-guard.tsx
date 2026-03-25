import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface AuthGuardProps {
  reverse?: boolean;
  children?: React.ReactNode;
}

export function AuthGuard({ reverse = false, children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reverse && !user) return <Navigate to="/login" replace />;
  if (reverse && user) return <Navigate to="/dashboard" replace />;

  return children ? <>{children}</> : <Outlet />;
}
