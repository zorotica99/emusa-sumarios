import { supabase } from "../lib/supabase";

export interface Professor {
  id: string;
  nome: string;
  email: string | null;
  telemovel: string | null;
  instrumento_id: string | null;
}

export interface GuardarProfessorData {
  nome: string;
  email: string;
  telemovel: string;
  instrumentoId: string;
}

export async function listarProfessores(): Promise<Professor[]> {
  const { data, error } = await supabase
    .from("professores")
    .select("id, nome, email, telemovel, instrumento_id")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarProfessor(
  dados: GuardarProfessorData,
): Promise<Professor> {
  const nome = dados.nome.trim();
  const email = dados.email.trim();
  const telemovel = dados.telemovel.trim();
  const instrumentoId = dados.instrumentoId.trim();

  if (!nome) {
    throw new Error("O nome do professor é obrigatório.");
  }

  if (!instrumentoId) {
    throw new Error("Selecione um instrumento.");
  }

  const { data, error } = await supabase
    .from("professores")
    .insert({
      nome,
      email: email || null,
      telemovel: telemovel || null,
      instrumento_id: instrumentoId,
    })
    .select("id, nome, email, telemovel, instrumento_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarProfessor(
  id: string,
  dados: GuardarProfessorData,
): Promise<Professor> {
  const nome = dados.nome.trim();
  const email = dados.email.trim();
  const telemovel = dados.telemovel.trim();
  const instrumentoId = dados.instrumentoId.trim();

  if (!id) {
    throw new Error("Professor inválido.");
  }

  if (!nome) {
    throw new Error("O nome do professor é obrigatório.");
  }

  if (!instrumentoId) {
    throw new Error("Selecione um instrumento.");
  }

  const { data, error } = await supabase
    .from("professores")
    .update({
      nome,
      email: email || null,
      telemovel: telemovel || null,
      instrumento_id: instrumentoId,
    })
    .eq("id", id)
    .select("id, nome, email, telemovel, instrumento_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarProfessor(id: string): Promise<void> {
  if (!id) {
    throw new Error("Professor inválido.");
  }

  const { error } = await supabase
    .from("professores")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}