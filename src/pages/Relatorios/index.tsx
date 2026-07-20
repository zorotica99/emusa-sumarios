import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  obterDadosDashboard,
  type AulaDashboard,
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
import "./Relatorios.css";

function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");

  if (!ano || !mes || !dia) {
    return dataIso;
  }

  return `${dia}/${mes}/${ano}`;
}

function escaparCsv(valor: string | number): string {
  const texto = String(valor ?? "");

  return `"${texto.replace(/"/g, '""')}"`;
}

function Relatorios() {
  const [sumariosEmFalta, setSumariosEmFalta] =
    useState<AulaDashboard[]>([]);

  const [professores, setProfessores] =
    useState<Professor[]>([]);

  const [turmas, setTurmas] =
    useState<Turma[]>([]);

  const [disciplinas, setDisciplinas] =
    useState<Disciplina[]>([]);

  const [professorFiltro, setProfessorFiltro] =
    useState("");

  const [aCarregar, setACarregar] =
    useState(true);

  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosDashboard,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
      ] = await Promise.all([
        obterDadosDashboard(null),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
      ]);

      setSumariosEmFalta(
        dadosDashboard.sumariosEmFalta,
      );

      setProfessores(dadosProfessores);
      setTurmas(dadosTurmas);
      setDisciplinas(dadosDisciplinas);
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

  function obterProfessorNome(id: string): string {
    return (
      professores.find(
        (professor) => professor.id === id,
      )?.nome ?? "—"
    );
  }

  function obterTurmaNome(id: string): string {
    return (
      turmas.find(
        (turma) => turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDisciplinaNome(id: string): string {
    return (
      disciplinas.find(
        (disciplina) => disciplina.id === id,
      )?.nome ?? "—"
    );
  }

  const sumariosFiltrados = useMemo(() => {
    if (!professorFiltro) {
      return sumariosEmFalta;
    }

    return sumariosEmFalta.filter(
      (aula) =>
        aula.horario.professor_id ===
        professorFiltro,
    );
  }, [
    sumariosEmFalta,
    professorFiltro,
  ]);

  const resumoProfessores = useMemo(() => {
    return professores
      .map((professor) => {
        const total = sumariosEmFalta.filter(
          (aula) =>
            aula.horario.professor_id ===
            professor.id,
        ).length;

        return {
          professor,
          total,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [
    professores,
    sumariosEmFalta,
  ]);

  function descarregarCsv() {
    const cabecalho = [
      "Data",
      "Professor",
      "Disciplina",
      "Turma",
      "Tipo de aula",
      "Hora de início",
      "Hora de fim",
      "Número de alunos",
    ];

    const linhas = sumariosFiltrados.map(
      (aula) => [
        formatarData(aula.data),
        obterProfessorNome(
          aula.horario.professor_id,
        ),
        obterDisciplinaNome(
          aula.horario.disciplina_id,
        ),
        obterTurmaNome(
          aula.horario.turma_id,
        ),
        aula.horario.tipo_aula,
        aula.horario.hora_inicio.slice(0, 5),
        aula.horario.hora_fim.slice(0, 5),
        aula.numeroAlunos,
      ],
    );

    const conteudoCsv = [
      cabecalho.map(escaparCsv).join(";"),
      ...linhas.map((linha) =>
        linha.map(escaparCsv).join(";"),
      ),
    ].join("\n");

    const blob = new Blob(
      [`\uFEFF${conteudoCsv}`],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const dataAtual = new Date()
      .toISOString()
      .slice(0, 10);

    link.href = url;
    link.download =
      `sumarios-em-falta-${dataAtual}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <PageHeader
        title="Relatórios"
        description="Consultar e exportar os sumários em falta."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section className="reports-summary-grid">
        <article className="report-summary-card report-summary-card--warning">
          <div>
            <AlertTriangle size={26} />
          </div>

          <span>Sumários em falta</span>

          <strong>
            {sumariosEmFalta.length}
          </strong>
        </article>

        <article className="report-summary-card">
          <div>
            <FileSpreadsheet size={26} />
          </div>

          <span>Professores com faltas</span>

          <strong>
            {resumoProfessores.length}
          </strong>
        </article>

        <article className="report-summary-card report-summary-card--complete">
          <div>
            <CheckCircle2 size={26} />
          </div>

          <span>Estado</span>

          <strong className="report-summary-card__text">
            {sumariosEmFalta.length === 0
              ? "Tudo atualizado"
              : "Regularização necessária"}
          </strong>
        </article>
      </section>

      <section className="panel reports-toolbar">
        <div className="form-field">
          <label htmlFor="relatorio-professor">
            Professor
          </label>

          <select
            id="relatorio-professor"
            value={professorFiltro}
            onChange={(event) =>
              setProfessorFiltro(
                event.target.value,
              )
            }
          >
            <option value="">
              Todos os professores
            </option>

            {professores.map((professor) => (
              <option
                key={professor.id}
                value={professor.id}
              >
                {professor.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="reports-toolbar__actions">
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
              sumariosFiltrados.length === 0
            }
            onClick={descarregarCsv}
          >
            <Download size={18} />

            Exportar CSV
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
          ) : sumariosFiltrados.length === 0 ? (
            <div className="reports-empty">
              <CheckCircle2 size={36} />

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
                    <th>Data</th>
                    <th>Professor</th>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Tipo</th>
                    <th>Hora</th>
                    <th>Alunos</th>
                  </tr>
                </thead>

                <tbody>
                  {sumariosFiltrados.map(
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
                            aula.horario.turma_id,
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
                          {aula.numeroAlunos}
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

          {resumoProfessores.length === 0 ? (
            <p className="muted-text">
              Todos os professores têm os
              sumários atualizados.
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
                    key={professor.id}
                    onClick={() =>
                      setProfessorFiltro(
                        professor.id,
                      )
                    }
                  >
                    <div>
                      <strong>
                        {professor.nome}
                      </strong>

                      <span>
                        Sumários por regularizar
                      </span>
                    </div>

                    <b>{total}</b>
                  </button>
                ),
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Relatorios;