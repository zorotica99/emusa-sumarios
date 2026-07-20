import {
  listarSumarios,
  type Sumario,
} from "./sumarios.service";

export async function obterUltimoSumarioDoHorario(
  horarioId: string,
  dataAtual: string,
): Promise<Sumario | null> {
  if (!horarioId.trim() || !dataAtual.trim()) {
    return null;
  }

  const sumarios = await listarSumarios();

  const anteriores = sumarios
    .filter(
      (sumario) =>
        sumario.horario_id === horarioId &&
        sumario.data < dataAtual,
    )
    .sort((a, b) =>
      b.data.localeCompare(a.data),
    );

  return anteriores[0] ?? null;
}