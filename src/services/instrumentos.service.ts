import { supabase } from "../lib/supabase";

export interface Instrumento {
  id: string;
  nome: string;
}

export interface CriarInstrumentoData {
  nome: string;
}

export interface AtualizarInstrumentoData {
  nome: string;
}

export async function listarInstrumentos(): Promise<Instrumento[]> {
  const { data, error } = await supabase
    .from("instrumentos")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarInstrumento(
  dados: CriarInstrumentoData,
): Promise<Instrumento> {
  const nome = dados.nome.trim();

  if (!nome) {
    throw new Error("O nome do instrumento é obrigatório.");
  }

  const { data, error } = await supabase
    .from("instrumentos")
    .insert({ nome })
    .select("id, nome")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarInstrumento(
  id: string,
  dados: AtualizarInstrumentoData,
): Promise<Instrumento> {
  const nome = dados.nome.trim();

  if (!id) {
    throw new Error("Instrumento inválido.");
  }

  if (!nome) {
    throw new Error("O nome do instrumento é obrigatório.");
  }

  const { data, error } = await supabase
    .from("instrumentos")
    .update({ nome })
    .eq("id", id)
    .select("id, nome")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarInstrumento(id: string): Promise<void> {
  if (!id) {
    throw new Error("Instrumento inválido.");
  }

  const { error } = await supabase
    .from("instrumentos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}