import { supabase } from "../lib/supabase";

export interface Sumario {
  id: string;
  horario_id: string;
  data: string;
  conteudo: string;
}

export interface GuardarSumarioData {
  horarioId: string;
  data: string;
  conteudo: string;
}

function validarSumario(dados: GuardarSumarioData) {
  if (!dados.horarioId.trim()) {
    throw new Error("Selecione um horário.");
  }

  if (!dados.data.trim()) {
    throw new Error("Selecione uma data.");
  }

  if (!dados.conteudo.trim()) {
    throw new Error("O conteúdo do sumário é obrigatório.");
  }
}

export async function listarSumarios(): Promise<Sumario[]> {
  const { data, error } = await supabase
    .from("sumarios")
    .select("id, horario_id, data, conteudo")
    .order("data", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarSumario(
  dados: GuardarSumarioData,
): Promise<Sumario> {
  validarSumario(dados);

  const { data, error } = await supabase
    .from("sumarios")
    .insert({
      horario_id: dados.horarioId,
      data: dados.data,
      conteudo: dados.conteudo.trim(),
    })
    .select("id, horario_id, data, conteudo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarSumario(
  id: string,
  dados: GuardarSumarioData,
): Promise<Sumario> {
  if (!id.trim()) {
    throw new Error("Sumário inválido.");
  }

  validarSumario(dados);

  const { data, error } = await supabase
    .from("sumarios")
    .update({
      horario_id: dados.horarioId,
      data: dados.data,
      conteudo: dados.conteudo.trim(),
    })
    .eq("id", id)
    .select("id, horario_id, data, conteudo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarSumario(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error("Sumário inválido.");
  }

  const { error } = await supabase
    .from("sumarios")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}