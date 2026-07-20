import { supabase } from "../lib/supabase";

export interface Aluno {
  id: string;
  nome: string;
  data_nascimento: string | null;
  encarregado: string | null;
  contacto: string | null;
}

export interface GuardarAlunoData {
  nome: string;
  dataNascimento: string;
  encarregado: string;
  contacto: string;
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data, error } = await supabase
    .from("alunos")
    .select("id, nome, data_nascimento, encarregado, contacto")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function criarAluno(
  dados: GuardarAlunoData,
): Promise<Aluno> {
  const nome = dados.nome.trim();
  const dataNascimento = dados.dataNascimento.trim();
  const encarregado = dados.encarregado.trim();
  const contacto = dados.contacto.trim();

  if (!nome) {
    throw new Error("O nome do aluno é obrigatório.");
  }

  const { data, error } = await supabase
    .from("alunos")
    .insert({
      nome,
      data_nascimento: dataNascimento || null,
      encarregado: encarregado || null,
      contacto: contacto || null,
    })
    .select("id, nome, data_nascimento, encarregado, contacto")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function atualizarAluno(
  id: string,
  dados: GuardarAlunoData,
): Promise<Aluno> {
  const nome = dados.nome.trim();
  const dataNascimento = dados.dataNascimento.trim();
  const encarregado = dados.encarregado.trim();
  const contacto = dados.contacto.trim();

  if (!id) {
    throw new Error("Aluno inválido.");
  }

  if (!nome) {
    throw new Error("O nome do aluno é obrigatório.");
  }

  const { data, error } = await supabase
    .from("alunos")
    .update({
      nome,
      data_nascimento: dataNascimento || null,
      encarregado: encarregado || null,
      contacto: contacto || null,
    })
    .eq("id", id)
    .select("id, nome, data_nascimento, encarregado, contacto")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function eliminarAluno(id: string): Promise<void> {
  if (!id) {
    throw new Error("Aluno inválido.");
  }

  const { error } = await supabase
    .from("alunos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}