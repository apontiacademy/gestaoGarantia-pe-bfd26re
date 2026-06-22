/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  id: number | string; // Permitir string para gerar IDs temporários de visitante
  nome: string;
  email: string;
  role: "admin" | "user" | "visitor"; // Adicionado "visitor"
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVisitor: boolean; // Flag para as outras telas descobrirem se é visitante
  login: (token: string, user: User) => void;
  loginAsVisitor: () => void; // Nova função para o botão
  logout: () => void;
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
  }, []);

  // Função nova para o modo visitante
  const loginAsVisitor = useCallback(() => {
    const visitorUser: User = {
      id: "visitor_mode",
      nome: "Visitante",
      email: "visitante@apontinote.local",
      role: "visitor"
    };
    
    // Limpa tokens antigos para evitar misturar funcionário com visitante
    localStorage.removeItem("@garantias:token");
    localStorage.setItem("@garantias:user", JSON.stringify(visitorUser));
    
    setToken(null);
    setUser(visitorUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("@garantias:token");
    localStorage.removeItem("@garantias:user");
    // Se quiser manter as garantias do visitante salvas no PC dele após o logout,
    // comente a linha abaixo. Se quiser limpar tudo ao sair, mantenha:
    localStorage.removeItem("@garantias:visitor_warranties"); 

    setToken(null);
    setUser(null);
  }, []);

  const isVisitor = user?.role === "visitor";
  const isAuthenticated = !!token || isVisitor; // Autenticado se tiver token OU for visitante

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      isVisitor, 
      login, 
      loginAsVisitor, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}