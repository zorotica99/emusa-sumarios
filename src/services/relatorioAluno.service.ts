import { supabase } from "../lib/supabase";
import type { EstadoPresenca } from "./presencas.service";

export interface PresencaAlunoDetalhada {
  id: string;
  horario_id: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string | null;
}

export interface TotaisPresencaAluno {
  total: number;
  presentes: number;
  faltas: number;
  faltasJustificadas: number;
}

export async function listarPresencasDoAluno(
  alunoId: string,
): Promise<PresencaAlunoDetalhada[]> {
  if (!alunoId.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("presencas")
    .select("id, horario_id, data, estado, observacoes")
    .eq("aluno_id", alunoId)
    .order("data", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PresencaAlunoDetalhada[];
}

export function calcularTotaisPresencaAluno(
  presencas: PresencaAlunoDetalhada[],
): TotaisPresencaAluno {
  return {
    total: presencas.length,
    presentes: presencas.filter(
      (presenca) => presenca.estado === "Presente",
    ).length,
    faltas: presencas.filter(
      (presenca) => presenca.estado === "Falta",
    ).length,
    faltasJustificadas: presencas.filter(
      (presenca) => presenca.estado === "Falta justificada",
    ).length,
  };
}