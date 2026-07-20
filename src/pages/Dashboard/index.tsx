import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileWarning,
  GraduationCap,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import PageHeader from "../../components/common/PageHeader";
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
import { useAuth } from "../../hooks/useAuth";
import { obterMensagemErro } from "../../utils/errors";
import "./Dashboard.css";

function formatarData(
  data: string,
): string {
  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const {
    perfil,
    eAdministrador,
  } = useAuth();

  const [dados, setDados] =
    useState<DadosDashboard | null>(null);

  const [professores, setProfessores] =
    useState<Professor[]>([]);

  const [turmas, setTurmas] =
    useState<Turma[]>([]);

  const [disciplinas, setDisciplinas] =
    useState<Disciplina[]>([]);

  const [aCarregar, setACarregar] =
    useState(true);

  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setErro("");

        const professorId =
          perfil?.perfil === "Professor"
            ? perfil.professor_id
            : null;

        const [
          dadosDashboard,
          dadosProfessores,
          dadosTurmas,
          dadosDisciplinas,
        ] = await Promise.all([
          obterDadosDashboard(professorId),
          listarProfessores(),
          listarTurmas(),
          listarDisciplinas(),
        ]);

        setDados(dadosDashboard);
        setProfessores(dadosProfessores);
        setTurmas(dadosTurmas);
        setDisciplinas(dadosDisciplinas);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar o Dashboard.",
          ),
        );
      } finally {
        setACarregar(false);
      }
    }

    carregarDashboard();
  }, [perfil]);

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
        (turma) => turma.id === id,
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
        horarioId: aula.horario.id,
        data: aula.data,
      });

    navigate(
      `/sumarios?${parametros.toString()}`,
    );
  }

  const aulasConcluidasHoje = useMemo(
    () =>
      dados?.aulasHoje.filter(
        (aula) =>
          aula.sumarioPreenchido,
      ).length ?? 0,
    [dados],
  );

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
      <PageHeader
        title={`Olá, ${nomeUtilizador}`}
        description={
          eAdministrador
            ? "Resumo geral da atividade da EMUSA."
            : "As suas aulas e tarefas de hoje."
        }
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section
        className={`missing-summary-banner ${
          dados?.sumariosEmFalta.length
            ? "missing-summary-banner--warning"
            : "missing-summary-banner--complete"
        }`}
      >
        <div className="missing-summary-banner__icon">
          {dados?.sumariosEmFalta.length ? (
            <FileWarning size={28} />
          ) : (
            <CheckCircle2 size={28} />
          )}
        </div>

        <div>
          <span>Sumários</span>

          <strong>
            {dados?.sumariosEmFalta.length
              ? `Falta registar ${
                  dados.sumariosEmFalta.length
                } sumário${
                  dados.sumariosEmFalta.length === 1
                    ? ""
                    : "s"
                }`
              : "Todos os sumários estão atualizados"}
          </strong>
        </div>

        {dados?.sumariosEmFalta.length ? (
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              const elemento =
                document.getElementById(
                  "sumarios-em-falta",
                );

              elemento?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Ver sumários
          </button>
        ) : null}
      </section>

      <section className="dashboard__grid">
        <article className="dashboard-card">
          <div className="dashboard-card__icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <span>Aulas de hoje</span>
            <strong>
              {dados?.aulasHoje.length ?? 0}
            </strong>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icon">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Concluídas hoje</span>
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
            <span>Alunos de hoje</span>
            <strong>
              {dados?.totalAlunosHoje ?? 0}
            </strong>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icon">
            <Clock3 size={24} />
          </div>

          <div>
            <span>Próxima aula</span>

            <strong className="dashboard-card__time">
              {dados?.proximaAula
                ? dados.proximaAula.horario
                    .hora_inicio
                    .slice(0, 5)
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      <section className="dashboard-sections">
        <article className="panel">
          <h2>Hoje</h2>

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
                    key={aula.horario.id}
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
                          aula.horario.turma_id,
                        )}
                        {" · "}
                        {aula.numeroAlunos} aluno
                        {aula.numeroAlunos === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <button
                      className={
                        aula.sumarioPreenchido
                          ? "lesson-status lesson-status--complete"
                          : "lesson-status lesson-status--missing"
                      }
                      type="button"
                      onClick={() =>
                        abrirSumario(aula)
                      }
                    >
                      {aula.sumarioPreenchido
                        ? "Sumário concluído"
                        : "Escrever sumário"}
                    </button>
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
                {dados.proximaAula.horario
                  .hora_inicio.slice(0, 5)}
              </span>

              <strong>
                {obterDisciplina(
                  dados.proximaAula.horario
                    .disciplina_id,
                )}
              </strong>

              <p>
                {obterProfessor(
                  dados.proximaAula.horario
                    .professor_id,
                )}
                {" · "}
                {obterTurma(
                  dados.proximaAula.horario
                    .turma_id,
                )}
              </p>

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
            </div>
          ) : (
            <p className="muted-text">
              Não existem mais aulas hoje.
            </p>
          )}
        </article>
      </section>

      <section
        className="panel missing-summaries"
        id="sumarios-em-falta"
      >
        <h2>
          <FileWarning size={21} />
          Sumários em falta
        </h2>

        {!dados?.sumariosEmFalta.length ? (
          <p className="muted-text">
            Não existem sumários por preencher.
          </p>
        ) : (
          <div className="missing-summaries__list">
            {dados.sumariosEmFalta.map(
              (aula) => (
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
                      {formatarData(aula.data)}
                      {" · "}
                      {aula.horario.hora_inicio.slice(
                        0,
                        5,
                      )}
                      {" · "}
                      {obterTurma(
                        aula.horario.turma_id,
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
                      abrirSumario(aula)
                    }
                  >
                    Escrever sumário
                  </button>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;