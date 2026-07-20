import { supabase } from "../lib/supabase";

export interface AlunoPerfil {
  id: string;
  aluno_id: string;
  instrumento_id: string | null;
  nivel_id: string | null;
}

export interface GuardarAlunoPerfilData {
  alunoId: string;
  instrumentoId: string;
  nivelId: string;
}

export async function listarAlunosPerfis(): Promise<
  AlunoPerfil[]
> {
  const { data, error } = await supabase
    .from("alunos_perfis")
    .select(
      "id, aluno_id, instrumento_id, nivel_id",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AlunoPerfil[];
}

export async function obterPerfilDoAluno(
  alunoId: string,
): Promise<AlunoPerfil | null> {
  if (!alunoId.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("alunos_perfis")
    .select(
      "id, aluno_id, instrumento_id, nivel_id",
    )
    .eq("aluno_id", alunoId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlunoPerfil | null;
}

export async function guardarPerfilDoAluno(
  dados: GuardarAlunoPerfilData,
): Promise<AlunoPerfil> {
  if (!dados.alunoId.trim()) {
    throw new Error("Aluno inválido.");
  }

  const { data, error } = await supabase
    .from("alunos_perfis")
    .upsert(
      {
        aluno_id: dados.alunoId,
        instrumento_id:
          dados.instrumentoId.trim() || null,
        nivel_id: dados.nivelId.trim() || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "aluno_id",
      },
    )
    .select(
      "id, aluno_id, instrumento_id, nivel_id",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlunoPerfil;
}

export async function eliminarPerfilDoAluno(
  alunoId: string,
): Promise<void> {
  if (!alunoId.trim()) {
    return;
  }

  const { error } = await supabase
    .from("alunos_perfis")
    .delete()
    .eq("aluno_id", alunoId);

  if (error) {
    throw new Error(error.message);
  }
}