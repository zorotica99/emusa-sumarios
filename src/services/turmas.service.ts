import { supabase } from "../lib/supabase";

export interface Turma {
  id: string;
  nome: string;
  nivel_id: string;
  ano_letivo: string;
}

export interface GuardarTurmaData {
  nome: string;
  nivelId: string;
  anoLetivo: string;
}

export async function listarTurmas(): Promise<Turma[]> {
  const { data, error } = await supabase
    .from("turmas")
    .select("id, nome, nivel_id, ano_letivo")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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

  const { data, error } = await supabase
    .from("turmas")
    .insert({
      nome,
      nivel_id: nivelId,
      ano_letivo: anoLetivo,
    })
    .select("id, nome, nivel_id, ano_letivo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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

  const { data, error } = await supabase
    .from("turmas")
    .update({
      nome,
      nivel_id: nivelId,
      ano_letivo: anoLetivo,
    })
    .eq("id", id)
    .select("id, nome, nivel_id, ano_letivo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarTurma(id: string): Promise<void> {
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