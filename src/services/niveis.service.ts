import { supabase } from "../lib/supabase";

export interface Nivel {
  id: string;
  nome: string;
}

export interface GuardarNivelData {
  nome: string;
}

export async function listarNiveis(): Promise<Nivel[]> {
  const { data, error } = await supabase
    .from("niveis")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarNivel(
  dados: GuardarNivelData,
): Promise<Nivel> {
  const nome = dados.nome.trim();

  if (!nome) {
    throw new Error("O nome do nível é obrigatório.");
  }

  const { data, error } = await supabase
    .from("niveis")
    .insert({ nome })
    .select("id, nome")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarNivel(
  id: string,
  dados: GuardarNivelData,
): Promise<Nivel> {
  const nome = dados.nome.trim();

  if (!id) {
    throw new Error("Nível inválido.");
  }

  if (!nome) {
    throw new Error("O nome do nível é obrigatório.");
  }

  const { data, error } = await supabase
    .from("niveis")
    .update({ nome })
    .eq("id", id)
    .select("id, nome")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarNivel(id: string): Promise<void> {
  if (!id) {
    throw new Error("Nível inválido.");
  }

  const { error } = await supabase
    .from("niveis")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}