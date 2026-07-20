import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface AdminRouteProps {
  children: ReactNode;
}

function AdminRoute({
  children,
}: AdminRouteProps) {
  const {
    eAdministrador,
    aCarregar,
    aCarregarPerfil,
  } = useAuth();

  if (aCarregar || aCarregarPerfil) {
    return (
      <main className="auth-loading">
        <p>A verificar permissões...</p>
      </main>
    );
  }

  if (!eAdministrador) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;