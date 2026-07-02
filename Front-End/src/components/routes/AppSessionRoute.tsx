import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface AppSessionRouteProps {
  children: React.ReactNode;
}

/** Permite rotas para usuário logado ou visitante (sem exigir JWT). */
export function AppSessionRoute({ children }: AppSessionRouteProps) {
  const { hasAppSession } = useAuth();

  if (!hasAppSession) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
