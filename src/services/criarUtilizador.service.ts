import { supabase } from "../lib/supabase";

export type PerfilUtilizador =
  | "Professor"
  | "Administrador";

export interface CriarUtilizadorData {
  email: string;
  nome: string;
  professorId: string | null;
  perfil: PerfilUtilizador;
  ativo: boolean;
}

interface CriarUtilizadorResposta {
  success?: boolean;
  message?: string;
  authUserId?: string;
  error?: string;
}

export async function criarUtilizador(
  dados: CriarUtilizadorData,
): Promise<CriarUtilizadorResposta> {
  const email =
    dados.email.trim().toLowerCase();

  const nome = dados.nome.trim();

  if (!email || !email.includes("@")) {
    throw new Error(
      "Introduza um email válido.",
    );
  }

  if (!nome) {
    throw new Error(
      "Introduza o nome do utilizador.",
    );
  }

  if (
    dados.perfil === "Professor" &&
    !dados.professorId
  ) {
    throw new Error(
      "Selecione o professor associado.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke<
    CriarUtilizadorResposta
  >("criar-utilizador", {
    body: {
      email,
      nome,
      professorId:
        dados.perfil === "Professor"
          ? dados.professorId
          : null,
      perfil: dados.perfil,
      ativo: dados.ativo,
    },
  });

  if (error) {
    throw new Error(
      error.message ||
        "Não foi possível criar a conta.",
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.success) {
    throw new Error(
      "A conta não foi criada.",
    );
  }

  return data;
}