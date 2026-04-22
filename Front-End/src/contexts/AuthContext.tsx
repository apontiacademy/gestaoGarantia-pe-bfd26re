import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Persiste entre refreshes de página
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@garantias:token");
    localStorage.removeItem("@garantias:user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado — sempre use esse, nunca useContext(AuthContext) direto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}