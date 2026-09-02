import {
  GraduationCap,
  RefreshCw,
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
  listarAlunosPerfis,
  type AlunoPerfil,
} from "../../services/alunosPerfis.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../services/instrumentos.service";
import {
  listarNiveis,
  type Nivel,
} from "../../services/niveis.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";

interface AlunoGrupo {
  aluno: Aluno;
  turmaPrincipal: Turma | null;
  classeConjunto: Turma | null;
  instrumento: Instrumento | null;
  nivel: Nivel | null;
}

function GruposAutomaticos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunosTurmas, setAlunosTurmas] = useState<
    AlunoTurma[]
  >([]);
  const [perfis, setPerfis] = useState<AlunoPerfil[]>([]);
  const [instrumentos, setInstrumentos] = useState<
    Instrumento[]
  >([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);

  const [grupoSelecionadoId, setGrupoSelecionadoId] =
    useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosAlunos,
        dadosTurmas,
        dadosAlunosTurmas,
        dadosPerfis,
        dadosInstrumentos,
        dadosNiveis,
      ] = await Promise.all([
        listarAlunos(),
        listarTurmas(),
        listarAlunosTurmas(),
        listarAlunosPerfis(),
        listarInstrumentos(),
        listarNiveis(),
      ]);

      setAlunos(dadosAlunos);
      setTurmas(dadosTurmas);
      setAlunosTurmas(dadosAlunosTurmas);
      setPerfis(dadosPerfis);
      setInstrumentos(dadosInstrumentos);
      setNiveis(dadosNiveis);

      setGrupoSelecionadoId((grupoAtual) => {
        const aindaExiste = dadosTurmas.some(
          (turma) => turma.id === grupoAtual,
        );

        if (aindaExiste) {
          return grupoAtual;
        }

        const primeiraTurmaPrincipal =
          dadosTurmas.find(
            (turma) =>
              turma.tipo_turma === "Principal",
          );

        return (
          primeiraTurmaPrincipal?.id ??
          dadosTurmas[0]?.id ??
          ""
        );
      });
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar as turmas e grupos.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const turmasPrincipais = useMemo(
    () =>
      turmas
        .filter(
          (turma) =>
            turma.tipo_turma === "Principal",
        )
        .sort((a, b) =>
          a.nome.localeCompare(b.nome),
        ),
    [turmas],
  );

  const classesConjunto = useMemo(
    () =>
      turmas
        .filter(
          (turma) =>
            turma.tipo_turma === "Conjunto",
        )
        .sort((a, b) =>
          a.nome.localeCompare(b.nome),
        ),
    [turmas],
  );

  const grupoSelecionado = useMemo(
    () =>
      turmas.find(
        (turma) =>
          turma.id === grupoSelecionadoId,
      ) ?? null,
    [turmas, grupoSelecionadoId],
  );

  function obterIdsTurmasDoAluno(
    alunoId: string,
  ): string[] {
    return alunosTurmas
      .filter(
        (registo) =>
          registo.aluno_id === alunoId,
      )
      .map(
        (registo) =>
          registo.turma_id,
      );
  }

  function obterTurmaPrincipalDoAluno(
    alunoId: string,
  ): Turma | null {
    const ids =
      obterIdsTurmasDoAluno(alunoId);

    return (
      turmasPrincipais.find(
        (turma) =>
          ids.includes(turma.id),
      ) ?? null
    );
  }

  function obterClasseConjuntoDoAluno(
    alunoId: string,
  ): Turma | null {
    const ids =
      obterIdsTurmasDoAluno(alunoId);

    return (
      classesConjunto.find(
        (turma) =>
          ids.includes(turma.id),
      ) ?? null
    );
  }

  function obterPerfilDoAluno(
    alunoId: string,
  ): AlunoPerfil | null {
    return (
      perfis.find(
        (perfil) =>
          perfil.aluno_id === alunoId,
      ) ?? null
    );
  }

  function obterInstrumentoDoAluno(
    alunoId: string,
  ): Instrumento | null {
    const perfil =
      obterPerfilDoAluno(alunoId);

    if (!perfil?.instrumento_id) {
      return null;
    }

    return (
      instrumentos.find(
        (instrumento) =>
          instrumento.id ===
          perfil.instrumento_id,
      ) ?? null
    );
  }

  function obterNivelDoAluno(
    alunoId: string,
  ): Nivel | null {
    const perfil =
      obterPerfilDoAluno(alunoId);

    if (!perfil?.nivel_id) {
      return null;
    }

    return (
      niveis.find(
        (nivel) =>
          nivel.id === perfil.nivel_id,
      ) ?? null
    );
  }

  function contarAlunos(
    turmaId: string,
  ): number {
    return alunosTurmas.filter(
      (registo) =>
        registo.turma_id === turmaId,
    ).length;
  }

  const alunosDoGrupo = useMemo<
    AlunoGrupo[]
  >(() => {
    if (!grupoSelecionado) {
      return [];
    }

    const alunoIds =
      alunosTurmas
        .filter(
          (registo) =>
            registo.turma_id ===
            grupoSelecionado.id,
        )
        .map(
          (registo) =>
            registo.aluno_id,
        );

    return alunos
      .filter(
        (aluno) =>
          alunoIds.includes(aluno.id),
      )
      .map((aluno) => ({
        aluno,
        turmaPrincipal:
          obterTurmaPrincipalDoAluno(
            aluno.id,
          ),
        classeConjunto:
          obterClasseConjuntoDoAluno(
            aluno.id,
          ),
        instrumento:
          obterInstrumentoDoAluno(
            aluno.id,
          ),
        nivel:
          obterNivelDoAluno(
            aluno.id,
          ),
      }))
      .sort((a, b) =>
        a.aluno.nome.localeCompare(
          b.aluno.nome,
        ),
      );
  }, [
    alunos,
    alunosTurmas,
    grupoSelecionado,
    turmasPrincipais,
    classesConjunto,
    perfis,
    instrumentos,
    niveis,
  ]);

  const alunosFiltrados = useMemo(() => {
    const termo =
      pesquisa.trim().toLowerCase();

    if (!termo) {
      return alunosDoGrupo;
    }

    return alunosDoGrupo.filter(
      (item) =>
        [
          item.aluno.nome,
          item.turmaPrincipal?.nome ?? "",
          item.classeConjunto?.nome ?? "",
          item.instrumento?.nome ?? "",
          item.nivel?.nome ?? "",
        ].some((valor) =>
          valor
            .toLowerCase()
            .includes(termo),
        ),
    );
  }, [alunosDoGrupo, pesquisa]);

  function selecionarGrupo(
    turmaId: string,
  ) {
    setGrupoSelecionadoId(turmaId);
    setPesquisa("");
    setErro("");
  }

  return (
    <main className="page">
      <PageHeader
        title="Turmas e grupos"
        description="Consultar automaticamente os alunos das turmas e classes de conjunto."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "18px",
        }}
      >
        <button
          className="button button--secondary"
          type="button"
          onClick={carregarDados}
          disabled={aCarregar}
        >
          <RefreshCw size={18} />

          {aCarregar
            ? "A atualizar..."
            : "Atualizar"}
        </button>
      </section>

      {aCarregar ? (
        <section className="panel">
          <p className="muted-text">
            A carregar turmas e grupos...
          </p>
        </section>
      ) : turmas.length === 0 ? (
        <section className="panel">
          <p className="muted-text">
            Ainda não existem turmas.
          </p>
        </section>
      ) : (
        <>
          <section
            className="panel"
            style={{
              marginBottom: "18px",
            }}
          >
            <h2>
              <GraduationCap size={21} />
              Turmas principais
            </h2>

            {turmasPrincipais.length ===
            0 ? (
              <p className="muted-text">
                Ainda não existem turmas
                principais.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {turmasPrincipais.map(
                  (turma) => (
                    <button
                      key={turma.id}
                      type="button"
                      className={
                        grupoSelecionadoId ===
                        turma.id
                          ? "button button--primary"
                          : "button button--secondary"
                      }
                      onClick={() =>
                        selecionarGrupo(
                          turma.id,
                        )
                      }
                    >
                      <GraduationCap
                        size={18}
                      />

                      {turma.nome}

                      <span>
                        (
                        {contarAlunos(
                          turma.id,
                        )}
                        )
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </section>

          <section
            className="panel"
            style={{
              marginBottom: "18px",
            }}
          >
            <h2>
              <UsersRound size={21} />
              Classes de conjunto
            </h2>

            {classesConjunto.length ===
            0 ? (
              <p className="muted-text">
                Ainda não existem classes
                de conjunto.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {classesConjunto.map(
                  (classe) => (
                    <button
                      key={classe.id}
                      type="button"
                      className={
                        grupoSelecionadoId ===
                        classe.id
                          ? "button button--primary"
                          : "button button--secondary"
                      }
                      onClick={() =>
                        selecionarGrupo(
                          classe.id,
                        )
                      }
                    >
                      <UsersRound
                        size={18}
                      />

                      {classe.nome}

                      <span>
                        (
                        {contarAlunos(
                          classe.id,
                        )}
                        )
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </section>

          {grupoSelecionado && (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <article className="panel">
                  <span className="muted-text">
                    {grupoSelecionado.tipo_turma ===
                    "Principal"
                      ? "Turma principal"
                      : "Classe de conjunto"}
                  </span>

                  <h2
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    {grupoSelecionado.nome}
                  </h2>
                </article>

                <article className="panel">
                  <span className="muted-text">
                    Alunos
                  </span>

                  <h2
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    {alunosDoGrupo.length}
                  </h2>
                </article>

                <article className="panel">
                  <span className="muted-text">
                    Ano letivo
                  </span>

                  <h2
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    {
                      grupoSelecionado.ano_letivo
                    }
                  </h2>
                </article>
              </section>

              <section className="panel">
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-end",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        marginBottom:
                          "4px",
                      }}
                    >
                      Alunos
                    </h2>

                    <p
                      className="muted-text"
                      style={{
                        margin: 0,
                      }}
                    >
                      Esta lista é
                      atualizada
                      automaticamente
                      através do perfil
                      académico dos
                      alunos.
                    </p>
                  </div>

                  <div
                    className="form-field"
                    style={{
                      marginBottom: 0,
                      minWidth: "280px",
                    }}
                  >
                    <label htmlFor="pesquisa-grupo">
                      Procurar aluno
                    </label>

                    <input
                      id="pesquisa-grupo"
                      type="search"
                      value={pesquisa}
                      onChange={(event) =>
                        setPesquisa(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Nome, turma, classe, instrumento ou nível..."
                    />
                  </div>
                </div>

                {alunosDoGrupo.length ===
                0 ? (
                  <p className="muted-text">
                    Ainda não existem
                    alunos neste grupo.
                  </p>
                ) : alunosFiltrados.length ===
                  0 ? (
                  <p className="muted-text">
                    Não foram encontrados
                    alunos com essa
                    pesquisa.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>
                            Turma principal
                          </th>
                          <th>
                            Classe de conjunto
                          </th>
                          <th>
                            Instrumento
                          </th>
                          <th>Nível</th>
                        </tr>
                      </thead>

                      <tbody>
                        {alunosFiltrados.map(
                          (item) => (
                            <tr
                              key={
                                item.aluno
                                  .id
                              }
                            >
                              <td>
                                <strong>
                                  {
                                    item
                                      .aluno
                                      .nome
                                  }
                                </strong>
                              </td>

                              <td>
                                {item
                                  .turmaPrincipal
                                  ?.nome ??
                                  "—"}
                              </td>

                              <td>
                                {item
                                  .classeConjunto
                                  ?.nome ??
                                  "—"}
                              </td>

                              <td>
                                {item
                                  .instrumento
                                  ?.nome ??
                                  "—"}
                              </td>

                              <td>
                                {item
                                  .nivel
                                  ?.nome ??
                                  "—"}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default GruposAutomaticos;