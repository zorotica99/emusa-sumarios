import {
  Archive,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Plus,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  ativarAnoLetivo,
  arquivarAnoLetivo,
  criarAnoLetivo,
  listarAnosLetivos,
  type AnoLetivo,
} from "../../services/anosLetivos.service";
import { obterMensagemErro } from "../../utils/errors";
import "./AnosLetivos.css";

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

function AnosLetivos() {
  const [anosLetivos, setAnosLetivos] =
    useState<AnoLetivo[]>([]);

  const [nome, setNome] =
    useState("");

  const [dataInicio, setDataInicio] =
    useState("");

  const [dataFim, setDataFim] =
    useState("");

  const [ativarAoCriar, setAtivarAoCriar] =
    useState(false);

  const [aCarregar, setACarregar] =
    useState(true);

  const [aGuardar, setAGuardar] =
    useState(false);

  const [acaoEmCurso, setAcaoEmCurso] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const carregarDados = useCallback(
    async () => {
      try {
        setACarregar(true);
        setErro("");

        const dados =
          await listarAnosLetivos();

        setAnosLetivos(dados);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar os anos letivos.",
          ),
        );
      } finally {
        setACarregar(false);
      }
    },
    [],
  );

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const anoAtivo = useMemo(
    () =>
      anosLetivos.find(
        (ano) =>
          ano.estado === "Ativo",
      ) ?? null,
    [anosLetivos],
  );

  function limparFormulario() {
    setNome("");
    setDataInicio("");
    setDataFim("");
    setAtivarAoCriar(false);
  }

  async function guardarAno(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      await criarAnoLetivo({
        nome,
        dataInicio,
        dataFim,
        ativar: ativarAoCriar,
      });

      limparFormulario();

      await carregarDados();

      setSucesso(
        "Ano letivo criado com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível criar o ano letivo.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  async function ativar(
    ano: AnoLetivo,
  ) {
    const confirmado =
      window.confirm(
        `Pretende tornar ${ano.nome} no ano letivo ativo?`,
      );

    if (!confirmado) {
      return;
    }

    try {
      setAcaoEmCurso(ano.id);
      setErro("");
      setSucesso("");

      await ativarAnoLetivo(
        ano.id,
      );

      await carregarDados();

      setSucesso(
        `${ano.nome} é agora o ano letivo ativo.`,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível ativar o ano letivo.",
        ),
      );
    } finally {
      setAcaoEmCurso("");
    }
  }

  async function arquivar(
    ano: AnoLetivo,
  ) {
    const confirmado =
      window.confirm(
        `Arquivar ${ano.nome}?\n\nDepois de arquivado, os horários, sumários e presenças desse ano deixam de poder ser alterados.`,
      );

    if (!confirmado) {
      return;
    }

    const confirmacaoFinal =
      window.prompt(
        `Escreva ARQUIVAR para confirmar o arquivo de ${ano.nome}.`,
      );

    if (
      confirmacaoFinal !==
      "ARQUIVAR"
    ) {
      return;
    }

    try {
      setAcaoEmCurso(ano.id);
      setErro("");
      setSucesso("");

      await arquivarAnoLetivo(
        ano.id,
      );

      await carregarDados();

      setSucesso(
        `${ano.nome} foi arquivado.`,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível arquivar o ano letivo.",
        ),
      );
    } finally {
      setAcaoEmCurso("");
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Anos letivos"
        description="Criar, ativar e arquivar anos letivos sem perder o histórico."
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

      {anoAtivo && (
        <section className="active-school-year-banner">
          <div className="active-school-year-banner__icon">
            <CalendarCheck2 size={27} />
          </div>

          <div>
            <span>
              Ano letivo ativo
            </span>

            <strong>
              {anoAtivo.nome}
            </strong>

            <p>
              {formatarData(
                anoAtivo.data_inicio,
              )}
              {" — "}
              {formatarData(
                anoAtivo.data_fim,
              )}
            </p>
          </div>
        </section>
      )}

      <section className="school-years-layout">
        <article className="panel">
          <h2>
            <Plus size={21} />
            Novo ano letivo
          </h2>

          <form
            className="form"
            onSubmit={guardarAno}
          >
            <div className="form-field">
              <label htmlFor="ano-letivo-nome">
                Nome
              </label>

              <input
                id="ano-letivo-nome"
                type="text"
                value={nome}
                placeholder="Ex.: 2027/28"
                onChange={(event) => {
                  setNome(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="ano-letivo-inicio">
                Data de início
              </label>

              <input
                id="ano-letivo-inicio"
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
              <label htmlFor="ano-letivo-fim">
                Data de fim
              </label>

              <input
                id="ano-letivo-fim"
                type="date"
                value={dataFim}
                onChange={(event) =>
                  setDataFim(
                    event.target.value,
                  )
                }
              />
            </div>

            <label className="user-active-field">
              <input
                type="checkbox"
                checked={ativarAoCriar}
                onChange={(event) =>
                  setAtivarAoCriar(
                    event.target.checked,
                  )
                }
              />

              <span>
                Tornar ativo imediatamente
              </span>
            </label>

            <button
              className="button button--primary"
              type="submit"
              disabled={aGuardar}
            >
              <Save size={18} />

              {aGuardar
                ? "A criar..."
                : "Criar ano letivo"}
            </button>
          </form>
        </article>

        <article className="panel">
          <header className="school-years-header">
            <div>
              <h2>
                <CalendarClock size={21} />
                Histórico
              </h2>

              <p>
                {anosLetivos.length}
                {" "}
                ano
                {anosLetivos.length === 1
                  ? ""
                  : "s"}
                {" "}
                letivo
                {anosLetivos.length === 1
                  ? ""
                  : "s"}
              </p>
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
          </header>

          {aCarregar ? (
            <p className="muted-text">
              A carregar...
            </p>
          ) : (
            <div className="school-years-list">
              {anosLetivos.map(
                (ano) => (
                  <article
                    className={`school-year-card school-year-card--${ano.estado.toLowerCase()}`}
                    key={ano.id}
                  >
                    <div className="school-year-card__icon">
                      {ano.estado ===
                      "Arquivado" ? (
                        <Archive size={23} />
                      ) : ano.estado ===
                        "Ativo" ? (
                        <CheckCircle2
                          size={23}
                        />
                      ) : (
                        <CalendarClock
                          size={23}
                        />
                      )}
                    </div>

                    <div className="school-year-card__details">
                      <strong>
                        {ano.nome}
                      </strong>

                      <span>
                        {formatarData(
                          ano.data_inicio,
                        )}
                        {" — "}
                        {formatarData(
                          ano.data_fim,
                        )}
                      </span>
                    </div>

                    <span
                      className={`school-year-state school-year-state--${ano.estado.toLowerCase()}`}
                    >
                      {ano.estado}
                    </span>

                    <div className="school-year-card__actions">
                      {ano.estado ===
                        "Planeado" && (
                        <button
                          className="button button--primary"
                          type="button"
                          disabled={
                            acaoEmCurso ===
                            ano.id
                          }
                          onClick={() =>
                            ativar(ano)
                          }
                        >
                          Ativar
                        </button>
                      )}

                      {ano.estado !==
                        "Arquivado" && (
                        <button
                          className="button button--secondary"
                          type="button"
                          disabled={
                            acaoEmCurso ===
                            ano.id
                          }
                          onClick={() =>
                            arquivar(ano)
                          }
                        >
                          <Archive
                            size={17}
                          />
                          Arquivar
                        </button>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default AnosLetivos;