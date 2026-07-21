import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileDown,
  GraduationCap,
  Guitar,
  Percent,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UserX,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarAlunosPerfis,
  type AlunoPerfil,
} from "../../services/alunosPerfis.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  listarHorarios,
  type Horario,
} from "../../services/horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../services/horariosAlunos.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../services/instrumentos.service";
import {
  listarNiveis,
  type Nivel,
} from "../../services/niveis.service";
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
import "./RelatorioAluno.css";

function obterDataHoje(): string {
  const data = new Date();

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterInicioAnoLetivo(): string {
  const data = new Date();

  const anoAtual = data.getFullYear();

  const mesAtual =
    data.getMonth() + 1;

  const anoInicio =
    mesAtual >= 9
      ? anoAtual
      : anoAtual - 1;

  return `${anoInicio}-09-01`;
}

function formatarData(
  dataIso: string,
): string {
  const [ano, mes, dia] =
    dataIso.split("-");

  if (!ano || !mes || !dia) {
    return dataIso;
  }

  return `${dia}/${mes}/${ano}`;
}

function RelatorioAluno() {
  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  const [
    alunosPerfis,
    setAlunosPerfis,
  ] = useState<AlunoPerfil[]>([]);

  const [
    alunosTurmas,
    setAlunosTurmas,
  ] = useState<AlunoTurma[]>([]);

  const [
    horariosAlunos,
    setHorariosAlunos,
  ] = useState<HorarioAluno[]>([]);

  const [horarios, setHorarios] =
    useState<Horario[]>([]);

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

  const [niveis, setNiveis] =
    useState<Nivel[]>([]);

  const [
    todasPresencas,
    setTodasPresencas,
  ] = useState<Presenca[]>([]);

  const [
    todosSumarios,
    setTodosSumarios,
  ] = useState<Sumario[]>([]);

  const [alunoId, setAlunoId] =
    useState("");

  const [dataInicio, setDataInicio] =
    useState(obterInicioAnoLetivo());

  const [dataFim, setDataFim] =
    useState(obterDataHoje());

  const [aCarregar, setACarregar] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosAlunos,
        dadosAlunosPerfis,
        dadosAlunosTurmas,
        dadosHorariosAlunos,
        dadosHorarios,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
        dadosInstrumentos,
        dadosNiveis,
        dadosPresencas,
        dadosSumarios,
      ] = await Promise.all([
        listarAlunos(),
        listarAlunosPerfis(),
        listarAlunosTurmas(),
        listarHorariosAlunos(),
        listarHorarios(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
        listarInstrumentos(),
        listarNiveis(),
        listarPresencas(),
        listarSumarios(),
      ]);

      setAlunos(dadosAlunos);

      setAlunosPerfis(
        dadosAlunosPerfis,
      );

      setAlunosTurmas(
        dadosAlunosTurmas,
      );

      setHorariosAlunos(
        dadosHorariosAlunos,
      );

      setHorarios(dadosHorarios);

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

      setNiveis(dadosNiveis);

      setTodasPresencas(
        dadosPresencas,
      );

      setTodosSumarios(
        dadosSumarios,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar o relatório do aluno.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const alunoSelecionado = useMemo(
    () =>
      alunos.find(
        (aluno) =>
          aluno.id === alunoId,
      ) ?? null,
    [
      alunos,
      alunoId,
    ],
  );

  const perfilAluno = useMemo(
    () =>
      alunosPerfis.find(
        (perfil) =>
          perfil.aluno_id === alunoId,
      ) ?? null,
    [
      alunosPerfis,
      alunoId,
    ],
  );

  const turmaAluno = useMemo(() => {
    const ligacao =
      alunosTurmas.find(
        (registo) =>
          registo.aluno_id === alunoId,
      );

    if (!ligacao) {
      return null;
    }

    return (
      turmas.find(
        (turma) =>
          turma.id ===
          ligacao.turma_id,
      ) ?? null
    );
  }, [
    alunosTurmas,
    turmas,
    alunoId,
  ]);

  const instrumentoAluno = useMemo(
    () =>
      instrumentos.find(
        (instrumento) =>
          instrumento.id ===
          perfilAluno?.instrumento_id,
      ) ?? null,
    [
      instrumentos,
      perfilAluno,
    ],
  );

  const nivelAluno = useMemo(
    () =>
      niveis.find(
        (nivel) =>
          nivel.id ===
          perfilAluno?.nivel_id,
      ) ?? null,
    [
      niveis,
      perfilAluno,
    ],
  );

  const horarioIdsDoAluno = useMemo(
    () =>
      new Set(
        horariosAlunos
          .filter(
            (registo) =>
              registo.aluno_id ===
              alunoId,
          )
          .map(
            (registo) =>
              registo.horario_id,
          ),
      ),
    [
      horariosAlunos,
      alunoId,
    ],
  );

  const horariosDoAluno = useMemo(
    () =>
      horarios.filter(
        (horario) =>
          horarioIdsDoAluno.has(
            horario.id,
          ),
      ),
    [
      horarios,
      horarioIdsDoAluno,
    ],
  );

  const professoresDoAluno =
    useMemo(() => {
      const ids = new Set(
        horariosDoAluno.map(
          (horario) =>
            horario.professor_id,
        ),
      );

      return professores
        .filter((professor) =>
          ids.has(professor.id),
        )
        .map(
          (professor) =>
            professor.nome,
        )
        .sort((a, b) =>
          a.localeCompare(b),
        );
    }, [
      horariosDoAluno,
      professores,
    ]);

  const presencasFiltradas =
    useMemo(() => {
      if (!alunoId) {
        return [];
      }

      return todasPresencas
        .filter(
          (presenca) =>
            presenca.aluno_id ===
              alunoId &&
            presenca.data >=
              dataInicio &&
            presenca.data <= dataFim,
        )
        .sort((a, b) =>
          b.data.localeCompare(
            a.data,
          ),
        );
    }, [
      todasPresencas,
      alunoId,
      dataInicio,
      dataFim,
    ]);

  const sumariosFiltrados =
    useMemo(() => {
      if (!alunoId) {
        return [];
      }

      return todosSumarios
        .filter(
          (sumario) =>
            horarioIdsDoAluno.has(
              sumario.horario_id,
            ) &&
            sumario.data >=
              dataInicio &&
            sumario.data <= dataFim,
        )
        .sort((a, b) =>
          b.data.localeCompare(
            a.data,
          ),
        );
    }, [
      todosSumarios,
      horarioIdsDoAluno,
      alunoId,
      dataInicio,
      dataFim,
    ]);

  const totais = useMemo(() => {
    const total =
      presencasFiltradas.length;

    const presentes =
      presencasFiltradas.filter(
        (presenca) =>
          presenca.estado ===
          "Presente",
      ).length;

    const faltas =
      presencasFiltradas.filter(
        (presenca) =>
          presenca.estado ===
          "Falta",
      ).length;

    const justificadas =
      presencasFiltradas.filter(
        (presenca) =>
          presenca.estado ===
          "Falta justificada",
      ).length;

    const assiduidade =
      total === 0
        ? 0
        : Math.round(
            (presentes / total) *
              100,
          );

    return {
      total,
      presentes,
      faltas,
      justificadas,
      assiduidade,
    };
  }, [presencasFiltradas]);

  function obterHorario(
    horarioId: string,
  ): Horario | null {
    return (
      horarios.find(
        (horario) =>
          horario.id === horarioId,
      ) ?? null
    );
  }

  function obterTurmaNome(
    turmaId: string,
  ): string {
    return (
      turmas.find(
        (turma) =>
          turma.id === turmaId,
      )?.nome ?? "—"
    );
  }

  function obterDisciplinaNome(
    disciplinaId: string,
  ): string {
    return (
      disciplinas.find(
        (disciplina) =>
          disciplina.id ===
          disciplinaId,
      )?.nome ?? "—"
    );
  }

  function obterProfessorNome(
    professorId: string,
  ): string {
    return (
      professores.find(
        (professor) =>
          professor.id ===
          professorId,
      )?.nome ?? "—"
    );
  }

  function imprimirRelatorio() {
    window.print();
  }

  const opcoesAlunos = alunos.map(
    (aluno) => ({
      value: aluno.id,
      label: aluno.nome,
    }),
  );

  const cards = [
    {
      titulo: "Total de aulas",
      valor: totais.total,
      icon: ClipboardList,
      classe: "",
    },
    {
      titulo: "Presenças",
      valor: totais.presentes,
      icon: CheckCircle2,
      classe:
        "student-report-card--present",
    },
    {
      titulo: "Faltas",
      valor: totais.faltas,
      icon: UserX,
      classe:
        "student-report-card--absent",
    },
    {
      titulo: "Justificadas",
      valor: totais.justificadas,
      icon: ShieldCheck,
      classe:
        "student-report-card--justified",
    },
    {
      titulo: "Assiduidade",
      valor: `${totais.assiduidade}%`,
      icon: Percent,
      classe:
        "student-report-card--percentage",
    },
  ];

  return (
    <main className="page student-report-page">
      <PageHeader
        title="Relatório por aluno"
        description="Consultar dados, assiduidade, presenças e sumários do aluno."
      />

      {erro && (
        <div className="alert alert--error no-print">
          {erro}
        </div>
      )}

      <section className="panel student-report-filter no-print">
        <SelectField
          id="relatorio-aluno"
          label="Aluno"
          value={alunoId}
          options={opcoesAlunos}
          placeholder={
            aCarregar
              ? "A carregar alunos..."
              : "Selecione um aluno"
          }
          disabled={aCarregar}
          onChange={setAlunoId}
        />

        <div className="form-field">
          <label htmlFor="relatorio-data-inicio">
            Data inicial
          </label>

          <input
            id="relatorio-data-inicio"
            type="date"
            value={dataInicio}
            onChange={(event) =>
              setDataInicio(
                event.target.value,
              )
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="relatorio-data-fim">
            Data final
          </label>

          <input
            id="relatorio-data-fim"
            type="date"
            value={dataFim}
            onChange={(event) =>
              setDataFim(
                event.target.value,
              )
            }
          />
        </div>

        <button
          className="button button--secondary"
          type="button"
          disabled={aCarregar}
          onClick={carregarDados}
        >
          <RefreshCw size={18} />
          Atualizar
        </button>

        <button
          className="button button--primary"
          type="button"
          disabled={!alunoId}
          onClick={imprimirRelatorio}
        >
          <FileDown size={18} />
          Imprimir / Guardar PDF
        </button>
      </section>

      {!alunoId ? (
        <section className="panel student-report-empty">
          <UserRound size={42} />

          <strong>
            Selecione um aluno
          </strong>

          <p>
            O relatório completo aparecerá aqui.
          </p>
        </section>
      ) : (
        <>
          <section className="student-report-print-header">
            <div className="student-report-print-logo">
              EMUSA
            </div>

            <div>
              <strong>
                Relatório individual do aluno
              </strong>

              <span>
                {formatarData(dataInicio)}
                {" — "}
                {formatarData(dataFim)}
              </span>
            </div>
          </section>

          <section className="panel student-report-profile">
            <div className="student-report-profile__avatar">
              {alunoSelecionado?.nome
                .trim()
                .charAt(0)
                .toUpperCase() ?? "A"}
            </div>

            <div className="student-report-profile__heading">
              <span>Aluno</span>

              <h2>
                {alunoSelecionado?.nome ??
                  "Aluno"}
              </h2>

              <p>
                Relatório entre{" "}
                {formatarData(dataInicio)}
                {" e "}
                {formatarData(dataFim)}
              </p>
            </div>

            <div className="student-report-profile__details">
              <div>
                <Guitar size={18} />

                <span>Instrumento</span>

                <strong>
                  {instrumentoAluno?.nome ??
                    "Não definido"}
                </strong>
              </div>

              <div>
                <GraduationCap
                  size={18}
                />

                <span>Nível</span>

                <strong>
                  {nivelAluno?.nome ??
                    "Não definido"}
                </strong>
              </div>

              <div>
                <UsersRound size={18} />

                <span>Turma</span>

                <strong>
                  {turmaAluno?.nome ??
                    "Não definida"}
                </strong>
              </div>

              <div>
                <UserRound size={18} />

                <span>
                  Professor(es)
                </span>

                <strong>
                  {professoresDoAluno.length >
                  0
                    ? professoresDoAluno.join(
                        ", ",
                      )
                    : "Não definido"}
                </strong>
              </div>
            </div>
          </section>

          <section className="student-report-cards">
            {cards.map(
              ({
                titulo,
                valor,
                icon: Icon,
                classe,
              }) => (
                <article
                  className={`student-report-card ${classe}`}
                  key={titulo}
                >
                  <div className="student-report-card__icon">
                    <Icon size={22} />
                  </div>

                  <span>{titulo}</span>

                  <strong>
                    {aCarregar
                      ? "..."
                      : valor}
                  </strong>
                </article>
              ),
            )}
          </section>

          <section className="student-report-content">
            <article className="panel student-report-section">
              <header>
                <div>
                  <h2>
                    <ClipboardList
                      size={21}
                    />
                    Histórico de sumários
                  </h2>

                  <p>
                    {sumariosFiltrados.length}
                    {" "}
                    registo
                    {sumariosFiltrados.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </header>

              {sumariosFiltrados.length ===
              0 ? (
                <p className="muted-text">
                  Não existem sumários neste período.
                </p>
              ) : (
                <div className="student-summary-list">
                  {sumariosFiltrados.map(
                    (sumario) => {
                      const horario =
                        obterHorario(
                          sumario.horario_id,
                        );

                      return (
                        <article
                          className="student-summary-entry"
                          key={sumario.id}
                        >
                          <div className="student-summary-entry__date">
                            <CalendarDays
                              size={18}
                            />

                            <strong>
                              {formatarData(
                                sumario.data,
                              )}
                            </strong>
                          </div>

                          <div className="student-summary-entry__content">
                            <div>
                              <strong>
                                {horario
                                  ? obterDisciplinaNome(
                                      horario.disciplina_id,
                                    )
                                  : "Disciplina"}
                              </strong>

                              <span>
                                {horario
                                  ? `${obterProfessorNome(
                                      horario.professor_id,
                                    )} · ${obterTurmaNome(
                                      horario.turma_id,
                                    )}`
                                  : "—"}
                              </span>
                            </div>

                            <p>
                              {sumario.conteudo}
                            </p>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </article>

            <article className="panel student-report-section">
              <header>
                <div>
                  <h2>
                    <CheckCircle2
                      size={21}
                    />
                    Histórico de presenças
                  </h2>

                  <p>
                    {presencasFiltradas.length}
                    {" "}
                    registo
                    {presencasFiltradas.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </header>

              {presencasFiltradas.length ===
              0 ? (
                <p className="muted-text">
                  Não existem presenças neste período.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Disciplina</th>
                        <th>Professor</th>
                        <th>Estado</th>
                        <th>Observações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {presencasFiltradas.map(
                        (presenca) => {
                          const horario =
                            obterHorario(
                              presenca.horario_id,
                            );

                          return (
                            <tr
                              key={presenca.id}
                            >
                              <td>
                                {formatarData(
                                  presenca.data,
                                )}
                              </td>

                              <td>
                                {horario
                                  ? obterDisciplinaNome(
                                      horario.disciplina_id,
                                    )
                                  : "—"}
                              </td>

                              <td>
                                {horario
                                  ? obterProfessorNome(
                                      horario.professor_id,
                                    )
                                  : "—"}
                              </td>

                              <td>
                                <span
                                  className={`attendance-status attendance-status--${presenca.estado
                                    .toLowerCase()
                                    .replaceAll(
                                      " ",
                                      "-",
                                    )}`}
                                >
                                  {
                                    presenca.estado
                                  }
                                </span>
                              </td>

                              <td>
                                {presenca.observacoes ||
                                  "—"}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default RelatorioAluno;