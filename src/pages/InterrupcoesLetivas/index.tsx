import {
  CalendarOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  atualizarInterrupcaoLetiva,
  criarInterrupcaoLetiva,
  eliminarInterrupcaoLetiva,
  listarInterrupcoesLetivas,
  type InterrupcaoLetiva,
  type TipoInterrupcaoLetiva,
} from "../../services/interrupcoesLetivas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./InterrupcoesLetivas.css";

interface FormularioData {
  titulo: string;
  tipo: TipoInterrupcaoLetiva;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

const dadosIniciais: FormularioData = {
  titulo: "",
  tipo: "Feriado",
  dataInicio: "",
  dataFim: "",
  observacoes: "",
};

const opcoesTipo = [
  { value: "Feriado", label: "Feriado" },
  { value: "Férias", label: "Férias" },
  {
    value: "Interrupção letiva",
    label: "Interrupção letiva",
  },
  { value: "Encerramento", label: "Encerramento" },
  { value: "Outro", label: "Outro" },
];

function formatarData(data: string): string {
  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function InterrupcoesLetivas() {
  const [interrupcoes, setInterrupcoes] = useState<
    InterrupcaoLetiva[]
  >([]);

  const [formulario, setFormulario] =
    useState<FormularioData>(dadosIniciais);

  const [interrupcaoEmEdicao, setInterrupcaoEmEdicao] =
    useState<InterrupcaoLetiva | null>(null);

  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const dados = await listarInterrupcoesLetivas();

      setInterrupcoes(dados);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar as interrupções letivas.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarCampo(
    campo: keyof FormularioData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErro("");
  }

  async function guardar(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!formulario.titulo.trim()) {
      setErro("O título é obrigatório.");
      return;
    }

    if (!formulario.dataInicio || !formulario.dataFim) {
      setErro("Preencha as datas de início e fim.");
      return;
    }

    if (formulario.dataFim < formulario.dataInicio) {
      setErro(
        "A data de fim deve ser posterior à data de início.",
      );
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (interrupcaoEmEdicao) {
        await atualizarInterrupcaoLetiva(
          interrupcaoEmEdicao.id,
          formulario,
        );
      } else {
        await criarInterrupcaoLetiva(formulario);
      }

      setFormulario(dadosIniciais);
      setInterrupcaoEmEdicao(null);

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar a interrupção letiva.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editar(interrupcao: InterrupcaoLetiva) {
    setInterrupcaoEmEdicao(interrupcao);

    setFormulario({
      titulo: interrupcao.titulo,
      tipo: interrupcao.tipo,
      dataInicio: interrupcao.data_inicio,
      dataFim: interrupcao.data_fim,
      observacoes: interrupcao.observacoes ?? "",
    });

    setErro("");
  }

  function cancelarEdicao() {
    setInterrupcaoEmEdicao(null);
    setFormulario(dadosIniciais);
    setErro("");
  }

  async function remover(interrupcao: InterrupcaoLetiva) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${interrupcao.titulo}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");

      await eliminarInterrupcaoLetiva(interrupcao.id);
      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível eliminar a interrupção letiva.",
        ),
      );
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Interrupções letivas"
        description="Gerir feriados, férias e outros dias sem aulas."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            <CalendarOff size={21} />

            {interrupcaoEmEdicao
              ? "Editar interrupção"
              : "Nova interrupção"}
          </h2>

          <form className="form" onSubmit={guardar}>
            <div className="form-field">
              <label htmlFor="interrupcao-titulo">
                Título
              </label>

              <input
                id="interrupcao-titulo"
                type="text"
                value={formulario.titulo}
                onChange={(event) =>
                  alterarCampo("titulo", event.target.value)
                }
                placeholder="Ex.: Férias de Natal"
              />
            </div>

            <SelectField
              id="interrupcao-tipo"
              label="Tipo"
              value={formulario.tipo}
              options={opcoesTipo}
              placeholder="Selecione o tipo"
              onChange={(valor) =>
                alterarCampo("tipo", valor)
              }
            />

            <div className="form-field">
              <label htmlFor="interrupcao-inicio">
                Data de início
              </label>

              <input
                id="interrupcao-inicio"
                type="date"
                value={formulario.dataInicio}
                onChange={(event) =>
                  alterarCampo(
                    "dataInicio",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="interrupcao-fim">
                Data de fim
              </label>

              <input
                id="interrupcao-fim"
                type="date"
                value={formulario.dataFim}
                onChange={(event) =>
                  alterarCampo("dataFim", event.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label htmlFor="interrupcao-observacoes">
                Observações
              </label>

              <textarea
                id="interrupcao-observacoes"
                rows={4}
                value={formulario.observacoes}
                onChange={(event) =>
                  alterarCampo(
                    "observacoes",
                    event.target.value,
                  )
                }
                placeholder="Observações opcionais..."
              />
            </div>

            <div className="form-actions">
              <button
                className="button button--primary"
                type="submit"
                disabled={aGuardar}
              >
                <Plus size={18} />

                {aGuardar
                  ? "A guardar..."
                  : interrupcaoEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar interrupção"}
              </button>

              {interrupcaoEmEdicao && (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Calendário de interrupções</h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : interrupcoes.length === 0 ? (
            <p className="muted-text">
              Ainda não existem interrupções letivas.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Observações</th>
                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {interrupcoes.map((interrupcao) => (
                    <tr key={interrupcao.id}>
                      <td>{interrupcao.titulo}</td>
                      <td>
                        <span className="school-break-type">
                          {interrupcao.tipo}
                        </span>
                      </td>
                      <td>
                        {formatarData(interrupcao.data_inicio)}
                      </td>
                      <td>
                        {formatarData(interrupcao.data_fim)}
                      </td>
                      <td>
                        {interrupcao.observacoes || "—"}
                      </td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() => editar(interrupcao)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => remover(interrupcao)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default InterrupcoesLetivas;