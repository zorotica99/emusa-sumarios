import { supabase } from "../lib/supabase";

export interface AlunoTurma {
  id: string;
  aluno_id: string;
  turma_id: string;
}

export async function listarAlunosTurmas(): Promise<AlunoTurma[]> {
  const { data, error } = await supabase
    .from("alunos_turmas")
    .select("id, aluno_id, turma_id");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listarAlunoIdsPorTurma(
  turmaId: string,
): Promise<string[]> {
  if (!turmaId.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("alunos_turmas")
    .select("aluno_id")
    .eq("turma_id", turmaId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((registo) => registo.aluno_id);
}

export async function obterTurmaIdDoAluno(
  alunoId: string,
): Promise<string> {
  if (!alunoId.trim()) {
    return "";
  }

  const { data, error } = await supabase
    .from("alunos_turmas")
    .select("turma_id")
    .eq("aluno_id", alunoId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.turma_id ?? "";
}

export async function definirTurmaDoAluno(
  alunoId: string,
  turmaId: string,
): Promise<void> {
  if (!alunoId.trim()) {
    throw new Error("Aluno inválido.");
  }

  const { error: erroEliminar } = await supabase
    .from("alunos_turmas")
    .delete()
    .eq("aluno_id", alunoId);

  if (erroEliminar) {
    throw new Error(erroEliminar.message);
  }

  if (!turmaId.trim()) {
    return;
  }

  const { error: erroCriar } = await supabase
    .from("alunos_turmas")
    .insert({
      aluno_id: alunoId,
      turma_id: turmaId,
    });

  if (erroCriar) {
    throw new Error(erroCriar.message);
  }
}