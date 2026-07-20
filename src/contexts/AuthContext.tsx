import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  iniciarSessao,
  terminarSessao,
} from "../services/auth.service";
import {
  obterPerfilUtilizadorAtual,
  type UtilizadorPerfil,
} from "../services/utilizadoresPerfis.service";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  perfil: UtilizadorPerfil | null;
  aCarregar: boolean;
  aCarregarPerfil: boolean;
  eAdministrador: boolean;
  eProfessor: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  recarregarPerfil: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [perfil, setPerfil] =
    useState<UtilizadorPerfil | null>(null);

  const [aCarregar, setACarregar] =
    useState(true);

  const [aCarregarPerfil, setACarregarPerfil] =
    useState(true);

  async function carregarPerfil(
    sessaoAtual: Session | null,
  ) {
    if (!sessaoAtual) {
      setPerfil(null);
      setACarregarPerfil(false);
      return;
    }

    try {
      setACarregarPerfil(true);

      const perfilAtual =
        await obterPerfilUtilizadorAtual();

      setPerfil(perfilAtual);
    } catch (error) {
      console.error(
        "Erro ao carregar perfil:",
        error,
      );

      setPerfil(null);
    } finally {
      setACarregarPerfil(false);
    }
  }

  async function recarregarPerfil() {
    await carregarPerfil(session);
  }

  useEffect(() => {
    async function carregarSessao() {
      const { data } =
        await supabase.auth.getSession();

      setSession(data.session);
      setACarregar(false);

      await carregarPerfil(data.session);
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, novaSessao) => {
        setSession(novaSessao);
        setACarregar(false);

        carregarPerfil(novaSessao);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(
    email: string,
    password: string,
  ) {
    await iniciarSessao(email, password);
  }

  async function logout() {
    await terminarSessao();

    setPerfil(null);
  }

  const valor = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      perfil,
      aCarregar,
      aCarregarPerfil,
      eAdministrador:
        perfil?.perfil === "Administrador",
      eProfessor:
        perfil?.perfil === "Professor",
      login,
      logout,
      recarregarPerfil,
    }),
    [
      session,
      perfil,
      aCarregar,
      aCarregarPerfil,
    ],
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;