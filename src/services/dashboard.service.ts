import {
  encontrarFeriadoPortugal,
} from "./feriadosPortugal.service";
import {
  listarHorarios,
  type Horario,
} from "./horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "./horariosAlunos.service";
import {
  encontrarInterrupcaoNaData,
  listarInterrupcoesLetivas,
} from "./interrupcoesLetivas.service";
import {
  obterAnoLetivoAtual,
} from "./anoLetivo.service";
import {
  listarSumarios,
  type Sumario,
} from "./sumarios.service";

export interface AulaDashboard {
  horario: Horario;
  data: string;
  numeroAlunos: number;
  sumarioPreenchido: boolean;
}

export interface DadosDashboard {
  aulasHoje: AulaDashboard[];
  sumariosEmFalta: AulaDashboard[];
  proximaAula: AulaDashboard | null;
  totalAlunosHoje: number;
}

const nomesDiasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(dataIso: string): Date {
  const [ano, mes, dia] = dataIso
    .split("-")
    .map(Number);

  return new Date(ano, mes - 1, dia);
}

function adicionarDias(
  data: Date,
  numeroDias: number,
): Date {
  const novaData = new Date(data);

  novaData.setDate(
    novaData.getDate() + numeroDias,
  );

  return novaData;
}

function dataHoraDaAula(
  dataIso: string,
  hora: string,
): Date {
  const data = criarDataLocal(dataIso);
  const [horas, minutos] = hora
    .slice(0, 5)
    .split(":")
    .map(Number);

  data.setHours(horas, minutos, 0, 0);

  return data;
}

function existeSumario(
  sumarios: Sumario[],
  horarioId: string,
  data: string,
): boolean {
  return sumarios.some(
    (sumario) =>
      sumario.horario_id === horarioId &&
      sumario.data === data,
  );
}

function contarAlunosDoHorario(
  horariosAlunos: HorarioAluno[],
  horarioId: string,
): number {
  return horariosAlunos.filter(
    (registo) =>
      registo.horario_id === horarioId,
  ).length;
}

function dataTemAulas(
  dataIso: string,
  interrupcoes: Awaited<
    ReturnType<typeof listarInterrupcoesLetivas>
  >,
): boolean {
  const interrupcao =
    encontrarInterrupcaoNaData(
      interrupcoes,
      dataIso,
    );

  if (interrupcao) {
    return false;
  }

  const feriado =
    encontrarFeriadoPortugal(dataIso);

  return !feriado;
}

export async function obterDadosDashboard(
  professorId?: string | null,
): Promise<DadosDashboard> {
  const agora = new Date();
  const hojeIso = formatarDataISO(agora);

  const [
    todosHorarios,
    sumarios,
    horariosAlunos,
    interrupcoes,
    anoLetivo,
  ] = await Promise.all([
    listarHorarios(),
    listarSumarios(),
    listarHorariosAlunos(),
    listarInterrupcoesLetivas(),
    obterAnoLetivoAtual(),
  ]);

  const horarios = professorId
    ? todosHorarios.filter(
        (horario) =>
          horario.professor_id === professorId,
      )
    : todosHorarios;

  const nomeDiaHoje =
    nomesDiasSemana[agora.getDay()];

  const aulasHoje = horarios
    .filter(
      (horario) =>
        horario.dia_semana === nomeDiaHoje,
    )
    .filter(() =>
      dataTemAulas(hojeIso, interrupcoes),
    )
    .map((horario) => ({
      horario,
      data: hojeIso,
      numeroAlunos: contarAlunosDoHorario(
        horariosAlunos,
        horario.id,
      ),
      sumarioPreenchido: existeSumario(
        sumarios,
        horario.id,
        hojeIso,
      ),
    }))
    .sort((a, b) =>
      a.horario.hora_inicio.localeCompare(
        b.horario.hora_inicio,
      ),
    );

  const proximaAula =
    aulasHoje.find(
      (aula) =>
        dataHoraDaAula(
          aula.data,
          aula.horario.hora_fim,
        ) > agora,
    ) ?? null;

  const dataInicio = anoLetivo
    ? criarDataLocal(anoLetivo.data_inicio)
    : adicionarDias(agora, -60);

  const dataFimConfigurada = anoLetivo
    ? criarDataLocal(anoLetivo.data_fim)
    : agora;

  const limiteHoje = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
  );

  const dataFim =
    dataFimConfigurada < limiteHoje
      ? dataFimConfigurada
      : limiteHoje;

  const sumariosEmFalta: AulaDashboard[] = [];

  for (
    let dataAtual = new Date(dataInicio);
    dataAtual <= dataFim;
    dataAtual = adicionarDias(dataAtual, 1)
  ) {
    const dataIso =
      formatarDataISO(dataAtual);

    if (
      !dataTemAulas(dataIso, interrupcoes)
    ) {
      continue;
    }

    const nomeDia =
      nomesDiasSemana[dataAtual.getDay()];

    const horariosDoDia = horarios.filter(
      (horario) =>
        horario.dia_semana === nomeDia,
    );

    for (const horario of horariosDoDia) {
      const fimDaAula = dataHoraDaAula(
        dataIso,
        horario.hora_fim,
      );

      if (fimDaAula > agora) {
        continue;
      }

      if (
        existeSumario(
          sumarios,
          horario.id,
          dataIso,
        )
      ) {
        continue;
      }

      sumariosEmFalta.push({
        horario,
        data: dataIso,
        numeroAlunos: contarAlunosDoHorario(
          horariosAlunos,
          horario.id,
        ),
        sumarioPreenchido: false,
      });
    }
  }

  sumariosEmFalta.sort((a, b) => {
    const dataA = dataHoraDaAula(
      a.data,
      a.horario.hora_inicio,
    ).getTime();

    const dataB = dataHoraDaAula(
      b.data,
      b.horario.hora_inicio,
    ).getTime();

    return dataB - dataA;
  });

  const alunosHoje = new Set<string>();

  aulasHoje.forEach((aula) => {
    horariosAlunos
      .filter(
        (registo) =>
          registo.horario_id ===
          aula.horario.id,
      )
      .forEach((registo) => {
        alunosHoje.add(registo.aluno_id);
      });
  });

  return {
    aulasHoje,
    sumariosEmFalta,
    proximaAula,
    totalAlunosHoje: alunosHoje.size,
  };
}