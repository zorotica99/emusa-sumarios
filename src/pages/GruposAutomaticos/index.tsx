import {
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

interface AlunoClasseConjunto {
  aluno: Aluno;
  turmaPrincipal: Turma | null;
  instrumento: Instrumento | null;
  nivel: Nivel | null;
}

function GruposAutomaticos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  const [alunosTurmas, setAlunosTurmas] = useState<
    AlunoTurma[]
  >([]);

  const [perfis, setPerfis] = useState<
    AlunoPerfil[]
  >([]);

  const [instrumentos, setInstrumentos] = useState<
    Instrumento[]
  >([]);

  const [niveis, setNiveis] = useState<Nivel[]>([]);

  const [
    classeSelecionadaId,
    setClasseSelecionadaId,
  ] = useState("");

  const [pesquisa, setPesquisa] =
    useState("");

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

      const classes =
        dadosTurmas.filter(
          (turma) =>
            turma.tipo_turma === "Conjunto",
        );

      setClasseSelecionadaId(
        (classeAtual) => {
          const aindaExiste =
            classes.some(
              (classe) =>
                classe.id === classeAtual,
            );

          if (aindaExiste) {
            return classeAtual;
          }

          return classes[0]?.id ?? "";
        },
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar as classes de conjunto.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

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

  const turmasPrincipais = useMemo(
    () =>
      turmas.filter(
        (turma) =>
          turma.tipo_turma === "Principal",
      ),
    [turmas],
  );

  const classeSelecionada = useMemo(
    () =>
      classesConjunto.find(
        (classe) =>
          classe.id ===
          classeSelecionadaId,
      ) ?? null,
    [
      classesConjunto,
      classeSelecionadaId,
    ],
  );

  function obterPerfil(
    alunoId: string,
  ): AlunoPerfil | null {
    return (
      perfis.find(
        (perfil) =>
          perfil.aluno_id === alunoId,
      ) ?? null
    );
  }

  function obterTurmaPrincipal(
    alunoId: string,
  ): Turma | null {
    const idsTurmasDoAluno =
      alunosTurmas
        .filter(
          (registo) =>
            registo.aluno_id === alunoId,
        )
        .map(
          (registo) =>
            registo.turma_id,
        );

    return (
      turmasPrincipais.find(
        (turma) =>
          idsTurmasDoAluno.includes(
            turma.id,
          ),
      ) ?? null
    );
  }

  function obterInstrumento(
    alunoId: string,
  ): Instrumento | null {
    const perfil =
      obterPerfil(alunoId);

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

  function obterNivel(
    alunoId: string,
  ): Nivel | null {
    const perfil =
      obterPerfil(alunoId);

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

  const alunosDaClasse = useMemo<
    AlunoClasseConjunto[]
  >(() => {
    if (!classeSelecionada) {
      return [];
    }

    const alunoIds =
      alunosTurmas
        .filter(
          (registo) =>
            registo.turma_id ===
            classeSelecionada.id,
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
          obterTurmaPrincipal(
            aluno.id,
          ),
        instrumento:
          obterInstrumento(
            aluno.id,
          ),
        nivel:
          obterNivel(
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
    classeSelecionada,
    perfis,
    instrumentos,
    niveis,
    turmasPrincipais,
  ]);

  const alunosFiltrados = useMemo(
    () => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      if (!termo) {
        return alunosDaClasse;
      }

      return alunosDaClasse.filter(
        (item) =>
          [
            item.aluno.nome,
            item.turmaPrincipal?.nome ??
              "",
            item.instrumento?.nome ??
              "",
            item.nivel?.nome ?? "",
          ].some((valor) =>
            valor
              .toLowerCase()
              .includes(termo),
          ),
      );
    },
    [
      alunosDaClasse,
      pesquisa,
    ],
  );

  function contarAlunosDaClasse(
    classeId: string,
  ): number {
    return alunosTurmas.filter(
      (registo) =>
        registo.turma_id === classeId,
    ).length;
  }

  return (
    <main className="page">
      <PageHeader
        title="Grupos automáticos"
        description="Consultar automaticamente os alunos das classes de conjunto."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {classesConjunto.map(
            (classe) => {
              const selecionada =
                classe.id ===
                classeSelecionadaId;

              return (
                <button
                  key={classe.id}
                  type="button"
                  className={
                    selecionada
                      ? "button button--primary"
                      : "button button--secondary"
                  }
                  onClick={() => {
                    setClasseSelecionadaId(
                      classe.id,
                    );

                    setPesquisa("");
                  }}
                >
                  <UsersRound
                    size={18}
                  />

                  {classe.nome}

                  <span>
                    (
                    {contarAlunosDaClasse(
                      classe.id,
                    )}
                    )
                  </span>
                </button>
              );
            },
          )}
        </div>

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
            A carregar classes de
            conjunto...
          </p>
        </section>
      ) : classesConjunto.length ===
        0 ? (
        <section className="panel">
          <p className="muted-text">
            Ainda não existem classes
            de conjunto.
          </p>

          <p className="muted-text">
            Crie uma em Turmas,
            escolhendo o tipo
            "Classe de conjunto".
          </p>
        </section>
      ) : !classeSelecionada ? (
        <section className="panel">
          <p className="muted-text">
            Selecione uma classe de
            conjunto.
          </p>
        </section>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <article className="panel">
              <span className="muted-text">
                Classe de conjunto
              </span>

              <h2
                style={{
                  marginBottom: 0,
                }}
              >
                {classeSelecionada.nome}
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
                {alunosDaClasse.length}
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
                  classeSelecionada.ano_letivo
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
                alignItems: "flex-end",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    marginBottom: "4px",
                  }}
                >
                  Participantes
                </h2>

                <p
                  className="muted-text"
                  style={{
                    margin: 0,
                  }}
                >
                  Os alunos são
                  atualizados
                  automaticamente através
                  do perfil académico.
                </p>
              </div>

              <div
                className="form-field"
                style={{
                  marginBottom: 0,
                  minWidth: "260px",
                }}
              >
                <label htmlFor="pesquisa-participante">
                  Procurar aluno
                </label>

                <input
                  id="pesquisa-participante"
                  type="search"
                  value={pesquisa}
                  onChange={(event) =>
                    setPesquisa(
                      event.target.value,
                    )
                  }
                  placeholder="Nome, turma, instrumento ou nível..."
                />
              </div>
            </div>

            {alunosDaClasse.length ===
            0 ? (
              <p className="muted-text">
                Ainda não existem alunos
                nesta classe de conjunto.
              </p>
            ) : alunosFiltrados.length ===
              0 ? (
              <p className="muted-text">
                Não foram encontrados
                alunos com essa pesquisa.
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
                            item.aluno.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                item.aluno
                                  .nome
                              }
                            </strong>
                          </td>

                          <td>
                            {item
                              .turmaPrincipal
                              ?.nome ?? "—"}
                          </td>

                          <td>
                            {item
                              .instrumento
                              ?.nome ?? "—"}
                          </td>

                          <td>
                            {item.nivel
                              ?.nome ?? "—"}
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
    </main>
  );
}

export default GruposAutomaticos;