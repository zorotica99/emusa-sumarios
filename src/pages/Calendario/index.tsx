import {
  CalendarOff,
  CheckCircle2,
  Clock,
  FilePenLine,
  Music2,
  School,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import PageHeader from "../../components/common/PageHeader";
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
  encontrarInterrupcaoNaData,
  listarInterrupcoesLetivas,
  type InterrupcaoLetiva,
} from "../../services/interrupcoesLetivas.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../services/instrumentos.service";
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
}

interface DiaSemAulas {
  titulo: string;
  tipo: string;
  observacoes: string | null;
}

const nomesDias = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
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
  const diaSemana = data.getDay();

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

  return nomesDias.map(
    (nome, indice) => {
      const data = new Date(
        segundaFeira,
      );

      data.setDate(
        segundaFeira.getDate() +
          indice,
      );

      return {
        nome,
        data: formatarDataISO(data),
        dataFormatada:
          formatarDataVisivel(data),
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

  const [sumarios, setSumarios] =
    useState<Sumario[]>([]);

  const [
    interrupcoes,
    setInterrupcoes,
  ] = useState<
    InterrupcaoLetiva[]
  >([]);

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
    aCarregar,
    setACarregar,
  ] = useState(true);

  const [erro, setErro] =
    useState("");

  const diasSemana = useMemo(
    () =>
      criarDiasDaSemana(
        dataReferencia,
      ),
    [dataReferencia],
  );

  useEffect(() => {
    async function carregarCalendario() {
      try {
        setACarregar(true);
        setErro("");

        const [
          dadosHorarios,
          dadosSumarios,
          dadosInterrupcoes,
          dadosProfessores,
          dadosTurmas,
          dadosDisciplinas,
          dadosInstrumentos,
        ] = await Promise.all([
          listarHorarios(),
          listarSumarios(),
          listarInterrupcoesLetivas(),
          listarProfessores(),
          listarTurmas(),
          listarDisciplinas(),
          listarInstrumentos(),
        ]);

        setHorarios(dadosHorarios);
        setSumarios(dadosSumarios);
        setInterrupcoes(
          dadosInterrupcoes,
        );
        setProfessores(
          dadosProfessores,
        );
        setTurmas(dadosTurmas);
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
      }
    }

    carregarCalendario();
  }, []);

  const horariosVisiveis =
    useMemo(() => {
      if (eAdministrador) {
        return horarios;
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
    ]);

  const horarioIdsVisiveis =
    useMemo(
      () =>
        new Set(
          horariosVisiveis.map(
            (horario) =>
              horario.id,
          ),
        ),
      [horariosVisiveis],
    );

  const sumariosVisiveis =
    useMemo(
      () =>
        sumarios.filter(
          (sumario) =>
            horarioIdsVisiveis.has(
              sumario.horario_id,
            ),
        ),
      [
        sumarios,
        horarioIdsVisiveis,
      ],
    );

  function obterProfessor(
    id: string,
  ): string {
    return (
      professores.find(
        (item) => item.id === id,
      )?.nome ?? "—"
    );
  }

  function obterTurma(
    id: string,
  ): string {
    return (
      turmas.find(
        (item) => item.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDisciplina(
    id: string,
  ): string {
    return (
      disciplinas.find(
        (item) => item.id === id,
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
        (item) => item.id === id,
      )?.nome ?? "—"
    );
  }

  function obterHorariosDoDia(
    dia: string,
  ): Horario[] {
    return horariosVisiveis
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

    const feriado =
      encontrarFeriadoPortugal(data);

    if (feriado) {
      return converterFeriado(
        feriado,
      );
    }

    return null;
  }

  function existeSumario(
    horarioId: string,
    data: string,
  ): boolean {
    return sumariosVisiveis.some(
      (sumario) =>
        sumario.horario_id ===
          horarioId &&
        sumario.data === data,
    );
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
    setDataReferencia(new Date());
  }

  const inicioSemana =
    diasSemana[0]
      ?.dataFormatada;

  const fimSemana =
    diasSemana[
      diasSemana.length - 1
    ]?.dataFormatada;

  return (
    <main className="page">
      <PageHeader
        title="Calendário"
        description={
          eAdministrador
            ? "Consulte todas as aulas, feriados, interrupções e sumários."
            : "Consulte as suas aulas e os sumários por preencher."
        }
      />

      <section className="calendar-toolbar">
        <div>
          <strong>
            Semana
          </strong>

          <span>
            {inicioSemana}
            {" — "}
            {fimSemana}
          </span>
        </div>

        <div className="calendar-toolbar__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() =>
              mudarSemana(-1)
            }
          >
            Semana anterior
          </button>

          <button
            className="button button--primary"
            type="button"
            onClick={
              voltarSemanaAtual
            }
          >
            Semana atual
          </button>

          <button
            className="button button--secondary"
            type="button"
            onClick={() =>
              mudarSemana(1)
            }
          >
            Semana seguinte
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
      ) : horariosVisiveis.length ===
          0 ? (
        <div className="panel">
          <p className="muted-text">
            {eAdministrador
              ? "Ainda não existem horários."
              : "Ainda não existem horários associados à sua conta."}
          </p>
        </div>
      ) : (
        <section className="weekly-calendar">
          {diasSemana.map((dia) => {
            const horariosDoDia =
              obterHorariosDoDia(
                dia.nome,
              );

            const diaSemAulas =
              obterDiaSemAulas(
                dia.data,
              );

            return (
              <article
                className={`calendar-day ${
                  diaSemAulas
                    ? "calendar-day--blocked"
                    : ""
                }`}
                key={dia.data}
              >
                <header className="calendar-day__header">
                  <div>
                    <h2>
                      {dia.nome}
                    </h2>

                    <p>
                      {dia.dataFormatada}
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
                        {diaSemAulas.tipo}
                      </span>

                      <strong>
                        {diaSemAulas.titulo}
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
                  ) : horariosDoDia.length ===
                    0 ? (
                    <p className="calendar-day__empty">
                      Sem aulas.
                    </p>
                  ) : (
                    horariosDoDia.map(
                      (horario) => {
                        const preenchido =
                          existeSumario(
                            horario.id,
                            dia.data,
                          );

                        return (
                          <button
                            className={`calendar-class ${
                              preenchido
                                ? "calendar-class--complete"
                                : "calendar-class--missing"
                            }`}
                            key={horario.id}
                            type="button"
                            onClick={() =>
                              abrirSumario(
                                horario.id,
                                dia.data,
                              )
                            }
                          >
                            <div className="calendar-class__time">
                              <Clock
                                size={17}
                              />

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
                            </div>

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
                            </div>

                            <div
                              className={`calendar-class__status ${
                                preenchido
                                  ? "calendar-class__status--complete"
                                  : "calendar-class__status--missing"
                              }`}
                            >
                              {preenchido ? (
                                <>
                                  <CheckCircle2
                                    size={16}
                                  />
                                  Sumário preenchido
                                </>
                              ) : (
                                <>
                                  <FilePenLine
                                    size={16}
                                  />
                                  Escrever sumário
                                </>
                              )}
                            </div>
                          </button>
                        );
                      },
                    )
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Calendario;