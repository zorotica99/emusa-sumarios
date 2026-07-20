import { supabase } from "../lib/supabase";

export interface HorarioAluno {
  id: string;
  horario_id: string;
  aluno_id: string;
}

export async function listarHorariosAlunos(): Promise<
  HorarioAluno[]
> {
  const { data, error } = await supabase
    .from("horarios_alunos")
    .select("id, horario_id, aluno_id");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listarAlunoIdsDoHorario(
  horarioId: string,
): Promise<string[]> {
  if (!horarioId.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("horarios_alunos")
    .select("aluno_id")
    .eq("horario_id", horarioId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((registo) => registo.aluno_id);
}

export async function definirAlunosDoHorario(
  horarioId: string,
  alunoIds: string[],
): Promise<void> {
  if (!horarioId.trim()) {
    throw new Error("Horário inválido.");
  }

  const idsUnicos = [...new Set(alunoIds.filter(Boolean))];

  const { error: erroEliminar } = await supabase
    .from("horarios_alunos")
    .delete()
    .eq("horario_id", horarioId);

  if (erroEliminar) {
    throw new Error(erroEliminar.message);
  }

  if (idsUnicos.length === 0) {
    return;
  }

  const { error: erroCriar } = await supabase
    .from("horarios_alunos")
    .insert(
      idsUnicos.map((alunoId) => ({
        horario_id: horarioId,
        aluno_id: alunoId,
      })),
    );

  if (erroCriar) {
    throw new Error(erroCriar.message);
  }
}

export async function eliminarAlunosDoHorario(
  horarioId: string,
): Promise<void> {
  if (!horarioId.trim()) {
    return;
  }

  const { error } = await supabase
    .from("horarios_alunos")
    .delete()
    .eq("horario_id", horarioId);

  if (error) {
    throw new Error(error.message);
  }
}