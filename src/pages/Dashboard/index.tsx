import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileWarning,
  GraduationCap,
  Plus,
  RefreshCw,
  School,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import {
  obterDadosDashboard,
  type AulaDashboard,
  type DadosDashboard,
} from "../../services/dashboard.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Dashboard.css";

function formatarData(
  data: string,
): string {
  const [ano, mes, dia] =
    data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const {
    perfil,
    eAdministrador,
  } = useAuth();

  const [dados, setDados] =
    useState<DadosDashboard | null>(
      null,
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

  const [aCarregar, setACarregar] =
    useState(true);

  const [
    aAtualizar,
    setAAtualizar,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const carregarDashboard =
    useCallback(
      async (
        mostrarCarregamento = false,
      ) => {
        try {
          if (mostrarCarregamento) {
            setAAtualizar(true);
          }

          setErro("");

          const professorId =
            perfil?.perfil ===
            "Professor"
              ? perfil.professor_id
              : null;

          const [
            dadosDashboard,
            dadosProfessores,
            dadosTurmas,
            dadosDisciplinas,
          ] = await Promise.all([
            obterDadosDashboard(
              professorId,
            ),

            listarProfessores(),

            listarTurmas(),

            listarDisciplinas(),
          ]);

          setDados(
            dadosDashboard,
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
        } catch (error) {
          setErro(
            obterMensagemErro(
              error,
              "Não foi possível carregar o Dashboard.",
            ),
          );
        } finally {
          setACarregar(false);
          setAAtualizar(false);
        }
      },
      [perfil],
    );

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

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

  function abrirSumario(
    aula: AulaDashboard,
  ) {
    const parametros =
      new URLSearchParams({
        horarioId:
          aula.horario.id,
        data: aula.data,
      });

    navigate(
      `/sumarios?${parametros.toString()}`,
    );
  }

  function abrirPresencas(
    aula: AulaDashboard,
  ) {
    const parametros =
      new URLSearchParams({
        horarioId:
          aula.horario.id,
        data: aula.data,
      });

    navigate(
      `/presencas?${parametros.toString()}`,
    );
  }

  const aulasConcluidasHoje =
    useMemo(
      () =>
        dados?.aulasHoje.filter(
          (aula) =>
            aula.sumarioPreenchido &&
            aula.presencasRegistadas,
        ).length ?? 0,
      [dados],
    );

  const tarefasEmFalta =
    (dados?.sumariosEmFalta
      .length ?? 0) +
    (dados?.presencasEmFalta
      .length ?? 0);

  const nomeUtilizador =
    perfil?.nome ??
    (eAdministrador
      ? "Administrador"
      : "Professor");

  if (aCarregar) {
    return (
      <main className="dashboard">
        <PageHeader
          title="Dashboard"
          description="A carregar informação..."
        />

        <div className="panel">
          <p className="muted-text">
            A carregar Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-welcome">
        <PageHeader
          title={`Olá, ${nomeUtilizador}`}
          description={
            eAdministrador
              ? "Resumo geral da atividade da EMUSA."
              : "As suas aulas e tarefas de hoje."
          }
        />

        <button
          className="button button--secondary dashboard-refresh"
          type="button"
          disabled={aAtualizar}
          onClick={() =>
            carregarDashboard(true)
          }
        >
          <RefreshCw size={18} />

          {aAtualizar
            ? "A atualizar..."
            : "Atualizar"}
        </button>
      </header>

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section
        className={`missing-summary-banner ${
          tarefasEmFalta > 0
            ? "missing-summary-banner--warning"
            : "missing-summary-banner--complete"
        }`}
      >
        <div className="missing-summary-banner__icon">
          {tarefasEmFalta > 0 ? (
            <FileWarning size={28} />
          ) : (
            <CheckCircle2 size={28} />
          )}
        </div>

        <div>
          <span>
            Estado dos registos
          </span>

          <strong>
            {tarefasEmFalta > 0
              ? `Existem ${tarefasEmFalta} tarefa${
                  tarefasEmFalta === 1
                    ? ""
                    : "s"
                } por concluir`
              : "Todos os registos estão atualizados"}
          </strong>

          {tarefasEmFalta > 0 && (
            <p>
              {
                dados?.sumariosEmFalta
                  .length
              }{" "}
              sumário
              {dados?.sumariosEmFalta
                .length === 1
                ? ""
                : "s"}
              {" · "}
              {
                dados?.presencasEmFalta
                  .length
              }{" "}
              registo
              {dados?.presencasEmFalta
                .length === 1
                ? ""
                : "s"}{" "}
              de presenças
            </p>
          )}
        </div>

        {tarefasEmFalta > 0 && (
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              document
                .getElementById(
                  "tarefas-em-falta",
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Ver tarefas
          </button>
        )}
      </section>

      <section className="dashboard__grid">
        <article className="dashboard-card">
          <div className="dashboard-card__icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <span>
              Aulas de hoje
            </span>

            <strong>
              {dados?.aulasHoje.length ??
                0}
            </strong>
          </div>
        </article>

        <article className="dashboard-card dashboard-card--success">
          <div className="dashboard-card__icon">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>
              Aulas concluídas
            </span>

            <strong>
              {aulasConcluidasHoje}
            </strong>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icon">
            <UsersRound size={24} />
          </div>

          <div>
            <span>
              Alunos de hoje
            </span>

            <strong>
              {dados?.totalAlunosHoje ??
                0}
            </strong>
          </div>
        </article>

        <article className="dashboard-card dashboard-card--time">
          <div className="dashboard-card__icon">
            <Clock3 size={24} />
          </div>

          <div>
            <span>
              Próxima aula
            </span>

            <strong className="dashboard-card__time">
              {dados?.proximaAula
                ? dados.proximaAula
                    .horario
                    .hora_inicio.slice(
                      0,
                      5,
                    )
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      {eAdministrador && (
        <section className="dashboard-admin-grid">
          <button
            type="button"
            onClick={() =>
              navigate("/alunos")
            }
          >
            <GraduationCap size={23} />

            <span>Alunos</span>

            <strong>
              {dados?.totalAlunosEscola ??
                0}
            </strong>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/professores",
              )
            }
          >
            <Users size={23} />

            <span>
              Professores
            </span>

            <strong>
              {dados?.totalProfessoresEscola ??
                0}
            </strong>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/horarios")
            }
          >
            <School size={23} />

            <span>Horários</span>

            <strong>
              {dados?.totalHorariosEscola ??
                0}
            </strong>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/presencas",
              )
            }
          >
            <UserCheck size={23} />

            <span>
              Presenças hoje
            </span>

            <strong>
              {dados?.totalPresencasHoje ??
                0}
            </strong>
          </button>
        </section>
      )}

      <section className="dashboard-quick-actions">
        <button
          type="button"
          onClick={() =>
            navigate("/sumarios")
          }
        >
          <Plus size={20} />

          <span>
            Registar sumário
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/presencas")
          }
        >
          <ClipboardCheck
            size={20}
          />

          <span>
            Marcar presenças
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/calendario")
          }
        >
          <CalendarDays size={20} />

          <span>
            Ver calendário
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/relatorio-aluno",
            )
          }
        >
          <GraduationCap
            size={20}
          />

          <span>
            Relatório do aluno
          </span>
        </button>
      </section>

      <section className="dashboard-sections">
        <article className="panel">
          <h2>
            <CalendarDays size={21} />
            Aulas de hoje
          </h2>

          {!dados?.aulasHoje.length ? (
            <p className="muted-text">
              Não existem aulas previstas para hoje.
            </p>
          ) : (
            <div className="today-lessons">
              {dados.aulasHoje.map(
                (aula) => (
                  <div
                    className="today-lesson"
                    key={
                      aula.horario.id
                    }
                  >
                    <div className="today-lesson__time">
                      <Clock3 size={19} />

                      <strong>
                        {aula.horario.hora_inicio.slice(
                          0,
                          5,
                        )}
                      </strong>

                      <span>
                        até{" "}
                        {aula.horario.hora_fim.slice(
                          0,
                          5,
                        )}
                      </span>
                    </div>

                    <div className="today-lesson__content">
                      <strong>
                        {obterDisciplina(
                          aula.horario
                            .disciplina_id,
                        )}
                      </strong>

                      <span>
                        {obterTurma(
                          aula.horario
                            .turma_id,
                        )}
                        {" · "}
                        {
                          aula.numeroAlunos
                        }{" "}
                        aluno
                        {aula.numeroAlunos ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <div className="today-lesson__actions">
                      <button
                        className={
                          aula.sumarioPreenchido
                            ? "lesson-status lesson-status--complete"
                            : "lesson-status lesson-status--missing"
                        }
                        type="button"
                        onClick={() =>
                          abrirSumario(
                            aula,
                          )
                        }
                      >
                        {aula.sumarioPreenchido
                          ? "Sumário ✓"
                          : "Sumário"}
                      </button>

                      <button
                        className={
                          aula.presencasRegistadas
                            ? "lesson-status lesson-status--complete"
                            : "lesson-status lesson-status--missing"
                        }
                        type="button"
                        onClick={() =>
                          abrirPresencas(
                            aula,
                          )
                        }
                      >
                        {aula.presencasRegistadas
                          ? "Presenças ✓"
                          : "Presenças"}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </article>

        <article className="panel">
          <h2>
            <GraduationCap size={21} />
            Próxima aula
          </h2>

          {dados?.proximaAula ? (
            <div className="next-lesson">
              <span>
                {dados.proximaAula
                  .horario
                  .hora_inicio.slice(
                    0,
                    5,
                  )}
              </span>

              <strong>
                {obterDisciplina(
                  dados.proximaAula
                    .horario
                    .disciplina_id,
                )}
              </strong>

              <p>
                {obterProfessor(
                  dados.proximaAula
                    .horario
                    .professor_id,
                )}
                {" · "}
                {obterTurma(
                  dados.proximaAula
                    .horario
                    .turma_id,
                )}
              </p>

              <div className="next-lesson__actions">
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() =>
                    abrirSumario(
                      dados.proximaAula!,
                    )
                  }
                >
                  Abrir sumário
                </button>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() =>
                    abrirPresencas(
                      dados.proximaAula!,
                    )
                  }
                >
                  Presenças
                </button>
              </div>
            </div>
          ) : (
            <p className="muted-text">
              Não existem mais aulas hoje.
            </p>
          )}
        </article>
      </section>

      <section
        className="dashboard-tasks-grid"
        id="tarefas-em-falta"
      >
        <article className="panel missing-summaries">
          <h2>
            <FileWarning size={21} />
            Sumários em falta
          </h2>

          {!dados?.sumariosEmFalta
            .length ? (
            <p className="muted-text">
              Não existem sumários por preencher.
            </p>
          ) : (
            <div className="missing-summaries__list">
              {dados.sumariosEmFalta
                .slice(0, 15)
                .map((aula) => (
                  <div
                    className="missing-summary-row"
                    key={`${aula.horario.id}-${aula.data}`}
                  >
                    <div>
                      <strong>
                        {obterDisciplina(
                          aula.horario
                            .disciplina_id,
                        )}
                      </strong>

                      <span>
                        {formatarData(
                          aula.data,
                        )}
                        {" · "}
                        {aula.horario.hora_inicio.slice(
                          0,
                          5,
                        )}
                        {" · "}
                        {obterTurma(
                          aula.horario
                            .turma_id,
                        )}

                        {eAdministrador && (
                          <>
                            {" · "}
                            {obterProfessor(
                              aula.horario
                                .professor_id,
                            )}
                          </>
                        )}
                      </span>
                    </div>

                    <button
                      className="button button--primary"
                      type="button"
                      onClick={() =>
                        abrirSumario(
                          aula,
                        )
                      }
                    >
                      Escrever
                    </button>
                  </div>
                ))}
            </div>
          )}
        </article>

        <article className="panel missing-attendances">
          <h2>
            <UserCheck size={21} />
            Presenças por marcar
          </h2>

          {!dados?.presencasEmFalta
            .length ? (
            <p className="muted-text">
              Não existem presenças por marcar.
            </p>
          ) : (
            <div className="missing-summaries__list">
              {dados.presencasEmFalta
                .slice(0, 15)
                .map((aula) => (
                  <div
                    className="missing-attendance-row"
                    key={`${aula.horario.id}-${aula.data}`}
                  >
                    <div>
                      <strong>
                        {obterDisciplina(
                          aula.horario
                            .disciplina_id,
                        )}
                      </strong>

                      <span>
                        {formatarData(
                          aula.data,
                        )}
                        {" · "}
                        {aula.horario.hora_inicio.slice(
                          0,
                          5,
                        )}
                        {" · "}
                        {
                          aula.numeroAlunos
                        }{" "}
                        aluno
                        {aula.numeroAlunos ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <button
                      className="button button--primary"
                      type="button"
                      onClick={() =>
                        abrirPresencas(
                          aula,
                        )
                      }
                    >
                      Marcar
                    </button>
                  </div>
                ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Dashboard;