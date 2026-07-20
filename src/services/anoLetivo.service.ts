import { supabase } from "../lib/supabase";

export interface ConfiguracaoAnoLetivo {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  updated_at: string;
}

export interface GuardarAnoLetivoData {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

const CONFIGURACAO_ID = "atual";

export async function obterAnoLetivoAtual(): Promise<
  ConfiguracaoAnoLetivo | null
> {
  const { data, error } = await supabase
    .from("configuracao_ano_letivo")
    .select("id, nome, data_inicio, data_fim, updated_at")
    .eq("id", CONFIGURACAO_ID)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function guardarAnoLetivo(
  dados: GuardarAnoLetivoData,
): Promise<ConfiguracaoAnoLetivo> {
  const nome = dados.nome.trim();
  const dataInicio = dados.dataInicio.trim();
  const dataFim = dados.dataFim.trim();

  if (!nome) {
    throw new Error("O nome do ano letivo é obrigatório.");
  }

  if (!dataInicio) {
    throw new Error("A data de início é obrigatória.");
  }

  if (!dataFim) {
    throw new Error("A data de fim é obrigatória.");
  }

  if (dataFim < dataInicio) {
    throw new Error(
      "A data de fim deve ser posterior à data de início.",
    );
  }

  const { data, error } = await supabase
    .from("configuracao_ano_letivo")
    .upsert(
      {
        id: CONFIGURACAO_ID,
        nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )
    .select("id, nome, data_inicio, data_fim, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}