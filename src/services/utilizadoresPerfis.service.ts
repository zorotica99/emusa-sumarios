import { supabase } from "../lib/supabase";

export type TipoPerfilUtilizador =
  | "Administrador"
  | "Professor";

export interface UtilizadorPerfil {
  id: string;
  auth_user_id: string;
  professor_id: string | null;
  nome: string;
  perfil: TipoPerfilUtilizador;
  ativo: boolean;
}

export interface CriarUtilizadorData {
  email: string;
  password: string;
  nome: string;
  perfil: TipoPerfilUtilizador;
  professorId: string;
}

const camposPerfil = `
  id,
  auth_user_id,
  professor_id,
  nome,
  perfil,
  ativo
`;

export async function obterPerfilUtilizadorAtual(): Promise<
  UtilizadorPerfil | null
> {
  const {
    data: { session },
    error: erroSessao,
  } = await supabase.auth.getSession();

  if (erroSessao) {
    throw new Error(erroSessao.message);
  }

  const utilizadorId =
    session?.user?.id;

  if (!utilizadorId) {
    return null;
  }

  const { data, error } = await supabase
    .from("utilizadores_perfis")
    .select(camposPerfil)
    .eq("auth_user_id", utilizadorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UtilizadorPerfil | null;
}

export async function listarUtilizadoresPerfis(): Promise<
  UtilizadorPerfil[]
> {
  const { data, error } = await supabase
    .from("utilizadores_perfis")
    .select(camposPerfil)
    .order("nome", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UtilizadorPerfil[];
}

export async function criarUtilizador(
  dados: CriarUtilizadorData,
): Promise<void> {
  const email =
    dados.email.trim().toLowerCase();

  const password =
    dados.password.trim();

  const nome =
    dados.nome.trim();

  if (!email) {
    throw new Error(
      "O email é obrigatório.",
    );
  }

  if (password.length < 8) {
    throw new Error(
      "A palavra-passe deve ter pelo menos 8 caracteres.",
    );
  }

  if (!nome) {
    throw new Error(
      "O nome é obrigatório.",
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

  const { data, error } =
    await supabase.functions.invoke(
      "criar-utilizador",
      {
        body: {
          email,
          password,
          nome,
          perfil: dados.perfil,
          professorId:
            dados.professorId || null,
        },
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }
}

export async function alterarEstadoUtilizador(
  id: string,
  ativo: boolean,
): Promise<void> {
  if (!id.trim()) {
    throw new Error(
      "Utilizador inválido.",
    );
  }

  const { error } = await supabase
    .from("utilizadores_perfis")
    .update({
      ativo,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function eliminarUtilizadorPerfil(
  id: string,
): Promise<void> {
  if (!id.trim()) {
    throw new Error(
      "Utilizador inválido.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const perfis =
    await listarUtilizadoresPerfis();

  const perfil = perfis.find(
    (item) => item.id === id,
  );

  if (
    user &&
    perfil?.auth_user_id === user.id
  ) {
    throw new Error(
      "Não pode eliminar o perfil da conta com sessão iniciada.",
    );
  }

  const { error } = await supabase
    .from("utilizadores_perfis")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}