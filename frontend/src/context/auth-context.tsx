import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companySlug: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { credentials: "include", signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(err => { if (err.name !== "AbortError") setUser(null); })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const login = useCallback((u: User) => setUser(u), []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Network failure — still clear local state
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
