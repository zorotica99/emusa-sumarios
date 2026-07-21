import {
  listarAlunos,
} from "./alunos.service";
import {
  obterAnoLetivoAtual,
} from "./anoLetivo.service";
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
  listarPresencas,
  type Presenca,
} from "./presencas.service";
import {
  listarProfessores,
} from "./professores.service";
import {
  listarSumarios,
  type Sumario,
} from "./sumarios.service";

export interface AulaDashboard {
  horario: Horario;
  data: string;
  numeroAlunos: number;
  sumarioPreenchido: boolean;
  presencasRegistadas: boolean;
  aulaTerminada: boolean;
}

export interface DadosDashboard {
  aulasHoje: AulaDashboard[];
  sumariosEmFalta: AulaDashboard[];
  presencasEmFalta: AulaDashboard[];
  proximaAula: AulaDashboard | null;

  totalAlunosHoje: number;
  totalPresencasHoje: number;
  totalSumariosHoje: number;

  totalAlunosEscola: number;
  totalProfessoresEscola: number;
  totalHorariosEscola: number;
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

function formatarDataISO(
  data: Date,
): string {
  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(
  dataIso: string,
): Date {
  const [ano, mes, dia] = dataIso
    .split("-")
    .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia,
  );
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
  const data =
    criarDataLocal(dataIso);

  const [horas, minutos] = hora
    .slice(0, 5)
    .split(":")
    .map(Number);

  data.setHours(
    horas,
    minutos,
    0,
    0,
  );

  return data;
}

function existeSumario(
  sumarios: Sumario[],
  horarioId: string,
  data: string,
): boolean {
  return sumarios.some(
    (sumario) =>
      sumario.horario_id ===
        horarioId &&
      sumario.data === data,
  );
}

function existemPresencas(
  presencas: Presenca[],
  horarioId: string,
  data: string,
): boolean {
  return presencas.some(
    (presenca) =>
      presenca.horario_id ===
        horarioId &&
      presenca.data === data,
  );
}

function contarPresencasDaAula(
  presencas: Presenca[],
  horarioId: string,
  data: string,
): number {
  return presencas.filter(
    (presenca) =>
      presenca.horario_id ===
        horarioId &&
      presenca.data === data,
  ).length;
}

function contarAlunosDoHorario(
  horariosAlunos: HorarioAluno[],
  horarioId: string,
): number {
  return horariosAlunos.filter(
    (registo) =>
      registo.horario_id ===
      horarioId,
  ).length;
}

function dataTemAulas(
  dataIso: string,
  interrupcoes: Awaited<
    ReturnType<
      typeof listarInterrupcoesLetivas
    >
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
    encontrarFeriadoPortugal(
      dataIso,
    );

  return !feriado;
}

function criarAulaDashboard(
  horario: Horario,
  data: string,
  agora: Date,
  sumarios: Sumario[],
  presencas: Presenca[],
  horariosAlunos: HorarioAluno[],
): AulaDashboard {
  const numeroAlunos =
    contarAlunosDoHorario(
      horariosAlunos,
      horario.id,
    );

  return {
    horario,
    data,
    numeroAlunos,

    sumarioPreenchido:
      existeSumario(
        sumarios,
        horario.id,
        data,
      ),

    presencasRegistadas:
      numeroAlunos === 0 ||
      existemPresencas(
        presencas,
        horario.id,
        data,
      ),

    aulaTerminada:
      dataHoraDaAula(
        data,
        horario.hora_fim,
      ) <= agora,
  };
}

export async function obterDadosDashboard(
  professorId?: string | null,
): Promise<DadosDashboard> {
  const agora = new Date();

  const hojeIso =
    formatarDataISO(agora);

  const [
    todosHorarios,
    sumarios,
    presencas,
    horariosAlunos,
    interrupcoes,
    anoLetivo,
    alunos,
    professores,
  ] = await Promise.all([
    listarHorarios(),
    listarSumarios(),
    listarPresencas(),
    listarHorariosAlunos(),
    listarInterrupcoesLetivas(),
    obterAnoLetivoAtual(),
    listarAlunos(),
    listarProfessores(),
  ]);

  const horarios = professorId
    ? todosHorarios.filter(
        (horario) =>
          horario.professor_id ===
          professorId,
      )
    : todosHorarios;

  const nomeDiaHoje =
    nomesDiasSemana[
      agora.getDay()
    ];

  const existemAulasHoje =
    dataTemAulas(
      hojeIso,
      interrupcoes,
    );

  const aulasHoje = existemAulasHoje
    ? horarios
        .filter(
          (horario) =>
            horario.dia_semana ===
            nomeDiaHoje,
        )
        .map((horario) =>
          criarAulaDashboard(
            horario,
            hojeIso,
            agora,
            sumarios,
            presencas,
            horariosAlunos,
          ),
        )
        .sort((a, b) =>
          a.horario.hora_inicio.localeCompare(
            b.horario.hora_inicio,
          ),
        )
    : [];

  const proximaAula =
    aulasHoje.find(
      (aula) =>
        dataHoraDaAula(
          aula.data,
          aula.horario.hora_fim,
        ) > agora,
    ) ?? null;

  const dataInicio = anoLetivo
    ? criarDataLocal(
        anoLetivo.data_inicio,
      )
    : adicionarDias(
        agora,
        -60,
      );

  const dataFimConfigurada =
    anoLetivo
      ? criarDataLocal(
          anoLetivo.data_fim,
        )
      : agora;

  const limiteHoje = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
  );

  const dataFim =
    dataFimConfigurada <
    limiteHoje
      ? dataFimConfigurada
      : limiteHoje;

  const sumariosEmFalta:
    AulaDashboard[] = [];

  const presencasEmFalta:
    AulaDashboard[] = [];

  for (
    let dataAtual =
      new Date(dataInicio);

    dataAtual <= dataFim;

    dataAtual =
      adicionarDias(
        dataAtual,
        1,
      )
  ) {
    const dataIso =
      formatarDataISO(
        dataAtual,
      );

    if (
      !dataTemAulas(
        dataIso,
        interrupcoes,
      )
    ) {
      continue;
    }

    const nomeDia =
      nomesDiasSemana[
        dataAtual.getDay()
      ];

    const horariosDoDia =
      horarios.filter(
        (horario) =>
          horario.dia_semana ===
          nomeDia,
      );

    for (
      const horario of
      horariosDoDia
    ) {
      const aula =
        criarAulaDashboard(
          horario,
          dataIso,
          agora,
          sumarios,
          presencas,
          horariosAlunos,
        );

      if (!aula.aulaTerminada) {
        continue;
      }

      if (
        !aula.sumarioPreenchido
      ) {
        sumariosEmFalta.push(
          aula,
        );
      }

      if (
        aula.numeroAlunos > 0 &&
        !aula.presencasRegistadas
      ) {
        presencasEmFalta.push(
          aula,
        );
      }
    }
  }

  function ordenarMaisRecentes(
    a: AulaDashboard,
    b: AulaDashboard,
  ) {
    const dataA =
      dataHoraDaAula(
        a.data,
        a.horario.hora_inicio,
      ).getTime();

    const dataB =
      dataHoraDaAula(
        b.data,
        b.horario.hora_inicio,
      ).getTime();

    return dataB - dataA;
  }

  sumariosEmFalta.sort(
    ordenarMaisRecentes,
  );

  presencasEmFalta.sort(
    ordenarMaisRecentes,
  );

  const alunosHoje =
    new Set<string>();

  aulasHoje.forEach((aula) => {
    horariosAlunos
      .filter(
        (registo) =>
          registo.horario_id ===
          aula.horario.id,
      )
      .forEach((registo) => {
        alunosHoje.add(
          registo.aluno_id,
        );
      });
  });

  const totalPresencasHoje =
    aulasHoje.reduce(
      (total, aula) =>
        total +
        contarPresencasDaAula(
          presencas,
          aula.horario.id,
          hojeIso,
        ),
      0,
    );

  const totalSumariosHoje =
    aulasHoje.filter(
      (aula) =>
        aula.sumarioPreenchido,
    ).length;

  return {
    aulasHoje,
    sumariosEmFalta,
    presencasEmFalta,
    proximaAula,

    totalAlunosHoje:
      alunosHoje.size,

    totalPresencasHoje,
    totalSumariosHoje,

    totalAlunosEscola:
      alunos.length,

    totalProfessoresEscola:
      professores.length,

    totalHorariosEscola:
      todosHorarios.length,
  };
}