/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "../types/user";

export type { User };

/** Disparado após login/logout para recarregar dados da API. */
export const GARANTIAS_SESSION_EVENT = "garantias:session-updated";

function notifySessionUpdated(): void {
  window.dispatchEvent(new Event(GARANTIAS_SESSION_EVENT));
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void; // novo — atualiza sem fazer logout
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("@garantias:user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("@garantias:token");
  });

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem("@garantias:token", token);
    localStorage.setItem("@garantias:user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    notifySessionUpdated();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@garantias:token");
    localStorage.removeItem("@garantias:user");
    setToken(null);
    setUser(null);
    notifySessionUpdated();
  }, []);

  // Atualiza campos do usuário no contexto e localStorage sem precisar relogar
  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("@garantias:user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}