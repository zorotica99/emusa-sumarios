import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  listarHorarios,
  type Horario,
} from "../../services/horarios.service";
import {
  calcularTotaisPresencaAluno,
  listarPresencasDoAluno,
  type PresencaAlunoDetalhada,
} from "../../services/relatorioAluno.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./RelatorioAluno.css";

function formatarData(data: string): string {
  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function RelatorioAluno() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  const [alunoId, setAlunoId] = useState("");
  const [presencas, setPresencas] = useState<
    PresencaAlunoDetalhada[]
  >([]);

  const [aCarregarBase, setACarregarBase] = useState(true);
  const [aCarregarRelatorio, setACarregarRelatorio] =
    useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDadosBase() {
      try {
        setErro("");

        const [
          dadosAlunos,
          dadosHorarios,
          dadosTurmas,
          dadosDisciplinas,
        ] = await Promise.all([
          listarAlunos(),
          listarHorarios(),
          listarTurmas(),
          listarDisciplinas(),
        ]);

        setAlunos(dadosAlunos);
        setHorarios(dadosHorarios);
        setTurmas(dadosTurmas);
        setDisciplinas(dadosDisciplinas);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar os dados do relatório.",
          ),
        );
      } finally {
        setACarregarBase(false);
      }
    }

    carregarDadosBase();
  }, []);

  useEffect(() => {
    async function carregarRelatorio() {
      if (!alunoId) {
        setPresencas([]);
        return;
      }

      try {
        setACarregarRelatorio(true);
        setErro("");

        const dados = await listarPresencasDoAluno(alunoId);

        setPresencas(dados);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar o relatório do aluno.",
          ),
        );
      } finally {
        setACarregarRelatorio(false);
      }
    }

    carregarRelatorio();
  }, [alunoId]);

  const totais = useMemo(
    () => calcularTotaisPresencaAluno(presencas),
    [presencas],
  );

  const alunoSelecionado = alunos.find(
    (aluno) => aluno.id === alunoId,
  );

  function obterHorario(horarioId: string) {
    return horarios.find((horario) => horario.id === horarioId);
  }

  function obterTurmaNome(turmaId: string) {
    return turmas.find((turma) => turma.id === turmaId)?.nome ?? "—";
  }

  function obterDisciplinaNome(disciplinaId: string) {
    return (
      disciplinas.find(
        (disciplina) => disciplina.id === disciplinaId,
      )?.nome ?? "—"
    );
  }

  const opcoesAlunos = alunos.map((aluno) => ({
    value: aluno.id,
    label: aluno.nome,
  }));

  const cards = [
    {
      titulo: "Total de registos",
      valor: totais.total,
      icon: ClipboardList,
    },
    {
      titulo: "Presenças",
      valor: totais.presentes,
      icon: CheckCircle2,
    },
    {
      titulo: "Faltas",
      valor: totais.faltas,
      icon: UserX,
    },
    {
      titulo: "Faltas justificadas",
      valor: totais.faltasJustificadas,
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="page">
      <PageHeader
        title="Relatório por aluno"
        description="Consultar o histórico de presenças de cada aluno."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="panel student-report-filter">
        <SelectField
          id="relatorio-aluno"
          label="Aluno"
          value={alunoId}
          options={opcoesAlunos}
          placeholder={
            aCarregarBase
              ? "A carregar alunos..."
              : "Selecione um aluno"
          }
          disabled={aCarregarBase}
          onChange={setAlunoId}
        />
      </section>

      {!alunoId ? (
        <section className="panel student-report-empty">
          <p>Selecione um aluno para consultar o relatório.</p>
        </section>
      ) : (
        <>
          <section className="student-report-heading">
            <div>
              <h2>{alunoSelecionado?.nome ?? "Aluno"}</h2>
              <p>Resumo das presenças registadas.</p>
            </div>
          </section>

          <section className="student-report-cards">
            {cards.map(({ titulo, valor, icon: Icon }) => (
              <article className="student-report-card" key={titulo}>
                <div className="student-report-card__icon">
                  <Icon size={22} />
                </div>

                <span>{titulo}</span>

                <strong>
                  {aCarregarRelatorio ? "..." : valor}
                </strong>
              </article>
            ))}
          </section>

          <section className="panel student-report-history">
            <h2>Histórico</h2>

            {aCarregarRelatorio ? (
              <p className="muted-text">A carregar...</p>
            ) : presencas.length === 0 ? (
              <p className="muted-text">
                Este aluno ainda não tem presenças registadas.
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Turma</th>
                      <th>Disciplina</th>
                      <th>Estado</th>
                      <th>Observações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {presencas.map((presenca) => {
                      const horario = obterHorario(
                        presenca.horario_id,
                      );

                      return (
                        <tr key={presenca.id}>
                          <td>{formatarData(presenca.data)}</td>

                          <td>
                            {horario
                              ? obterTurmaNome(horario.turma_id)
                              : "—"}
                          </td>

                          <td>
                            {horario
                              ? obterDisciplinaNome(
                                  horario.disciplina_id,
                                )
                              : "—"}
                          </td>

                          <td>
                            <span
                              className={`attendance-status attendance-status--${presenca.estado
                                .toLowerCase()
                                .replaceAll(" ", "-")}`}
                            >
                              {presenca.estado}
                            </span>
                          </td>

                          <td>{presenca.observacoes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default RelatorioAluno;