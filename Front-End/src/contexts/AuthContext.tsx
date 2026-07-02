/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "../types/user";
import { userService } from "../services/userService";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredAuth,
  getAuthTokenExpiresInMs,
  isAuthTokenExpired,
} from "../utils/authToken";
import { GARANTIAS_SESSION_EXPIRED_EVENT, emitSessionExpired } from "../services/authSession";

export type { User };

const VISITOR_USER: User = {
  id: 0,
  nomeCompleto: "Visitante",
  email: "visitante@apontinote.local",
};

export function isVisitorUser(user: User | null): boolean {
  return (
    user?.id === VISITOR_USER.id && user.email === VISITOR_USER.email
  );
}

/** Disparado após login/logout para recarregar dados da API. */
export const GARANTIAS_SESSION_EVENT = "garantias:session-updated";

function notifySessionUpdated(): void {
  window.dispatchEvent(new Event(GARANTIAS_SESSION_EVENT));
}

function loadInitialAuth(): {
  token: string | null;
  user: User | null;
  expiredOnBoot: boolean;
} {
  const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

  if (savedToken && isAuthTokenExpired(savedToken)) {
    clearStoredAuth();
    return { token: null, user: null, expiredOnBoot: true };
  }

  const savedUser = localStorage.getItem(AUTH_USER_KEY);

  return {
    token: savedToken,
    user: savedToken && savedUser ? (JSON.parse(savedUser) as User) : null,
    expiredOnBoot: false,
  };
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Sessão ativa: JWT válido ou modo visitante. */
  hasAppSession: boolean;
  isVisitor: boolean; // Flag para as outras telas descobrirem se é visitante
  login: (token: string, user: User) => void;
  loginAsVisitor: () => void; // Nova função para o botão
  logout: () => void;
  updateUser: (data: Partial<User>) => void; // novo — atualiza sem fazer logout
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState(() => loadInitialAuth());
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
    notifySessionUpdated();
  }, []);

  // Função nova para o modo visitante
  const loginAsVisitor = useCallback(() => {
    clearStoredAuth();
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(VISITOR_USER));

    setToken(null);
    setUser(VISITOR_USER);
    notifySessionUpdated();
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    notifySessionUpdated();
  }, []);

  // Atualiza campos do usuário no contexto e localStorage sem precisar relogar
  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      notifySessionUpdated();
    };

    window.addEventListener(GARANTIAS_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(GARANTIAS_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (initialAuth.expiredOnBoot) {
      window.dispatchEvent(new Event(GARANTIAS_SESSION_EXPIRED_EVENT));
    }
  }, [initialAuth.expiredOnBoot]);

  useEffect(() => {
    if (!token) return;

    if (isAuthTokenExpired(token)) {
      emitSessionExpired();
      return;
    }

    const expiresInMs = getAuthTokenExpiresInMs(token);
    if (expiresInMs === null || expiresInMs <= 0) return;

    const timer = window.setTimeout(() => {
      emitSessionExpired();
    }, expiresInMs);

    return () => window.clearTimeout(timer);
  }, [token]);

  // No boot (e após login), sincroniza o perfil com a API — o localStorage pode estar desatualizado
  useEffect(() => {
    if (!token) return;

    const refreshProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      } catch {
        // Mantém o perfil em cache se a API estiver indisponível
      }
    };

    void refreshProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        hasAppSession: !!token || isVisitorUser(user),
        isVisitor: isVisitorUser(user),
        login,
        loginAsVisitor,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}