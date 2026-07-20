import { supabase } from "../lib/supabase";

export interface RelatorioTotais {
  professores: number;
  alunos: number;
  instrumentos: number;
  disciplinas: number;
  niveis: number;
  turmas: number;
  horarios: number;
  sumarios: number;
  presencas: number;
}

export interface RelatorioPresencas {
  presentes: number;
  faltas: number;
  faltasJustificadas: number;
}

async function contarRegistos(tabela: string): Promise<number> {
  const { count, error } = await supabase
    .from(tabela)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function contarPresencasPorEstado(
  estado: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("presencas")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("estado", estado);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function obterTotaisRelatorios(): Promise<RelatorioTotais> {
  const [
    professores,
    alunos,
    instrumentos,
    disciplinas,
    niveis,
    turmas,
    horarios,
    sumarios,
    presencas,
  ] = await Promise.all([
    contarRegistos("professores"),
    contarRegistos("alunos"),
    contarRegistos("instrumentos"),
    contarRegistos("disciplinas"),
    contarRegistos("niveis"),
    contarRegistos("turmas"),
    contarRegistos("horarios"),
    contarRegistos("sumarios"),
    contarRegistos("presencas"),
  ]);

  return {
    professores,
    alunos,
    instrumentos,
    disciplinas,
    niveis,
    turmas,
    horarios,
    sumarios,
    presencas,
  };
}

export async function obterRelatorioPresencas(): Promise<RelatorioPresencas> {
  const [presentes, faltas, faltasJustificadas] =
    await Promise.all([
      contarPresencasPorEstado("Presente"),
      contarPresencasPorEstado("Falta"),
      contarPresencasPorEstado("Falta justificada"),
    ]);

  return {
    presentes,
    faltas,
    faltasJustificadas,
  };
}