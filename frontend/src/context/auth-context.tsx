import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { apiFetch, getToken, setToken, removeToken } from "@/lib/api";

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
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    apiFetch("/api/auth/me", { signal: controller.signal })
      .then(r => { if (!r.ok) { removeToken(); return null; } return r.json(); })
      .then(data => setUser(data))
      .catch(err => { if (err.name !== "AbortError") setUser(null); })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeToken();
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
