import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileSpreadsheet,
  FilterX,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  obterDadosDashboard,
  type AulaDashboard,
} from "../../services/dashboard.service";
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
import "./Relatorios.css";

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

function Relatorios() {
  const [
    sumariosEmFalta,
    setSumariosEmFalta,
  ] = useState<AulaDashboard[]>([]);

  const [sumarios, setSumarios] =
    useState<Sumario[]>([]);

  const [horarios, setHorarios] =
    useState<Horario[]>([]);

  const [
    horariosAlunos,
    setHorariosAlunos,
  ] = useState<HorarioAluno[]>([]);

  const [
    alunosTurmas,
    setAlunosTurmas,
  ] = useState<AlunoTurma[]>([]);

  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

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
    professorRelatorioId,
    setProfessorRelatorioId,
  ] = useState("");

  const [
    disciplinaFiltroId,
    setDisciplinaFiltroId,
  ] = useState("");

  const [
    alunoFiltroId,
    setAlunoFiltroId,
  ] = useState("");

  const [
    professorFaltasId,
    setProfessorFaltasId,
  ] = useState("");

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
        dadosDashboard,
        dadosSumarios,
        dadosHorarios,
        dadosHorariosAlunos,
        dadosAlunosTurmas,
        dadosAlunos,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
      ] = await Promise.all([
        obterDadosDashboard(null),
        listarSumarios(),
        listarHorarios(),
        listarHorariosAlunos(),
        listarAlunosTurmas(),
        listarAlunos(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
      ]);

      setSumariosEmFalta(
        dadosDashboard.sumariosEmFalta,
      );

      setSumarios(dadosSumarios);
      setHorarios(dadosHorarios);

      setHorariosAlunos(
        dadosHorariosAlunos,
      );

      setAlunosTurmas(
        dadosAlunosTurmas,
      );

      setAlunos(dadosAlunos);

      setProfessores(
        dadosProfessores,
      );

      setTurmas(dadosTurmas);

      setDisciplinas(
        dadosDisciplinas,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os relatórios.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function obterProfessorNome(
    id: string,
  ): string {
    return (
      professores.find(
        (professor) =>
          professor.id === id,
      )?.nome ?? "—"
    );
  }

  function obterTurmaNome(
    id: string,
  ): string {
    return (
      turmas.find(
        (turma) =>
          turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDisciplinaNome(
    id: string,
  ): string {
    return (
      disciplinas.find(
        (disciplina) =>
          disciplina.id === id,
      )?.nome ?? "—"
    );
  }

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

  function obterAlunosDoHorario(
    horario: Horario,
  ): Aluno[] {
    if (
      horario.tipo_aula === "Turma"
    ) {
      const ids = new Set(
        alunosTurmas
          .filter(
            (registo) =>
              registo.turma_id ===
              horario.turma_id,
          )
          .map(
            (registo) =>
              registo.aluno_id,
          ),
      );

      return alunos
        .filter((aluno) =>
          ids.has(aluno.id),
        )
        .sort((a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt",
          ),
        );
    }

    const ids = new Set(
      horariosAlunos
        .filter(
          (registo) =>
            registo.horario_id ===
            horario.id,
        )
        .map(
          (registo) =>
            registo.aluno_id,
        ),
    );

    return alunos
      .filter((aluno) =>
        ids.has(aluno.id),
      )
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt",
        ),
      );
  }

  const professorRelatorio =
    useMemo(
      () =>
        professores.find(
          (professor) =>
            professor.id ===
            professorRelatorioId,
        ) ?? null,
      [
        professores,
        professorRelatorioId,
      ],
    );

  const horariosDoProfessor =
    useMemo(
      () => {
        if (!professorRelatorioId) {
          return [];
        }

        return horarios.filter(
          (horario) =>
            horario.professor_id ===
            professorRelatorioId,
        );
      },
      [
        horarios,
        professorRelatorioId,
      ],
    );

  const opcoesDisciplinas =
    useMemo(() => {
      const ids = new Set(
        horariosDoProfessor.map(
          (horario) =>
            horario.disciplina_id,
        ),
      );

      return disciplinas
        .filter((disciplina) =>
          ids.has(disciplina.id),
        )
        .sort((a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt",
          ),
        );
    }, [
      horariosDoProfessor,
      disciplinas,
    ]);

  const alunosDoProfessor =
    useMemo(() => {
      const mapa = new Map<
        string,
        Aluno
      >();

      horariosDoProfessor.forEach(
        (horario) => {
          obterAlunosDoHorario(
            horario,
          ).forEach((aluno) => {
            mapa.set(
              aluno.id,
              aluno,
            );
          });
        },
      );

      return Array.from(
        mapa.values(),
      ).sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt",
        ),
      );
    }, [
      horariosDoProfessor,
      horariosAlunos,
      alunosTurmas,
      alunos,
    ]);

  useEffect(() => {
    setDisciplinaFiltroId("");
    setAlunoFiltroId("");
  }, [professorRelatorioId]);

  const horariosDoRelatorio =
    useMemo(() => {
      return horariosDoProfessor.filter(
        (horario) => {
          if (
            disciplinaFiltroId &&
            horario.disciplina_id !==
              disciplinaFiltroId
          ) {
            return false;
          }

          if (alunoFiltroId) {
            const participa =
              obterAlunosDoHorario(
                horario,
              ).some(
                (aluno) =>
                  aluno.id ===
                  alunoFiltroId,
              );

            if (!participa) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      horariosDoProfessor,
      disciplinaFiltroId,
      alunoFiltroId,
      horariosAlunos,
      alunosTurmas,
      alunos,
    ]);

  const horarioIdsDoRelatorio =
    useMemo(
      () =>
        new Set(
          horariosDoRelatorio.map(
            (horario) =>
              horario.id,
          ),
        ),
      [horariosDoRelatorio],
    );

  const sumariosDoRelatorio =
    useMemo(() => {
      if (!professorRelatorioId) {
        return [];
      }

      return sumarios
        .filter(
          (sumario) =>
            horarioIdsDoRelatorio.has(
              sumario.horario_id,
            ) &&
            sumario.data >=
              dataInicio &&
            sumario.data <=
              dataFim,
        )
        .sort((a, b) =>
          b.data.localeCompare(
            a.data,
          ),
        );
    }, [
      sumarios,
      horarioIdsDoRelatorio,
      professorRelatorioId,
      dataInicio,
      dataFim,
    ]);

  const sumariosPorDisciplina =
    useMemo(() => {
      const grupos = new Map<
        string,
        {
          disciplinaId: string;
          disciplinaNome: string;
          sumarios: Sumario[];
        }
      >();

      sumariosDoRelatorio.forEach(
        (sumario) => {
          const horario =
            obterHorario(
              sumario.horario_id,
            );

          if (!horario) {
            return;
          }

          const disciplinaId =
            horario.disciplina_id;

          const disciplinaNome =
            obterDisciplinaNome(
              disciplinaId,
            );

          if (
            !grupos.has(
              disciplinaId,
            )
          ) {
            grupos.set(
              disciplinaId,
              {
                disciplinaId,
                disciplinaNome,
                sumarios: [],
              },
            );
          }

          grupos.get(
            disciplinaId,
          )!.sumarios.push(
            sumario,
          );
        },
      );

      return Array.from(
        grupos.values(),
      )
        .map((grupo) => ({
          ...grupo,
          sumarios:
            [...grupo.sumarios].sort(
              (a, b) =>
                b.data.localeCompare(
                  a.data,
                ),
            ),
        }))
        .sort((a, b) =>
          a.disciplinaNome.localeCompare(
            b.disciplinaNome,
            "pt",
          ),
        );
    }, [
      sumariosDoRelatorio,
      horarios,
      disciplinas,
    ]);

  const totalDisciplinas =
    sumariosPorDisciplina.length;

  const totalAlunosRelatorio =
    useMemo(() => {
      const ids = new Set<string>();

      horariosDoRelatorio.forEach(
        (horario) => {
          obterAlunosDoHorario(
            horario,
          ).forEach((aluno) =>
            ids.add(aluno.id),
          );
        },
      );

      return ids.size;
    }, [
      horariosDoRelatorio,
      horariosAlunos,
      alunosTurmas,
      alunos,
    ]);

  const sumariosFaltaFiltrados =
    useMemo(() => {
      if (!professorFaltasId) {
        return sumariosEmFalta;
      }

      return sumariosEmFalta.filter(
        (aula) =>
          aula.horario.professor_id ===
          professorFaltasId,
      );
    }, [
      sumariosEmFalta,
      professorFaltasId,
    ]);

  const resumoProfessores =
    useMemo(() => {
      return professores
        .map((professor) => {
          const total =
            sumariosEmFalta.filter(
              (aula) =>
                aula.horario
                  .professor_id ===
                professor.id,
            ).length;

          return {
            professor,
            total,
          };
        })
        .filter(
          (item) =>
            item.total > 0,
        )
        .sort(
          (a, b) =>
            b.total - a.total,
        );
    }, [
      professores,
      sumariosEmFalta,
    ]);

  function limparFiltrosRelatorio() {
    setDisciplinaFiltroId("");
    setAlunoFiltroId("");
    setDataInicio(
      obterInicioAnoLetivo(),
    );
    setDataFim(
      obterDataHoje(),
    );
  }

  function imprimirRelatorio() {
    if (
      !professorRelatorioId
    ) {
      setErro(
        "Selecione um professor.",
      );
      return;
    }

    window.print();
  }

  const opcoesProfessores =
    professores
      .map((professor) => ({
        value: professor.id,
        label: professor.nome,
      }))
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          "pt",
        ),
      );

  return (
    <main className="page">
      <PageHeader
        title="Relatórios"
        description="Consultar o trabalho dos professores e controlar os sumários em falta."
      />

      {erro && (
        <div className="alert alert--error no-print">
          {erro}
        </div>
      )}

      <section className="panel no-print">
        <h2>
          Relatório por professor
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div className="form-field">
            <label htmlFor="relatorio-professor-principal">
              Professor
            </label>

            <select
              id="relatorio-professor-principal"
              value={
                professorRelatorioId
              }
              onChange={(event) =>
                setProfessorRelatorioId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Selecione um professor
              </option>

              {opcoesProfessores.map(
                (opcao) => (
                  <option
                    key={
                      opcao.value
                    }
                    value={
                      opcao.value
                    }
                  >
                    {opcao.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="relatorio-disciplina">
              Disciplina
            </label>

            <select
              id="relatorio-disciplina"
              value={
                disciplinaFiltroId
              }
              disabled={
                !professorRelatorioId
              }
              onChange={(event) =>
                setDisciplinaFiltroId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todas as disciplinas
              </option>

              {opcoesDisciplinas.map(
                (disciplina) => (
                  <option
                    key={
                      disciplina.id
                    }
                    value={
                      disciplina.id
                    }
                  >
                    {
                      disciplina.nome
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="relatorio-aluno-professor">
              Aluno
            </label>

            <select
              id="relatorio-aluno-professor"
              value={
                alunoFiltroId
              }
              disabled={
                !professorRelatorioId
              }
              onChange={(event) =>
                setAlunoFiltroId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todos os alunos
              </option>

              {alunosDoProfessor.map(
                (aluno) => (
                  <option
                    key={
                      aluno.id
                    }
                    value={
                      aluno.id
                    }
                  >
                    {aluno.nome}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="relatorio-data-inicio-professor">
              Data inicial
            </label>

            <input
              id="relatorio-data-inicio-professor"
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
            <label htmlFor="relatorio-data-fim-professor">
              Data final
            </label>

            <input
              id="relatorio-data-fim-professor"
              type="date"
              value={dataFim}
              onChange={(event) =>
                setDataFim(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent:
              "flex-end",
            marginTop: "14px",
          }}
        >
          <button
            className="button button--secondary"
            type="button"
            onClick={
              limparFiltrosRelatorio
            }
          >
            <FilterX size={18} />
            Limpar filtros
          </button>

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
            disabled={
              !professorRelatorioId ||
              sumariosDoRelatorio.length ===
                0
            }
            onClick={
              imprimirRelatorio
            }
          >
            <FileDown size={18} />
            Imprimir / Guardar PDF
          </button>
        </div>
      </section>

      {!professorRelatorioId ? (
        <section className="panel">
          <div
            style={{
              minHeight: "220px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              gap: "10px",
              textAlign: "center",
            }}
          >
            <UserRound
              size={42}
            />

            <strong>
              Selecione um professor
            </strong>

            <span className="muted-text">
              O relatório das aulas dadas aparecerá aqui.
            </span>
          </div>
        </section>
      ) : (
        <>
          <section
            className="panel"
            style={{
              marginBottom:
                "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="muted-text">
                  Professor
                </span>

                <h2
                  style={{
                    margin:
                      "4px 0 6px",
                  }}
                >
                  {
                    professorRelatorio?.nome
                  }
                </h2>

                <p
                  className="muted-text"
                  style={{
                    margin: 0,
                  }}
                >
                  {formatarData(
                    dataInicio,
                  )}{" "}
                  —{" "}
                  {formatarData(
                    dataFim,
                  )}
                </p>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                {disciplinaFiltroId && (
                  <div>
                    <strong>
                      Disciplina:{" "}
                    </strong>
                    {obterDisciplinaNome(
                      disciplinaFiltroId,
                    )}
                  </div>
                )}

                {alunoFiltroId && (
                  <div>
                    <strong>
                      Aluno:{" "}
                    </strong>
                    {
                      alunos.find(
                        (aluno) =>
                          aluno.id ===
                          alunoFiltroId,
                      )?.nome
                    }
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="reports-summary-grid">
            <article className="report-summary-card">
              <div>
                <ClipboardList
                  size={26}
                />
              </div>

              <span>
                Sumários
              </span>

              <strong>
                {
                  sumariosDoRelatorio.length
                }
              </strong>
            </article>

            <article className="report-summary-card">
              <div>
                <FileSpreadsheet
                  size={26}
                />
              </div>

              <span>
                Disciplinas
              </span>

              <strong>
                {
                  totalDisciplinas
                }
              </strong>
            </article>

            <article className="report-summary-card report-summary-card--complete">
              <div>
                <UsersRound
                  size={26}
                />
              </div>

              <span>
                Alunos abrangidos
              </span>

              <strong>
                {
                  totalAlunosRelatorio
                }
              </strong>
            </article>
          </section>

          <section
            className="panel"
            style={{
              marginTop: "16px",
            }}
          >
            <h2>
              Aulas dadas
            </h2>

            {sumariosDoRelatorio.length ===
            0 ? (
              <p className="muted-text">
                Não existem sumários com os filtros selecionados.
              </p>
            ) : (
              <div>
                {sumariosPorDisciplina.map(
                  (grupo) => (
                    <section
                      key={
                        grupo.disciplinaId
                      }
                      style={{
                        marginTop:
                          "18px",
                        marginBottom:
                          "26px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                          paddingBottom:
                            "10px",
                          marginBottom:
                            "8px",
                          borderBottom:
                            "1px solid var(--border, #dbe3ef)",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {
                            grupo.disciplinaNome
                          }
                        </h3>

                        <span className="muted-text">
                          {
                            grupo.sumarios.length
                          }{" "}
                          {grupo.sumarios.length ===
                          1
                            ? "sumário"
                            : "sumários"}
                        </span>
                      </div>

                      {grupo.sumarios.map(
                        (sumario) => {
                          const horario =
                            obterHorario(
                              sumario.horario_id,
                            );

                          if (
                            !horario
                          ) {
                            return null;
                          }

                          const participantes =
                            obterAlunosDoHorario(
                              horario,
                            );

                          const nomesParticipantes =
                            participantes
                              .map(
                                (aluno) =>
                                  aluno.nome,
                              )
                              .join(
                                ", ",
                              );

                          return (
                            <article
                              key={
                                sumario.id
                              }
                              style={{
                                padding:
                                  "12px 0",
                                borderBottom:
                                  "1px solid var(--border, #e8edf4)",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "120px minmax(0, 1fr)",
                                  gap: "16px",
                                }}
                              >
                                <div>
                                  <strong
                                    style={{
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <CalendarDays
                                      size={
                                        16
                                      }
                                    />
                                    {formatarData(
                                      sumario.data,
                                    )}
                                  </strong>
                                </div>

                                <div>
                                  <div
                                    className="muted-text"
                                    style={{
                                      marginBottom:
                                        "6px",
                                    }}
                                  >
                                    {obterTurmaNome(
                                      horario.turma_id,
                                    )}
                                    {" · "}
                                    {
                                      horario.tipo_aula
                                    }
                                    {nomesParticipantes
                                      ? ` · ${nomesParticipantes}`
                                      : ""}
                                  </div>

                                  <p
                                    style={{
                                      margin: 0,
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {
                                      sumario.conteudo
                                    }
                                  </p>
                                </div>
                              </div>
                            </article>
                          );
                        },
                      )}
                    </section>
                  ),
                )}
              </div>
            )}
          </section>
        </>
      )}

      <section
        className="no-print"
        style={{
          marginTop: "26px",
        }}
      >
        <div
          style={{
            marginBottom:
              "12px",
          }}
        >
          <h2
            style={{
              marginBottom:
                "4px",
            }}
          >
            Controlo de sumários em falta
          </h2>

          <p
            className="muted-text"
            style={{
              margin: 0,
            }}
          >
            Área administrativa para verificar aulas que ainda não têm sumário.
          </p>
        </div>

        <section className="reports-summary-grid">
          <article className="report-summary-card report-summary-card--warning">
            <div>
              <AlertTriangle
                size={26}
              />
            </div>

            <span>
              Sumários em falta
            </span>

            <strong>
              {
                sumariosEmFalta.length
              }
            </strong>
          </article>

          <article className="report-summary-card">
            <div>
              <FileSpreadsheet
                size={26}
              />
            </div>

            <span>
              Professores com faltas
            </span>

            <strong>
              {
                resumoProfessores.length
              }
            </strong>
          </article>

          <article className="report-summary-card report-summary-card--complete">
            <div>
              <CheckCircle2
                size={26}
              />
            </div>

            <span>
              Estado
            </span>

            <strong className="report-summary-card__text">
              {sumariosEmFalta.length ===
              0
                ? "Tudo atualizado"
                : "Regularização necessária"}
            </strong>
          </article>
        </section>

        <section className="panel reports-toolbar">
          <div className="form-field">
            <label htmlFor="relatorio-professor-faltas">
              Professor
            </label>

            <select
              id="relatorio-professor-faltas"
              value={
                professorFaltasId
              }
              onChange={(event) =>
                setProfessorFaltasId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Todos os professores
              </option>

              {opcoesProfessores.map(
                (opcao) => (
                  <option
                    key={
                      opcao.value
                    }
                    value={
                      opcao.value
                    }
                  >
                    {opcao.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="reports-toolbar__actions">
            <button
              className="button button--secondary"
              type="button"
              disabled={
                aCarregar
              }
              onClick={
                carregarDados
              }
            >
              <RefreshCw
                size={18}
              />
              Atualizar
            </button>
          </div>
        </section>

        <section className="reports-layout">
          <article className="panel">
            <h2>
              Sumários em falta
            </h2>

            {aCarregar ? (
              <p className="muted-text">
                A carregar relatório...
              </p>
            ) : sumariosFaltaFiltrados.length ===
              0 ? (
              <div className="reports-empty">
                <CheckCircle2
                  size={36}
                />

                <strong>
                  Não existem sumários em falta
                </strong>

                <p>
                  Todos os registos estão atualizados.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Data
                      </th>
                      <th>
                        Professor
                      </th>
                      <th>
                        Disciplina
                      </th>
                      <th>
                        Turma
                      </th>
                      <th>
                        Tipo
                      </th>
                      <th>
                        Hora
                      </th>
                      <th>
                        Alunos
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sumariosFaltaFiltrados.map(
                      (aula) => (
                        <tr
                          key={`${aula.horario.id}-${aula.data}`}
                        >
                          <td>
                            <strong>
                              {formatarData(
                                aula.data,
                              )}
                            </strong>
                          </td>

                          <td>
                            {obterProfessorNome(
                              aula.horario
                                .professor_id,
                            )}
                          </td>

                          <td>
                            {obterDisciplinaNome(
                              aula.horario
                                .disciplina_id,
                            )}
                          </td>

                          <td>
                            {obterTurmaNome(
                              aula.horario
                                .turma_id,
                            )}
                          </td>

                          <td>
                            <span className="report-type-badge">
                              {
                                aula.horario
                                  .tipo_aula
                              }
                            </span>
                          </td>

                          <td>
                            {aula.horario.hora_inicio.slice(
                              0,
                              5,
                            )}
                            {" – "}
                            {aula.horario.hora_fim.slice(
                              0,
                              5,
                            )}
                          </td>

                          <td>
                            {
                              aula.numeroAlunos
                            }
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="panel">
            <h2>
              Por professor
            </h2>

            {resumoProfessores.length ===
            0 ? (
              <p className="muted-text">
                Todos os professores têm os sumários atualizados.
              </p>
            ) : (
              <div className="teacher-report-list">
                {resumoProfessores.map(
                  ({
                    professor,
                    total,
                  }) => (
                    <button
                      className="teacher-report-row"
                      type="button"
                      key={
                        professor.id
                      }
                      onClick={() =>
                        setProfessorFaltasId(
                          professor.id,
                        )
                      }
                    >
                      <div>
                        <strong>
                          {
                            professor.nome
                          }
                        </strong>

                        <span>
                          Sumários por regularizar
                        </span>
                      </div>

                      <b>
                        {
                          total
                        }
                      </b>
                    </button>
                  ),
                )}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export default Relatorios;
