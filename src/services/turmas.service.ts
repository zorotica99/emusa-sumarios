import { supabase } from "../lib/supabase";

export type TipoTurma =
  | "Principal"
  | "Conjunto";

export interface Turma {
  id: string;
  nome: string;
  nivel_id: string;
  ano_letivo: string;
  tipo_turma: TipoTurma;
}

export interface GuardarTurmaData {
  nome: string;
  nivelId: string;
  anoLetivo: string;
  tipoTurma: TipoTurma;
}

export async function listarTurmas(): Promise<Turma[]> {
  const { data, error } = await supabase
    .from("turmas")
    .select(
      "id, nome, nivel_id, ano_letivo, tipo_turma",
    )
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Turma[];
}

export async function criarTurma(
  dados: GuardarTurmaData,
): Promise<Turma> {
  const nome = dados.nome.trim();
  const nivelId = dados.nivelId.trim();
  const anoLetivo = dados.anoLetivo.trim();

  if (!nome) {
    throw new Error("O nome da turma é obrigatório.");
  }

  if (!nivelId) {
    throw new Error("Selecione um nível.");
  }

  if (!anoLetivo) {
    throw new Error("O ano letivo é obrigatório.");
  }

  if (
    dados.tipoTurma !== "Principal" &&
    dados.tipoTurma !== "Conjunto"
  ) {
    throw new Error("Selecione o tipo de turma.");
  }

  const { data, error } = await supabase
    .from("turmas")
    .insert({
      nome,
      nivel_id: nivelId,
      ano_letivo: anoLetivo,
      tipo_turma: dados.tipoTurma,
    })
    .select(
      "id, nome, nivel_id, ano_letivo, tipo_turma",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Turma;
}

export async function atualizarTurma(
  id: string,
  dados: GuardarTurmaData,
): Promise<Turma> {
  const nome = dados.nome.trim();
  const nivelId = dados.nivelId.trim();
  const anoLetivo = dados.anoLetivo.trim();

  if (!id) {
    throw new Error("Turma inválida.");
  }

  if (!nome) {
    throw new Error("O nome da turma é obrigatório.");
  }

  if (!nivelId) {
    throw new Error("Selecione um nível.");
  }

  if (!anoLetivo) {
    throw new Error("O ano letivo é obrigatório.");
  }

  if (
    dados.tipoTurma !== "Principal" &&
    dados.tipoTurma !== "Conjunto"
  ) {
    throw new Error("Selecione o tipo de turma.");
  }

  const { data, error } = await supabase
    .from("turmas")
    .update({
      nome,
      nivel_id: nivelId,
      ano_letivo: anoLetivo,
      tipo_turma: dados.tipoTurma,
    })
    .eq("id", id)
    .select(
      "id, nome, nivel_id, ano_letivo, tipo_turma",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Turma;
}

export async function eliminarTurma(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error("Turma inválida.");
  }

  const { error } = await supabase
    .from("turmas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}