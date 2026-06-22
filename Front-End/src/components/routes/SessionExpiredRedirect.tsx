import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GARANTIAS_SESSION_EXPIRED_EVENT } from "../../services/authSession";

export function SessionExpiredRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/login", {
        replace: true,
        state: { message: "Sua sessão expirou. Faça login novamente." },
      });
    };

    window.addEventListener(GARANTIAS_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(GARANTIAS_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [navigate]);

  return null;
}
