import { supabase } from "../lib/supabase";

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string | null;
}

export interface GuardarDisciplinaData {
  nome: string;
  codigo: string;
}

export async function listarDisciplinas(): Promise<Disciplina[]> {
  const { data, error } = await supabase
    .from("disciplinas")
    .select("id, nome, codigo")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarDisciplina(
  dados: GuardarDisciplinaData,
): Promise<Disciplina> {
  const nome = dados.nome.trim();
  const codigo = dados.codigo.trim();

  if (!nome) {
    throw new Error("O nome da disciplina é obrigatório.");
  }

  const { data, error } = await supabase
    .from("disciplinas")
    .insert({
      nome,
      codigo: codigo || null,
    })
    .select("id, nome, codigo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarDisciplina(
  id: string,
  dados: GuardarDisciplinaData,
): Promise<Disciplina> {
  const nome = dados.nome.trim();
  const codigo = dados.codigo.trim();

  if (!id) {
    throw new Error("Disciplina inválida.");
  }

  if (!nome) {
    throw new Error("O nome da disciplina é obrigatório.");
  }

  const { data, error } = await supabase
    .from("disciplinas")
    .update({
      nome,
      codigo: codigo || null,
    })
    .eq("id", id)
    .select("id, nome, codigo")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarDisciplina(id: string): Promise<void> {
  if (!id) {
    throw new Error("Disciplina inválida.");
  }

  const { error } = await supabase
    .from("disciplinas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}