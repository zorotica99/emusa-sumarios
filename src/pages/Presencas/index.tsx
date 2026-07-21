import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Save,
  UserCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import { useAuth } from "../../hooks/useAuth";
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
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../services/horariosAlunos.service";
import {
  guardarPresencasEmLote,
  listarPresencas,
  listarPresencasDaAula,
  type EstadoPresenca,
  type Presenca,
} from "../../services/presencas.service";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Presencas.css";

interface PresencaAluno {
  alunoId: string;
  nome: string;
  estado: EstadoPresenca;
  observacoes: string;
  jaGuardada: boolean;
}

const opcoesEstado = [
  {
    value: "Presente",
    label: "Presente",
  },
  {
    value: "Falta",
    label: "Falta",
  },
  {
    value: "Falta justificada",
    label: "Falta justificada",
  },
];

function obterDataLocalHoje(): string {
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

function adicionarDias(
  dataIso: string,
  quantidade: number,
): string {
  const [ano, mes, dia] =
    dataIso.split("-").map(Number);

  const data = new Date(
    ano,
    mes - 1,
    dia,
  );

  data.setDate(
    data.getDate() + quantidade,
  );

  const novoAno =
    data.getFullYear();

  const novoMes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");

  const novoDia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${novoAno}-${novoMes}-${novoDia}`;
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

function Presencas() {
  const {
    perfil,
    eAdministrador,
  } = useAuth();

  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  const [horarios, setHorarios] =
    useState<Horario[]>([]);

  const [
    horariosAlunos,
    setHorariosAlunos,
  ] = useState<HorarioAluno[]>([]);

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
    todasPresencas,
    setTodasPresencas,
  ] = useState<Presenca[]>([]);

  const [
    presencasAlunos,
    setPresencasAlunos,
  ] = useState<PresencaAluno[]>([]);

  const [horarioId, setHorarioId] =
    useState("");

  const [dataAula, setDataAula] =
    useState(obterDataLocalHoje());

  const [aCarregar, setACarregar] =
    useState(true);

  const [
    aCarregarAula,
    setACarregarAula,
  ] = useState(false);

  const [aGuardar, setAGuardar] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function carregarDadosGerais() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosAlunos,
        dadosHorarios,
        dadosHorariosAlunos,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
        dadosPresencas,
      ] = await Promise.all([
        listarAlunos(),
        listarHorarios(),
        listarHorariosAlunos(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
        listarPresencas(),
      ]);

      setAlunos(dadosAlunos);
      setHorarios(dadosHorarios);
      setHorariosAlunos(
        dadosHorariosAlunos,
      );
      setProfessores(
        dadosProfessores,
      );
      setTurmas(dadosTurmas);
      setDisciplinas(
        dadosDisciplinas,
      );
      setTodasPresencas(
        dadosPresencas,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar as presenças.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDadosGerais();
  }, []);

  const horariosPermitidos =
    useMemo(() => {
      const listaOrdenada = [
        ...horarios,
      ].sort((a, b) => {
        const dia =
          a.dia_semana.localeCompare(
            b.dia_semana,
          );

        if (dia !== 0) {
          return dia;
        }

        return a.hora_inicio.localeCompare(
          b.hora_inicio,
        );
      });

      if (eAdministrador) {
        return listaOrdenada;
      }

      if (!perfil?.professor_id) {
        return [];
      }

      return listaOrdenada.filter(
        (horario) =>
          horario.professor_id ===
          perfil.professor_id,
      );
    }, [
      horarios,
      perfil,
      eAdministrador,
    ]);

  function obterNomeProfessor(
    id: string,
  ): string {
    return (
      professores.find(
        (professor) =>
          professor.id === id,
      )?.nome ?? "Professor"
    );
  }

  function obterNomeTurma(
    id: string,
  ): string {
    return (
      turmas.find(
        (turma) => turma.id === id,
      )?.nome ?? "Turma"
    );
  }

  function obterNomeDisciplina(
    id: string,
  ): string {
    return (
      disciplinas.find(
        (disciplina) =>
          disciplina.id === id,
      )?.nome ?? "Disciplina"
    );
  }

  function obterNomeAluno(
    id: string,
  ): string {
    return (
      alunos.find(
        (aluno) => aluno.id === id,
      )?.nome ?? "Aluno"
    );
  }

  function obterDescricaoHorario(
    horario: Horario,
  ): string {
    const professor =
      obterNomeProfessor(
        horario.professor_id,
      );

    const turma =
      obterNomeTurma(
        horario.turma_id,
      );

    const disciplina =
      obterNomeDisciplina(
        horario.disciplina_id,
      );

    const horaInicio =
      horario.hora_inicio.slice(0, 5);

    const horaFim =
      horario.hora_fim.slice(0, 5);

    return `${disciplina} — ${turma} — ${professor} — ${horario.dia_semana}, ${horaInicio}–${horaFim}`;
  }

  const horarioSelecionado =
    useMemo(
      () =>
        horariosPermitidos.find(
          (horario) =>
            horario.id === horarioId,
        ) ?? null,
      [
        horariosPermitidos,
        horarioId,
      ],
    );

  async function carregarPresencasDaAula() {
    if (!horarioId || !dataAula) {
      setPresencasAlunos([]);
      return;
    }

    try {
      setACarregarAula(true);
      setErro("");
      setSucesso("");

      const presencasExistentes =
        await listarPresencasDaAula(
          horarioId,
          dataAula,
        );

      const alunoIdsDoHorario =
        horariosAlunos
          .filter(
            (registo) =>
              registo.horario_id ===
              horarioId,
          )
          .map(
            (registo) =>
              registo.aluno_id,
          );

      const alunosDaAula =
        alunoIdsDoHorario
          .map((alunoId) =>
            alunos.find(
              (aluno) =>
                aluno.id === alunoId,
            ),
          )
          .filter(
            (
              aluno,
            ): aluno is Aluno =>
              Boolean(aluno),
          )
          .sort((a, b) =>
            a.nome.localeCompare(
              b.nome,
            ),
          );

      const novaLista =
        alunosDaAula.map((aluno) => {
          const presenca =
            presencasExistentes.find(
              (registo) =>
                registo.aluno_id ===
                aluno.id,
            );

          return {
            alunoId: aluno.id,
            nome: aluno.nome,
            estado:
              presenca?.estado ??
              "Presente",
            observacoes:
              presenca?.observacoes ??
              "",
            jaGuardada:
              Boolean(presenca),
          } satisfies PresencaAluno;
        });

      setPresencasAlunos(
        novaLista,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os alunos desta aula.",
        ),
      );

      setPresencasAlunos([]);
    } finally {
      setACarregarAula(false);
    }
  }

  useEffect(() => {
    carregarPresencasDaAula();
  }, [
    horarioId,
    dataAula,
    horariosAlunos,
    alunos,
  ]);

  function alterarEstado(
    alunoId: string,
    estado: EstadoPresenca,
  ) {
    setPresencasAlunos(
      (listaAtual) =>
        listaAtual.map((item) =>
          item.alunoId === alunoId
            ? {
                ...item,
                estado,
              }
            : item,
        ),
    );

    setErro("");
    setSucesso("");
  }

  function alterarObservacoes(
    alunoId: string,
    observacoes: string,
  ) {
    setPresencasAlunos(
      (listaAtual) =>
        listaAtual.map((item) =>
          item.alunoId === alunoId
            ? {
                ...item,
                observacoes,
              }
            : item,
        ),
    );

    setErro("");
    setSucesso("");
  }

  function marcarTodos(
    estado: EstadoPresenca,
  ) {
    setPresencasAlunos(
      (listaAtual) =>
        listaAtual.map((item) => ({
          ...item,
          estado,
        })),
    );

    setErro("");
    setSucesso("");
  }

  async function guardar(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!horarioId) {
      setErro(
        "Selecione uma aula.",
      );
      return;
    }

    if (!dataAula) {
      setErro(
        "Selecione a data da aula.",
      );
      return;
    }

    if (
      presencasAlunos.length === 0
    ) {
      setErro(
        "Esta aula não tem alunos associados.",
      );
      return;
    }

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      await guardarPresencasEmLote(
        horarioId,
        dataAula,
        presencasAlunos.map(
          (item) => ({
            alunoId: item.alunoId,
            estado: item.estado,
            observacoes:
              item.observacoes,
          }),
        ),
      );

      await Promise.all([
        carregarPresencasDaAula(),
        carregarDadosGerais(),
      ]);

      setSucesso(
        `${presencasAlunos.length} presença${
          presencasAlunos.length === 1
            ? ""
            : "s"
        } guardada${
          presencasAlunos.length === 1
            ? ""
            : "s"
        } com sucesso.`,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar as presenças.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  const resumo = useMemo(
    () => ({
      total: presencasAlunos.length,

      presentes:
        presencasAlunos.filter(
          (item) =>
            item.estado ===
            "Presente",
        ).length,

      faltas:
        presencasAlunos.filter(
          (item) =>
            item.estado ===
            "Falta",
        ).length,

      justificadas:
        presencasAlunos.filter(
          (item) =>
            item.estado ===
            "Falta justificada",
        ).length,
    }),
    [presencasAlunos],
  );

  const historicoVisivel =
    useMemo(() => {
      return todasPresencas
        .filter((presenca) => {
          if (
            horarioId &&
            presenca.horario_id !==
              horarioId
          ) {
            return false;
          }

          return horariosPermitidos.some(
            (horario) =>
              horario.id ===
              presenca.horario_id,
          );
        })
        .slice(0, 100);
    }, [
      todasPresencas,
      horarioId,
      horariosPermitidos,
    ]);

  const opcoesHorarios =
    horariosPermitidos.map(
      (horario) => ({
        value: horario.id,
        label:
          obterDescricaoHorario(
            horario,
          ),
      }),
    );

  return (
    <main className="page">
      <PageHeader
        title="Presenças"
        description="Marcar rapidamente a presença de todos os alunos da aula."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="alert alert--success">
          {sucesso}
        </div>
      )}

      <section className="attendance-toolbar panel">
        <div className="form-field">
          <label htmlFor="presenca-data">
            Data da aula
          </label>

          <div className="attendance-date-control">
            <button
              className="icon-button"
              type="button"
              title="Dia anterior"
              onClick={() =>
                setDataAula(
                  adicionarDias(
                    dataAula,
                    -1,
                  ),
                )
              }
            >
              <ChevronLeft size={18} />
            </button>

            <input
              id="presenca-data"
              type="date"
              value={dataAula}
              onChange={(event) => {
                setDataAula(
                  event.target.value,
                );

                setErro("");
                setSucesso("");
              }}
            />

            <button
              className="icon-button"
              type="button"
              title="Dia seguinte"
              onClick={() =>
                setDataAula(
                  adicionarDias(
                    dataAula,
                    1,
                  ),
                )
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <SelectField
          id="presenca-horario"
          label="Aula"
          value={horarioId}
          options={opcoesHorarios}
          placeholder={
            aCarregar
              ? "A carregar aulas..."
              : "Selecione uma aula"
          }
          onChange={(valor) => {
            setHorarioId(valor);
            setErro("");
            setSucesso("");
          }}
        />

        <button
          className="button button--secondary"
          type="button"
          disabled={
            aCarregarAula ||
            !horarioId
          }
          onClick={
            carregarPresencasDaAula
          }
        >
          <RefreshCw size={18} />

          Atualizar
        </button>
      </section>

      {horarioSelecionado && (
        <section className="attendance-lesson-header panel">
          <div className="attendance-lesson-header__icon">
            <Clock3 size={24} />
          </div>

          <div>
            <span>
              {formatarData(dataAula)}
            </span>

            <h2>
              {obterNomeDisciplina(
                horarioSelecionado.disciplina_id,
              )}
            </h2>

            <p>
              {obterNomeTurma(
                horarioSelecionado.turma_id,
              )}
              {" · "}
              {obterNomeProfessor(
                horarioSelecionado.professor_id,
              )}
              {" · "}
              {horarioSelecionado.hora_inicio.slice(
                0,
                5,
              )}
              {"–"}
              {horarioSelecionado.hora_fim.slice(
                0,
                5,
              )}
            </p>
          </div>
        </section>
      )}

      {horarioSelecionado && (
        <section className="attendance-summary-grid">
          <article>
            <UsersRound size={22} />

            <div>
              <span>Alunos</span>
              <strong>
                {resumo.total}
              </strong>
            </div>
          </article>

          <article className="attendance-summary-card--present">
            <UserCheck size={22} />

            <div>
              <span>Presentes</span>
              <strong>
                {resumo.presentes}
              </strong>
            </div>
          </article>

          <article className="attendance-summary-card--absent">
            <UserRoundX size={22} />

            <div>
              <span>Faltas</span>
              <strong>
                {resumo.faltas}
              </strong>
            </div>
          </article>

          <article className="attendance-summary-card--justified">
            <CheckCheck size={22} />

            <div>
              <span>Justificadas</span>
              <strong>
                {resumo.justificadas}
              </strong>
            </div>
          </article>
        </section>
      )}

      <section className="attendance-layout">
        <article className="panel">
          <header className="attendance-list-header">
            <div>
              <h2>
                Registo da aula
              </h2>

              <p>
                Todos começam como presentes.
                Altera apenas os casos necessários.
              </p>
            </div>

            {presencasAlunos.length >
              0 && (
              <div className="attendance-quick-actions">
                <button
                  type="button"
                  onClick={() =>
                    marcarTodos(
                      "Presente",
                    )
                  }
                >
                  <Check size={17} />
                  Todos presentes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    marcarTodos(
                      "Falta",
                    )
                  }
                >
                  <UserRoundX
                    size={17}
                  />
                  Todos em falta
                </button>
              </div>
            )}
          </header>

          {aCarregarAula ? (
            <p className="muted-text">
              A carregar alunos...
            </p>
          ) : !horarioId ? (
            <div className="attendance-empty">
              <UsersRound size={38} />

              <strong>
                Selecione uma aula
              </strong>

              <p>
                Os alunos associados ao horário
                aparecerão aqui.
              </p>
            </div>
          ) : presencasAlunos.length ===
            0 ? (
            <div className="attendance-empty">
              <UsersRound size={38} />

              <strong>
                Aula sem alunos
              </strong>

              <p>
                Associe alunos a este horário
                antes de marcar presenças.
              </p>
            </div>
          ) : (
            <form onSubmit={guardar}>
              <div className="attendance-students-list">
                {presencasAlunos.map(
                  (item) => (
                    <div
                      className={`attendance-student attendance-student--${item.estado
                        .toLowerCase()
                        .replaceAll(
                          " ",
                          "-",
                        )}`}
                      key={item.alunoId}
                    >
                      <div className="attendance-student__identity">
                        <div className="attendance-student__avatar">
                          {item.nome
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.nome}
                          </strong>

                          <span>
                            {item.jaGuardada
                              ? "Registo existente"
                              : "Novo registo"}
                          </span>
                        </div>
                      </div>

                      <div className="attendance-state-buttons">
                        {opcoesEstado.map(
                          (opcao) => (
                            <button
                              type="button"
                              key={opcao.value}
                              className={
                                item.estado ===
                                opcao.value
                                  ? "attendance-state-button attendance-state-button--active"
                                  : "attendance-state-button"
                              }
                              onClick={() =>
                                alterarEstado(
                                  item.alunoId,
                                  opcao.value as EstadoPresenca,
                                )
                              }
                            >
                              {opcao.label}
                            </button>
                          ),
                        )}
                      </div>

                      <input
                        className="attendance-observation"
                        type="text"
                        value={
                          item.observacoes
                        }
                        placeholder="Observação opcional..."
                        onChange={(event) =>
                          alterarObservacoes(
                            item.alunoId,
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  ),
                )}
              </div>

              <div className="attendance-save-bar">
                <div>
                  <strong>
                    {resumo.total} aluno
                    {resumo.total === 1
                      ? ""
                      : "s"}
                  </strong>

                  <span>
                    {resumo.presentes} presente
                    {resumo.presentes === 1
                      ? ""
                      : "s"}
                    {" · "}
                    {resumo.faltas} falta
                    {resumo.faltas === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <button
                  className="button button--primary"
                  type="submit"
                  disabled={aGuardar}
                >
                  <Save size={18} />

                  {aGuardar
                    ? "A guardar..."
                    : "Guardar presenças"}
                </button>
              </div>
            </form>
          )}
        </article>

        <article className="panel attendance-history">
          <h2>
            Registos recentes
          </h2>

          {historicoVisivel.length ===
          0 ? (
            <p className="muted-text">
              Ainda não existem registos.
            </p>
          ) : (
            <div className="attendance-history-list">
              {historicoVisivel.map(
                (presenca) => (
                  <div
                    className="attendance-history-row"
                    key={presenca.id}
                  >
                    <div>
                      <strong>
                        {obterNomeAluno(
                          presenca.aluno_id,
                        )}
                      </strong>

                      <span>
                        {formatarData(
                          presenca.data,
                        )}
                      </span>
                    </div>

                    <span
                      className={`attendance-history-state attendance-history-state--${presenca.estado
                        .toLowerCase()
                        .replaceAll(
                          " ",
                          "-",
                        )}`}
                    >
                      {presenca.estado}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Presencas;