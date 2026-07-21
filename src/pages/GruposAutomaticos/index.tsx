import {
  Check,
  RefreshCw,
  Save,
  Settings2,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  atualizarGrupoAutomatico,
  definirExcecaoGrupo,
  listarGruposAutomaticos,
  obterAlunosDoGrupoAutomatico,
  type AlunoGrupoAutomatico,
  type GrupoAutomatico,
  type TipoExcecaoGrupo,
} from "../../services/gruposAutomaticos.service";
import { obterMensagemErro } from "../../utils/errors";
import "./GruposAutomaticos.css";

function GruposAutomaticos() {
  const [grupos, setGrupos] = useState<
    GrupoAutomatico[]
  >([]);

  const [
    grupoSelecionadoId,
    setGrupoSelecionadoId,
  ] = useState("");

  const [alunos, setAlunos] = useState<
    AlunoGrupoAutomatico[]
  >([]);

  const [nivelMinimo, setNivelMinimo] =
    useState(0);

  const [nivelMaximo, setNivelMaximo] =
    useState(8);

  const [ativo, setAtivo] =
    useState(true);

  const [pesquisa, setPesquisa] =
    useState("");

  const [aCarregar, setACarregar] =
    useState(true);

  const [aGuardar, setAGuardar] =
    useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] =
    useState("");

  const grupoSelecionado = useMemo(
    () =>
      grupos.find(
        (grupo) =>
          grupo.id === grupoSelecionadoId,
      ) ?? null,
    [
      grupos,
      grupoSelecionadoId,
    ],
  );

  async function carregarGrupos() {
    try {
      setACarregar(true);
      setErro("");

      const dados =
        await listarGruposAutomaticos();

      setGrupos(dados);

      if (
        dados.length > 0 &&
        !grupoSelecionadoId
      ) {
        setGrupoSelecionadoId(
          dados[0].id,
        );
      }
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os grupos automáticos.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  async function carregarAlunos(
    grupo: GrupoAutomatico,
  ) {
    try {
      setACarregar(true);
      setErro("");

      const dados =
        await obterAlunosDoGrupoAutomatico(
          grupo,
        );

      setAlunos(dados);
      setNivelMinimo(
        grupo.nivel_minimo_ordem,
      );
      setNivelMaximo(
        grupo.nivel_maximo_ordem,
      );
      setAtivo(grupo.ativo);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os participantes.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (grupoSelecionado) {
      carregarAlunos(
        grupoSelecionado,
      );
    }
  }, [grupoSelecionado]);

  async function guardarConfiguracao() {
    if (!grupoSelecionado) {
      return;
    }

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      await atualizarGrupoAutomatico(
        grupoSelecionado.id,
        {
          nivelMinimoOrdem:
            nivelMinimo,
          nivelMaximoOrdem:
            nivelMaximo,
          ativo,
        },
      );

      await carregarGrupos();

      setSucesso(
        "Configuração guardada com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar a configuração.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  async function alterarExcecao(
    aluno: AlunoGrupoAutomatico,
    tipo: TipoExcecaoGrupo | null,
  ) {
    if (!grupoSelecionado) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await definirExcecaoGrupo(
        grupoSelecionado.id,
        aluno.aluno.id,
        tipo,
      );

      await carregarAlunos(
        grupoSelecionado,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível alterar a participação do aluno.",
        ),
      );
    }
  }

  const alunosFiltrados = useMemo(() => {
    const termo = pesquisa
      .trim()
      .toLowerCase();

    if (!termo) {
      return alunos;
    }

    return alunos.filter((item) =>
      [
        item.aluno.nome,
        item.nivel?.nome ?? "",
      ].some((valor) =>
        valor
          .toLowerCase()
          .includes(termo),
      ),
    );
  }, [alunos, pesquisa]);

  const participantes = alunos.filter(
    (item) => item.participa,
  ).length;

  const automaticos = alunos.filter(
    (item) =>
      item.incluidoAutomaticamente &&
      !item.excecao,
  ).length;

  const inclusoes = alunos.filter(
    (item) =>
      item.excecao === "Incluir",
  ).length;

  const exclusoes = alunos.filter(
    (item) =>
      item.excecao === "Excluir",
  ).length;

  return (
    <main className="page">
      <PageHeader
        title="Grupos automáticos"
        description="Gerir Orquestra e Classe de Conjunto através dos níveis dos alunos."
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

      <section className="automatic-groups-tabs">
        {grupos.map((grupo) => (
          <button
            key={grupo.id}
            type="button"
            className={
              grupo.id ===
              grupoSelecionadoId
                ? "automatic-group-tab automatic-group-tab--active"
                : "automatic-group-tab"
            }
            onClick={() => {
              setGrupoSelecionadoId(
                grupo.id,
              );

              setPesquisa("");
              setErro("");
              setSucesso("");
            }}
          >
            <UsersRound size={19} />

            <span>{grupo.nome}</span>
          </button>
        ))}
      </section>

      {!grupoSelecionado ? (
        <section className="panel">
          <p className="muted-text">
            Ainda não existem grupos automáticos configurados.
          </p>
        </section>
      ) : (
        <>
          <section className="automatic-groups-summary">
            <article>
              <span>Participantes</span>
              <strong>{participantes}</strong>
            </article>

            <article>
              <span>Automáticos</span>
              <strong>{automaticos}</strong>
            </article>

            <article>
              <span>Inclusões</span>
              <strong>{inclusoes}</strong>
            </article>

            <article>
              <span>Exclusões</span>
              <strong>{exclusoes}</strong>
            </article>
          </section>

          <section className="automatic-groups-layout">
            <article className="panel">
              <h2>
                <Settings2 size={21} />
                Configuração
              </h2>

              <div className="form">
                <div className="form-field">
                  <label htmlFor="nivel-minimo">
                    Nível mínimo
                  </label>

                  <select
                    id="nivel-minimo"
                    value={nivelMinimo}
                    onChange={(event) =>
                      setNivelMinimo(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    <option value={0}>
                      Nível Minion
                    </option>

                    {Array.from(
                      { length: 8 },
                      (_, indice) =>
                        indice + 1,
                    ).map((numero) => (
                      <option
                        key={numero}
                        value={numero}
                      >
                        Nível {numero}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="nivel-maximo">
                    Nível máximo
                  </label>

                  <select
                    id="nivel-maximo"
                    value={nivelMaximo}
                    onChange={(event) =>
                      setNivelMaximo(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    <option value={0}>
                      Nível Minion
                    </option>

                    {Array.from(
                      { length: 8 },
                      (_, indice) =>
                        indice + 1,
                    ).map((numero) => (
                      <option
                        key={numero}
                        value={numero}
                      >
                        Nível {numero}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="user-active-field">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(event) =>
                      setAtivo(
                        event.target.checked,
                      )
                    }
                  />

                  <span>Grupo ativo</span>
                </label>

                <button
                  type="button"
                  className="button button--primary"
                  disabled={aGuardar}
                  onClick={
                    guardarConfiguracao
                  }
                >
                  <Save size={18} />

                  {aGuardar
                    ? "A guardar..."
                    : "Guardar configuração"}
                </button>
              </div>
            </article>

            <article className="panel">
              <header className="automatic-participants-header">
                <div>
                  <h2>Participantes</h2>

                  <p>
                    Podes incluir ou excluir casos excecionais.
                  </p>
                </div>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() =>
                    carregarAlunos(
                      grupoSelecionado,
                    )
                  }
                >
                  <RefreshCw size={18} />
                  Atualizar
                </button>
              </header>

              <div className="form-field">
                <label htmlFor="pesquisa-aluno">
                  Procurar aluno
                </label>

                <input
                  id="pesquisa-aluno"
                  type="search"
                  value={pesquisa}
                  onChange={(event) =>
                    setPesquisa(
                      event.target.value,
                    )
                  }
                  placeholder="Nome ou nível..."
                />
              </div>

              {aCarregar ? (
                <p className="muted-text">
                  A carregar participantes...
                </p>
              ) : (
                <div className="automatic-participants-list">
                  {alunosFiltrados.map(
                    (item) => (
                      <div
                        className={
                          item.participa
                            ? "automatic-participant automatic-participant--active"
                            : "automatic-participant"
                        }
                        key={item.aluno.id}
                      >
                        <div className="automatic-participant__state">
                          {item.participa ? (
                            <Check size={18} />
                          ) : (
                            <X size={18} />
                          )}
                        </div>

                        <div className="automatic-participant__identity">
                          <strong>
                            {item.aluno.nome}
                          </strong>

                          <span>
                            {item.nivel?.nome ??
                              "Sem nível"}
                          </span>
                        </div>

                        <div className="automatic-participant__origin">
                          {item.excecao ===
                          "Incluir" ? (
                            <span className="participant-origin participant-origin--include">
                              Incluído manualmente
                            </span>
                          ) : item.excecao ===
                            "Excluir" ? (
                            <span className="participant-origin participant-origin--exclude">
                              Excluído manualmente
                            </span>
                          ) : item.incluidoAutomaticamente ? (
                            <span className="participant-origin">
                              Pelo nível
                            </span>
                          ) : (
                            <span className="participant-origin participant-origin--outside">
                              Fora dos níveis
                            </span>
                          )}
                        </div>

                        <div className="automatic-participant__actions">
                          {item.participa ? (
                            <button
                              type="button"
                              className="icon-button icon-button--danger"
                              title="Excluir do grupo"
                              onClick={() =>
                                alterarExcecao(
                                  item,
                                  "Excluir",
                                )
                              }
                            >
                              <UserMinus
                                size={18}
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="icon-button"
                              title="Incluir no grupo"
                              onClick={() =>
                                alterarExcecao(
                                  item,
                                  "Incluir",
                                )
                              }
                            >
                              <UserPlus
                                size={18}
                              />
                            </button>
                          )}

                          {item.excecao && (
                            <button
                              type="button"
                              className="icon-button"
                              title="Remover exceção"
                              onClick={() =>
                                alterarExcecao(
                                  item,
                                  null,
                                )
                              }
                            >
                              <RefreshCw
                                size={18}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default GruposAutomaticos;