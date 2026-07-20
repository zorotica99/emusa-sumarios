import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    session,
    perfil,
    aCarregar,
    aCarregarPerfil,
  } = useAuth();

  if (aCarregar || aCarregarPerfil) {
    return (
      <main className="auth-loading">
        <p>A carregar aplicação...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!perfil) {
    return (
      <main className="not-found">
        <section className="not-found__card">
          <span className="not-found__code">
            403
          </span>

          <h1>Conta sem perfil</h1>

          <p>
            Esta conta ainda não está configurada
            para utilizar a aplicação.
          </p>

          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              window.location.assign("/login")
            }
          >
            Voltar
          </button>
        </section>
      </main>
    );
  }

  if (!perfil.ativo) {
    return (
      <main className="not-found">
        <section className="not-found__card">
          <span className="not-found__code">
            403
          </span>

          <h1>Conta desativada</h1>

          <p>
            O acesso desta conta foi desativado
            pelo administrador.
          </p>
        </section>
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;