import { supabase } from "../lib/supabase";

export type EstadoAnoLetivo =
  | "Planeado"
  | "Ativo"
  | "Arquivado";

export interface AnoLetivo {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  estado: EstadoAnoLetivo;
  created_at: string;
  updated_at: string;
}

export interface CriarAnoLetivoData {
  nome: string;
  dataInicio: string;
  dataFim: string;
  ativar: boolean;
}

const camposAnoLetivo = `
  id,
  nome,
  data_inicio,
  data_fim,
  estado,
  created_at,
  updated_at
`;

function validarAnoLetivo(
  dados: CriarAnoLetivoData,
): void {
  if (!dados.nome.trim()) {
    throw new Error(
      "Introduza o nome do ano letivo.",
    );
  }

  if (!dados.dataInicio) {
    throw new Error(
      "Introduza a data de início.",
    );
  }

  if (!dados.dataFim) {
    throw new Error(
      "Introduza a data de fim.",
    );
  }

  if (
    dados.dataFim <
    dados.dataInicio
  ) {
    throw new Error(
      "A data de fim deve ser posterior à data de início.",
    );
  }
}

export async function listarAnosLetivos(): Promise<
  AnoLetivo[]
> {
  const { data, error } = await supabase
    .from("anos_letivos")
    .select(camposAnoLetivo)
    .order("data_inicio", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnoLetivo[];
}

export async function obterAnoLetivoAtivo(): Promise<
  AnoLetivo | null
> {
  const { data, error } = await supabase
    .from("anos_letivos")
    .select(camposAnoLetivo)
    .eq("estado", "Ativo")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AnoLetivo | null;
}

export async function criarAnoLetivo(
  dados: CriarAnoLetivoData,
): Promise<AnoLetivo> {
  validarAnoLetivo(dados);

  if (dados.ativar) {
    const { error: erroDesativar } =
      await supabase
        .from("anos_letivos")
        .update({
          estado: "Planeado",
        })
        .eq("estado", "Ativo");

    if (erroDesativar) {
      throw new Error(
        erroDesativar.message,
      );
    }
  }

  const { data, error } = await supabase
    .from("anos_letivos")
    .insert({
      nome: dados.nome.trim(),
      data_inicio:
        dados.dataInicio,
      data_fim: dados.dataFim,
      estado: dados.ativar
        ? "Ativo"
        : "Planeado",
    })
    .select(camposAnoLetivo)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe um ano letivo com este nome.",
      );
    }

    throw new Error(error.message);
  }

  return data as AnoLetivo;
}

export async function ativarAnoLetivo(
  anoLetivoId: string,
): Promise<void> {
  if (!anoLetivoId.trim()) {
    throw new Error(
      "Ano letivo inválido.",
    );
  }

  const { error: erroDesativar } =
    await supabase
      .from("anos_letivos")
      .update({
        estado: "Planeado",
      })
      .eq("estado", "Ativo");

  if (erroDesativar) {
    throw new Error(
      erroDesativar.message,
    );
  }

  const { error } = await supabase
    .from("anos_letivos")
    .update({
      estado: "Ativo",
    })
    .eq("id", anoLetivoId)
    .neq("estado", "Arquivado");

  if (error) {
    throw new Error(error.message);
  }
}

export async function arquivarAnoLetivo(
  anoLetivoId: string,
): Promise<void> {
  if (!anoLetivoId.trim()) {
    throw new Error(
      "Ano letivo inválido.",
    );
  }

  const { data: ano, error: erroAno } =
    await supabase
      .from("anos_letivos")
      .select("id, nome, estado")
      .eq("id", anoLetivoId)
      .single();

  if (erroAno) {
    throw new Error(
      erroAno.message,
    );
  }

  if (ano.estado === "Arquivado") {
    return;
  }

  const { error } = await supabase
    .from("anos_letivos")
    .update({
      estado: "Arquivado",
    })
    .eq("id", anoLetivoId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function atualizarDatasAnoLetivo(
  anoLetivoId: string,
  dataInicio: string,
  dataFim: string,
): Promise<void> {
  if (!anoLetivoId.trim()) {
    throw new Error(
      "Ano letivo inválido.",
    );
  }

  if (!dataInicio || !dataFim) {
    throw new Error(
      "Preencha as datas do ano letivo.",
    );
  }

  if (dataFim < dataInicio) {
    throw new Error(
      "A data de fim deve ser posterior à data de início.",
    );
  }

  const { error } = await supabase
    .from("anos_letivos")
    .update({
      data_inicio: dataInicio,
      data_fim: dataFim,
    })
    .eq("id", anoLetivoId)
    .neq("estado", "Arquivado");

  if (error) {
    throw new Error(error.message);
  }
}