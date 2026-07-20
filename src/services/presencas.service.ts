import { supabase } from "../lib/supabase";

export type EstadoPresenca =
  | "Presente"
  | "Falta"
  | "Falta justificada";

export interface Presenca {
  id: string;
  horario_id: string;
  aluno_id: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string | null;
}

export interface GuardarPresencaData {
  horarioId: string;
  alunoId: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string;
}

export interface PresencaEmLote {
  alunoId: string;
  estado: EstadoPresenca;
  observacoes?: string;
}

function validarPresenca(dados: GuardarPresencaData) {
  if (!dados.horarioId.trim()) {
    throw new Error("Selecione um horário.");
  }

  if (!dados.alunoId.trim()) {
    throw new Error("Selecione um aluno.");
  }

  if (!dados.data.trim()) {
    throw new Error("Selecione uma data.");
  }
}

export async function listarPresencas(): Promise<Presenca[]> {
  const { data, error } = await supabase
    .from("presencas")
    .select(
      "id, horario_id, aluno_id, data, estado, observacoes",
    )
    .order("data", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Presenca[];
}

export async function listarPresencasDaAula(
  horarioId: string,
  dataAula: string,
): Promise<Presenca[]> {
  if (!horarioId || !dataAula) {
    return [];
  }

  const { data, error } = await supabase
    .from("presencas")
    .select(
      "id, horario_id, aluno_id, data, estado, observacoes",
    )
    .eq("horario_id", horarioId)
    .eq("data", dataAula);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Presenca[];
}

export async function guardarPresencasEmLote(
  horarioId: string,
  dataAula: string,
  presencas: PresencaEmLote[],
): Promise<void> {
  if (!horarioId.trim()) {
    throw new Error("Horário inválido.");
  }

  if (!dataAula.trim()) {
    throw new Error("Data inválida.");
  }

  if (presencas.length === 0) {
    return;
  }

  const registos = presencas.map((presenca) => ({
    horario_id: horarioId,
    aluno_id: presenca.alunoId,
    data: dataAula,
    estado: presenca.estado,
    observacoes: presenca.observacoes?.trim() || null,
  }));

  const { error } = await supabase
    .from("presencas")
    .upsert(registos, {
      onConflict: "horario_id,aluno_id,data",
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function criarPresenca(
  dados: GuardarPresencaData,
): Promise<Presenca> {
  validarPresenca(dados);

  const { data, error } = await supabase
    .from("presencas")
    .insert({
      horario_id: dados.horarioId,
      aluno_id: dados.alunoId,
      data: dados.data,
      estado: dados.estado,
      observacoes: dados.observacoes.trim() || null,
    })
    .select(
      "id, horario_id, aluno_id, data, estado, observacoes",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe uma presença deste aluno para este horário e data.",
      );
    }

    throw new Error(error.message);
  }

  return data as Presenca;
}

export async function atualizarPresenca(
  id: string,
  dados: GuardarPresencaData,
): Promise<Presenca> {
  if (!id.trim()) {
    throw new Error("Presença inválida.");
  }

  validarPresenca(dados);

  const { data, error } = await supabase
    .from("presencas")
    .update({
      horario_id: dados.horarioId,
      aluno_id: dados.alunoId,
      data: dados.data,
      estado: dados.estado,
      observacoes: dados.observacoes.trim() || null,
    })
    .eq("id", id)
    .select(
      "id, horario_id, aluno_id, data, estado, observacoes",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Presenca;
}

export async function eliminarPresenca(id: string): Promise<void> {
  if (!id.trim()) {
    throw new Error("Presença inválida.");
  }

  const { error } = await supabase
    .from("presencas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}