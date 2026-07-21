import {
  obterAlunosDoGrupoAutomatico,
  type GrupoAutomatico,
} from "./gruposAutomaticos.service";
import {
  listarHorarios,
  type Horario,
} from "./horarios.service";
import { definirAlunosDoHorario } from "./horariosAlunos.service";

export interface ResultadoSincronizacaoGrupo {
  totalHorarios: number;
  totalParticipantes: number;
}

function obterHorariosDoGrupo(
  horarios: Horario[],
  grupo: GrupoAutomatico,
): Horario[] {
  if (!grupo.disciplina_id) {
    return [];
  }

  return horarios.filter(
    (horario) =>
      horario.tipo_aula === "Grupo" &&
      horario.disciplina_id ===
        grupo.disciplina_id,
  );
}

export async function sincronizarHorariosDoGrupoAutomatico(
  grupo: GrupoAutomatico,
): Promise<ResultadoSincronizacaoGrupo> {
  if (!grupo.id.trim()) {
    throw new Error(
      "Grupo automático inválido.",
    );
  }

  if (!grupo.disciplina_id) {
    return {
      totalHorarios: 0,
      totalParticipantes: 0,
    };
  }

  const [horarios, alunosDoGrupo] =
    await Promise.all([
      listarHorarios(),
      obterAlunosDoGrupoAutomatico(grupo),
    ]);

  const alunoIds = alunosDoGrupo
    .filter((item) => item.participa)
    .map((item) => item.aluno.id);

  const horariosDoGrupo =
    obterHorariosDoGrupo(
      horarios,
      grupo,
    );

  await Promise.all(
    horariosDoGrupo.map((horario) =>
      definirAlunosDoHorario(
        horario.id,
        alunoIds,
      ),
    ),
  );

  return {
    totalHorarios: horariosDoGrupo.length,
    totalParticipantes: alunoIds.length,
  };
}

export async function sincronizarTodosOsGruposAutomaticos(
  grupos: GrupoAutomatico[],
): Promise<ResultadoSincronizacaoGrupo> {
  const gruposAtivos = grupos.filter(
    (grupo) =>
      grupo.ativo &&
      Boolean(grupo.disciplina_id),
  );

  const resultados = await Promise.all(
    gruposAtivos.map((grupo) =>
      sincronizarHorariosDoGrupoAutomatico(
        grupo,
      ),
    ),
  );

  return resultados.reduce(
    (total, resultado) => ({
      totalHorarios:
        total.totalHorarios +
        resultado.totalHorarios,

      totalParticipantes:
        total.totalParticipantes +
        resultado.totalParticipantes,
    }),
    {
      totalHorarios: 0,
      totalParticipantes: 0,
    },
  );
}