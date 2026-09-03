import {
  CalendarCheck2,
  CalendarOff,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FilePenLine,
  Music2,
  RefreshCw,
  School,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import { useAuth } from "../../hooks/useAuth";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  encontrarFeriadoPortugal,
  type FeriadoPortugal,
} from "../../services/feriadosPortugal.service";
import {
  listarHorarios,
  type Horario,
} from "../../services/horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../services/horariosAlunos.service";
import {
  encontrarInterrupcaoNaData,
  listarInterrupcoesLetivas,
  type InterrupcaoLetiva,
} from "../../services/interrupcoesLetivas.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../services/instrumentos.service";
import {
  listarPresencas,
  type Presenca,
} from "../../services/presencas.service";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import {
  listarSumarios,
  type Sumario,
} from "../../services/sumarios.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Calendario.css";

interface DiaCalendario {
  nome: string;
  data: string;
  dataFormatada: string;
  eHoje: boolean;
}

interface DiaSemAulas {
  titulo: string;
  tipo: string;
  observacoes: string | null;
}

type EstadoTemporalAula =
  | "Futura"
  | "Em curso"
  | "Terminada";

const nomesDias = [
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
  const [ano, mes, dia] =
    dataIso.split("-").map(Number);

  return new Date(
    ano,
    mes - 1,
    dia,
  );
}

function criarDataHora(
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

function formatarDataVisivel(
  data: Date,
): string {
  return new Intl.DateTimeFormat(
    "pt-PT",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(data);
}

function obterSegundaFeira(
  dataBase: Date,
): Date {
  const data = new Date(dataBase);

  const diaSemana =
    data.getDay();

  const diferenca =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  data.setDate(
    data.getDate() + diferenca,
  );

  data.setHours(0, 0, 0, 0);

  return data;
}

function criarDiasDaSemana(
  dataBase: Date,
): DiaCalendario[] {
  const segundaFeira =
    obterSegundaFeira(dataBase);

  const hojeIso =
    formatarDataISO(new Date());

  return nomesDias.map(
    (nome, indice) => {
      const data =
        new Date(segundaFeira);

      data.setDate(
        segundaFeira.getDate() +
          indice,
      );

      const dataIso =
        formatarDataISO(data);

      return {
        nome,
        data: dataIso,
        dataFormatada:
          formatarDataVisivel(data),
        eHoje:
          dataIso === hojeIso,
      };
    },
  );
}

function converterInterrupcao(
  interrupcao: InterrupcaoLetiva,
): DiaSemAulas {
  return {
    titulo: interrupcao.titulo,
    tipo: interrupcao.tipo,
    observacoes:
      interrupcao.observacoes,
  };
}

function converterFeriado(
  feriado: FeriadoPortugal,
): DiaSemAulas {
  return {
    titulo: feriado.titulo,
    tipo: feriado.tipo,
    observacoes: null,
  };
}

function Calendario() {
  const navigate = useNavigate();

  const {
    perfil,
    eAdministrador,
  } = useAuth();

  const [
    dataReferencia,
    setDataReferencia,
  ] = useState(new Date());

  const [horarios, setHorarios] =
    useState<Horario[]>([]);

  const [
    horariosAlunos,
    setHorariosAlunos,
  ] = useState<HorarioAluno[]>([]);

  const [sumarios, setSumarios] =
    useState<Sumario[]>([]);

  const [presencas, setPresencas] =
    useState<Presenca[]>([]);

  const [
    interrupcoes,
    setInterrupcoes,
  ] = useState<InterrupcaoLetiva[]>(
    [],
  );

  const [
    professores,
    setProfessores,
  ] = useState<Professor[]>([]);

  const [turmas, setTurmas] =
    useState<Turma[]>([]);

  const [
    disciplinas,
    setDisciplinas,
  ] = useState<Disciplina[]>([]);

  const [
    instrumentos,
    setInstrumentos,
  ] = useState<Instrumento[]>([]);

  const [
    professorFiltro,
    setProfessorFiltro,
  ] = useState("");

  const [
    aCarregar,
    setACarregar,
  ] = useState(true);

  const [
    aAtualizar,
    setAAtualizar,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const diasSemana = useMemo(
    () =>
      criarDiasDaSemana(
        dataReferencia,
      ),
    [dataReferencia],
  );

  const carregarCalendario =
    useCallback(
      async (
        mostrarAtualizacao = false,
      ) => {
        try {
          if (mostrarAtualizacao) {
            setAAtualizar(true);
          } else {
            setACarregar(true);
          }

          setErro("");

          const [
            dadosHorarios,
            dadosHorariosAlunos,
            dadosSumarios,
            dadosPresencas,
            dadosInterrupcoes,
            dadosProfessores,
            dadosTurmas,
            dadosDisciplinas,
            dadosInstrumentos,
          ] = await Promise.all([
            listarHorarios(),
            listarHorariosAlunos(),
            listarSumarios(),
            listarPresencas(),
            listarInterrupcoesLetivas(),
            listarProfessores(),
            listarTurmas(),
            listarDisciplinas(),
            listarInstrumentos(),
          ]);

          setHorarios(
            dadosHorarios,
          );

          setHorariosAlunos(
            dadosHorariosAlunos,
          );

          setSumarios(
            dadosSumarios,
          );

          setPresencas(
            dadosPresencas,
          );

          setInterrupcoes(
            dadosInterrupcoes,
          );

          setProfessores(
            dadosProfessores,
          );

          setTurmas(
            dadosTurmas,
          );

          setDisciplinas(
            dadosDisciplinas,
          );

          setInstrumentos(
            dadosInstrumentos,
          );
        } catch (error) {
          setErro(
            obterMensagemErro(
              error,
              "Não foi possível carregar o calendário.",
            ),
          );
        } finally {
          setACarregar(false);
          setAAtualizar(false);
        }
      },
      [],
    );

  useEffect(() => {
    carregarCalendario();
  }, [carregarCalendario]);

  const horariosPermitidos =
    useMemo(() => {
      if (eAdministrador) {
        if (!professorFiltro) {
          return horarios;
        }

        return horarios.filter(
          (horario) =>
            horario.professor_id ===
            professorFiltro,
        );
      }

      if (
        perfil?.perfil ===
          "Professor" &&
        perfil.professor_id
      ) {
        return horarios.filter(
          (horario) =>
            horario.professor_id ===
            perfil.professor_id,
        );
      }

      return [];
    }, [
      horarios,
      perfil,
      eAdministrador,
      professorFiltro,
    ]);

  function obterProfessor(
    id: string,
  ): string {
    return (
      professores.find(
        (professor) =>
          professor.id === id,
      )?.nome ?? "—"
    );
  }

  function obterTurma(
    id: string,
  ): string {
    return (
      turmas.find(
        (turma) =>
          turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDisciplina(
    id: string,
  ): string {
    return (
      disciplinas.find(
        (disciplina) =>
          disciplina.id === id,
      )?.nome ?? "—"
    );
  }

  function obterInstrumento(
    id: string | null,
  ): string {
    if (!id) {
      return "Sem instrumento específico";
    }

    return (
      instrumentos.find(
        (instrumento) =>
          instrumento.id === id,
      )?.nome ?? "—"
    );
  }

  function contarAlunos(
    horarioId: string,
  ): number {
    return horariosAlunos.filter(
      (registo) =>
        registo.horario_id ===
        horarioId,
    ).length;
  }

  function obterHorariosDoDia(
    dia: string,
  ): Horario[] {
    return horariosPermitidos
      .filter(
        (horario) =>
          horario.dia_semana === dia,
      )
      .sort((a, b) =>
        a.hora_inicio.localeCompare(
          b.hora_inicio,
        ),
      );
  }

  function obterDiaSemAulas(
    data: string,
  ): DiaSemAulas | null {
    const interrupcao =
      encontrarInterrupcaoNaData(
        interrupcoes,
        data,
      );

    if (interrupcao) {
      return converterInterrupcao(
        interrupcao,
      );
    }

    return null;
  }

  function obterFeriado(
    data: string,
  ): DiaSemAulas | null {
    const feriado =
      encontrarFeriadoPortugal(
        data,
      );

    if (!feriado) {
      return null;
    }

    return converterFeriado(
      feriado,
    );
  }

  function existeSumario(
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
    horarioId: string,
    data: string,
  ): boolean {
    const numeroAlunos =
      contarAlunos(horarioId);

    if (numeroAlunos === 0) {
      return true;
    }

    return presencas.some(
      (presenca) =>
        presenca.horario_id ===
          horarioId &&
        presenca.data === data,
    );
  }

  function obterEstadoTemporal(
    horario: Horario,
    data: string,
  ): EstadoTemporalAula {
    const agora = new Date();

    const inicio =
      criarDataHora(
        data,
        horario.hora_inicio,
      );

    const fim =
      criarDataHora(
        data,
        horario.hora_fim,
      );

    if (agora < inicio) {
      return "Futura";
    }

    if (agora <= fim) {
      return "Em curso";
    }

    return "Terminada";
  }

  function abrirSumario(
    horarioId: string,
    data: string,
  ) {
    const parametros =
      new URLSearchParams({
        horarioId,
        data,
      });

    navigate(
      `/sumarios?${parametros.toString()}`,
    );
  }

  function abrirPresencas(
    horarioId: string,
    data: string,
  ) {
    const parametros =
      new URLSearchParams({
        horarioId,
        data,
      });

    navigate(
      `/presencas?${parametros.toString()}`,
    );
  }

  function mudarSemana(
    numeroSemanas: number,
  ) {
    setDataReferencia(
      (dataAtual) => {
        const novaData =
          new Date(dataAtual);

        novaData.setDate(
          novaData.getDate() +
            numeroSemanas * 7,
        );

        return novaData;
      },
    );
  }

  function voltarSemanaAtual() {
    setDataReferencia(
      new Date(),
    );
  }

  const inicioSemana =
    diasSemana[0]
      ?.dataFormatada;

  const fimSemana =
    diasSemana[
      diasSemana.length - 1
    ]?.dataFormatada;

  const opcoesProfessores =
    professores.map(
      (professor) => ({
        value: professor.id,
        label: professor.nome,
      }),
    );

  return (
    <main className="page">
      <PageHeader
        title="Calendário"
        description={
          eAdministrador
            ? "Consulte as aulas e os respetivos registos."
            : "Consulte as suas aulas, sumários e presenças."
        }
      />

      <section className="calendar-toolbar">
        <div className="calendar-toolbar__period">
          <strong>Semana</strong>

          <span>
            {inicioSemana}
            {" — "}
            {fimSemana}
          </span>
        </div>

        {eAdministrador && (
          <div className="calendar-toolbar__filter">
            <SelectField
              id="calendario-professor"
              label="Professor"
              value={professorFiltro}
              options={
                opcoesProfessores
              }
              placeholder="Todos os professores"
              onChange={
                setProfessorFiltro
              }
            />
          </div>
        )}

        <div className="calendar-toolbar__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() =>
              mudarSemana(-1)
            }
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <button
            className="button button--primary"
            type="button"
            onClick={
              voltarSemanaAtual
            }
          >
            <CalendarCheck2
              size={18}
            />
            Semana atual
          </button>

          <button
            className="button button--secondary"
            type="button"
            onClick={() =>
              mudarSemana(1)
            }
          >
            Seguinte
            <ChevronRight size={18} />
          </button>

          <button
            className="button button--secondary"
            type="button"
            disabled={aAtualizar}
            onClick={() =>
              carregarCalendario(true)
            }
          >
            <RefreshCw size={18} />

            {aAtualizar
              ? "A atualizar..."
              : "Atualizar"}
          </button>
        </div>
      </section>

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      {aCarregar ? (
        <div className="panel">
          <p className="muted-text">
            A carregar calendário...
          </p>
        </div>
      ) : horariosPermitidos.length ===
          0 ? (
        <div className="panel calendar-no-schedule">
          <CalendarOff size={38} />

          <strong>
            Sem horários
          </strong>

          <p>
            {eAdministrador
              ? "Não existem horários para o filtro selecionado."
              : "Ainda não existem horários associados à sua conta."}
          </p>
        </div>
      ) : (
        <section className="weekly-calendar">
          {diasSemana.map(
            (dia) => {
              const horariosDoDia =
                obterHorariosDoDia(
                  dia.nome,
                );

              const diaSemAulas =
                obterDiaSemAulas(
                  dia.data,
                );

              const feriado =
                obterFeriado(
                  dia.data,
                );

              return (
                <article
                  className={[
                    "calendar-day",
                    diaSemAulas || feriado
                      ? "calendar-day--blocked"
                      : "",
                    dia.eHoje
                      ? "calendar-day--today"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={dia.data}
                >
                  <header className="calendar-day__header">
                    <div>
                      <h2>
                        {dia.nome}

                        {dia.eHoje && (
                          <small>
                            Hoje
                          </small>
                        )}
                      </h2>

                      <p>
                        {
                          dia.dataFormatada
                        }
                      </p>
                    </div>

                    <span>
                      {diaSemAulas
                        ? 0
                        : horariosDoDia.length}
                    </span>
                  </header>

                  <div className="calendar-day__content">
                    {diaSemAulas ? (
                      <div className="calendar-interruption">
                        <div className="calendar-interruption__icon">
                          <CalendarOff
                            size={24}
                          />
                        </div>

                        <span>
                          {
                            diaSemAulas.tipo
                          }
                        </span>

                        <strong>
                          {
                            diaSemAulas.titulo
                          }
                        </strong>

                        {diaSemAulas.observacoes && (
                          <p>
                            {
                              diaSemAulas.observacoes
                            }
                          </p>
                        )}

                        <small>
                          Sem aulas
                        </small>
                      </div>
                    ) : (
                      <>
                        {feriado && (
                          <div className="calendar-interruption">
                            <div className="calendar-interruption__icon">
                              <CalendarOff
                                size={24}
                              />
                            </div>

                            <span>
                              {
                                feriado.tipo
                              }
                            </span>

                            <strong>
                              {
                                feriado.titulo
                              }
                            </strong>
                          </div>
                        )}

                        {horariosDoDia.length === 0 ? (
                          <p className="calendar-day__empty">
                            Sem aulas.
                          </p>
                        ) : (
                          horariosDoDia.map(
                        (horario) => {
                          const sumarioPreenchido =
                            existeSumario(
                              horario.id,
                              dia.data,
                            );

                          const presencasRegistadas =
                            existemPresencas(
                              horario.id,
                              dia.data,
                            );

                          const estadoTemporal =
                            obterEstadoTemporal(
                              horario,
                              dia.data,
                            );

                          const tudoConcluido =
                            sumarioPreenchido &&
                            presencasRegistadas;

                          return (
                            <article
                              className={[
                                "calendar-class",
                                tudoConcluido
                                  ? "calendar-class--complete"
                                  : "calendar-class--pending",
                                estadoTemporal ===
                                "Futura"
                                  ? "calendar-class--future"
                                  : "",
                                estadoTemporal ===
                                "Em curso"
                                  ? "calendar-class--current"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              key={
                                horario.id
                              }
                            >
                              <header className="calendar-class__time">
                                <Clock size={17} />

                                <strong>
                                  {horario.hora_inicio.slice(
                                    0,
                                    5,
                                  )}
                                </strong>

                                <span>
                                  até{" "}
                                  {horario.hora_fim.slice(
                                    0,
                                    5,
                                  )}
                                </span>

                                <small
                                  className={`calendar-time-state calendar-time-state--${estadoTemporal
                                    .toLowerCase()
                                    .replaceAll(
                                      " ",
                                      "-",
                                    )}`}
                                >
                                  {
                                    estadoTemporal
                                  }
                                </small>
                              </header>

                              <div className="calendar-class__title">
                                {obterDisciplina(
                                  horario.disciplina_id,
                                )}
                              </div>

                              <div className="calendar-class__details">
                                {eAdministrador && (
                                  <span>
                                    <UserRound
                                      size={15}
                                    />

                                    {obterProfessor(
                                      horario.professor_id,
                                    )}
                                  </span>
                                )}

                                <span>
                                  <School
                                    size={15}
                                  />

                                  {obterTurma(
                                    horario.turma_id,
                                  )}
                                </span>

                                <span>
                                  <Music2
                                    size={15}
                                  />

                                  {obterInstrumento(
                                    horario.instrumento_id,
                                  )}
                                </span>

                                <span>
                                  <UsersRound
                                    size={15}
                                  />

                                  {contarAlunos(
                                    horario.id,
                                  )}
                                  {" "}
                                  aluno
                                  {contarAlunos(
                                    horario.id,
                                  ) === 1
                                    ? ""
                                    : "s"}
                                </span>
                              </div>

                              <div className="calendar-class__records">
                                <button
                                  type="button"
                                  className={
                                    sumarioPreenchido
                                      ? "calendar-record-button calendar-record-button--complete"
                                      : "calendar-record-button calendar-record-button--missing"
                                  }
                                  onClick={() =>
                                    abrirSumario(
                                      horario.id,
                                      dia.data,
                                    )
                                  }
                                >
                                  {sumarioPreenchido ? (
                                    <CheckCircle2
                                      size={16}
                                    />
                                  ) : (
                                    <FilePenLine
                                      size={16}
                                    />
                                  )}

                                  {sumarioPreenchido
                                    ? "Sumário concluído"
                                    : "Escrever sumário"}
                                </button>

                                <button
                                  type="button"
                                  className={
                                    presencasRegistadas
                                      ? "calendar-record-button calendar-record-button--complete"
                                      : "calendar-record-button calendar-record-button--missing"
                                  }
                                  onClick={() =>
                                    abrirPresencas(
                                      horario.id,
                                      dia.data,
                                    )
                                  }
                                >
                                  {presencasRegistadas ? (
                                    <CheckCircle2
                                      size={16}
                                    />
                                  ) : (
                                    <ClipboardCheck
                                      size={16}
                                    />
                                  )}

                                  {presencasRegistadas
                                    ? "Presenças registadas"
                                    : "Marcar presenças"}
                                </button>
                              </div>
                            </article>
                          );
                        },
                          )
                        )}
                      </>
                    )}
                  </div>
                </article>
              );
            },
          )}
        </section>
      )}
    </main>
  );
}

export default Calendario;