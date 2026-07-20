import { supabase } from "../lib/supabase";

export type TipoInterrupcaoLetiva =
  | "Feriado"
  | "Férias"
  | "Interrupção letiva"
  | "Encerramento"
  | "Outro";

export interface InterrupcaoLetiva {
  id: string;
  titulo: string;
  tipo: TipoInterrupcaoLetiva;
  data_inicio: string;
  data_fim: string;
  observacoes: string | null;
}

export interface GuardarInterrupcaoLetivaData {
  titulo: string;
  tipo: TipoInterrupcaoLetiva;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

function validarInterrupcao(
  dados: GuardarInterrupcaoLetivaData,
) {
  if (!dados.titulo.trim()) {
    throw new Error("O título é obrigatório.");
  }

  if (!dados.tipo) {
    throw new Error("Selecione o tipo.");
  }

  if (!dados.dataInicio) {
    throw new Error("A data de início é obrigatória.");
  }

  if (!dados.dataFim) {
    throw new Error("A data de fim é obrigatória.");
  }

  if (dados.dataFim < dados.dataInicio) {
    throw new Error(
      "A data de fim deve ser posterior à data de início.",
    );
  }
}

export async function listarInterrupcoesLetivas(): Promise<
  InterrupcaoLetiva[]
> {
  const { data, error } = await supabase
    .from("interrupcoes_letivas")
    .select(
      "id, titulo, tipo, data_inicio, data_fim, observacoes",
    )
    .order("data_inicio", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InterrupcaoLetiva[];
}

export async function criarInterrupcaoLetiva(
  dados: GuardarInterrupcaoLetivaData,
): Promise<InterrupcaoLetiva> {
  validarInterrupcao(dados);

  const { data, error } = await supabase
    .from("interrupcoes_letivas")
    .insert({
      titulo: dados.titulo.trim(),
      tipo: dados.tipo,
      data_inicio: dados.dataInicio,
      data_fim: dados.dataFim,
      observacoes: dados.observacoes.trim() || null,
    })
    .select(
      "id, titulo, tipo, data_inicio, data_fim, observacoes",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InterrupcaoLetiva;
}

export async function atualizarInterrupcaoLetiva(
  id: string,
  dados: GuardarInterrupcaoLetivaData,
): Promise<InterrupcaoLetiva> {
  if (!id.trim()) {
    throw new Error("Interrupção letiva inválida.");
  }

  validarInterrupcao(dados);

  const { data, error } = await supabase
    .from("interrupcoes_letivas")
    .update({
      titulo: dados.titulo.trim(),
      tipo: dados.tipo,
      data_inicio: dados.dataInicio,
      data_fim: dados.dataFim,
      observacoes: dados.observacoes.trim() || null,
    })
    .eq("id", id)
    .select(
      "id, titulo, tipo, data_inicio, data_fim, observacoes",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InterrupcaoLetiva;
}

export async function eliminarInterrupcaoLetiva(
  id: string,
): Promise<void> {
  if (!id.trim()) {
    throw new Error("Interrupção letiva inválida.");
  }

  const { error } = await supabase
    .from("interrupcoes_letivas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export function encontrarInterrupcaoNaData(
  interrupcoes: InterrupcaoLetiva[],
  data: string,
): InterrupcaoLetiva | undefined {
  return interrupcoes.find(
    (interrupcao) =>
      data >= interrupcao.data_inicio &&
      data <= interrupcao.data_fim,
  );
}