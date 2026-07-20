import { supabase } from "../lib/supabase";

export type TipoAula =
  | "Individual"
  | "Turma"
  | "Grupo";

export interface Horario {
  id: string;
  professor_id: string;
  turma_id: string;
  disciplina_id: string;
  instrumento_id: string | null;
  tipo_aula: TipoAula;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

export interface GuardarHorarioData {
  professorId: string;
  turmaId: string;
  disciplinaId: string;
  instrumentoId: string;
  tipoAula?: TipoAula;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
}

const camposHorario = `
  id,
  professor_id,
  turma_id,
  disciplina_id,
  instrumento_id,
  tipo_aula,
  dia_semana,
  hora_inicio,
  hora_fim
`;

function validarHorario(dados: GuardarHorarioData) {
  const tipoAula = dados.tipoAula ?? "Turma";

  if (!dados.professorId.trim()) {
    throw new Error("Selecione um professor.");
  }

  if (!dados.turmaId.trim()) {
    throw new Error("Selecione uma turma.");
  }

  if (!dados.disciplinaId.trim()) {
    throw new Error("Selecione uma disciplina.");
  }

  if (
    tipoAula === "Individual" &&
    !dados.instrumentoId.trim()
  ) {
    throw new Error(
      "Selecione o instrumento da aula individual.",
    );
  }

  if (!dados.diaSemana.trim()) {
    throw new Error("Selecione um dia da semana.");
  }

  if (!dados.horaInicio.trim()) {
    throw new Error("Indique a hora de início.");
  }

  if (!dados.horaFim.trim()) {
    throw new Error("Indique a hora de fim.");
  }

  if (dados.horaFim <= dados.horaInicio) {
    throw new Error(
      "A hora de fim deve ser posterior à hora de início.",
    );
  }
}

export async function listarHorarios(): Promise<Horario[]> {
  const { data, error } = await supabase
    .from("horarios")
    .select(camposHorario)
    .order("dia_semana", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Horario[];
}

export async function criarHorario(
  dados: GuardarHorarioData,
): Promise<Horario> {
  validarHorario(dados);

  const { data, error } = await supabase
    .from("horarios")
    .insert({
      professor_id: dados.professorId,
      turma_id: dados.turmaId,
      disciplina_id: dados.disciplinaId,
      instrumento_id:
        dados.instrumentoId.trim() || null,
      tipo_aula: dados.tipoAula ?? "Turma",
      dia_semana: dados.diaSemana,
      hora_inicio: dados.horaInicio,
      hora_fim: dados.horaFim,
    })
    .select(camposHorario)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Horario;
}

export async function atualizarHorario(
  id: string,
  dados: GuardarHorarioData,
): Promise<Horario> {
  if (!id.trim()) {
    throw new Error("Horário inválido.");
  }

  validarHorario(dados);

  const { data, error } = await supabase
    .from("horarios")
    .update({
      professor_id: dados.professorId,
      turma_id: dados.turmaId,
      disciplina_id: dados.disciplinaId,
      instrumento_id:
        dados.instrumentoId.trim() || null,
      tipo_aula: dados.tipoAula ?? "Turma",
      dia_semana: dados.diaSemana,
      hora_inicio: dados.horaInicio,
      hora_fim: dados.horaFim,
    })
    .eq("id", id)
    .select(camposHorario)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Horario;
}

export async function eliminarHorario(
  id: string,
): Promise<void> {
  if (!id.trim()) {
    throw new Error("Horário inválido.");
  }

  const { error } = await supabase
    .from("horarios")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}