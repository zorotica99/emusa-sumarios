import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import {
  atualizarInstrumento,
  criarInstrumento,
  eliminarInstrumento,
  listarInstrumentos,
  type Instrumento,
} from "../services/instrumentos.service";

function Instrumentos() {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [nome, setNome] = useState("");
  const [instrumentoEmEdicao, setInstrumentoEmEdicao] =
    useState<Instrumento | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarInstrumentos() {
    try {
      setErro("");
      const dados = await listarInstrumentos();
      setInstrumentos(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os instrumentos.",
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarInstrumentos();
  }, []);

  async function guardarInstrumento(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro("O nome do instrumento é obrigatório.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (instrumentoEmEdicao) {
        await atualizarInstrumento(instrumentoEmEdicao.id, { nome });
      } else {
        await criarInstrumento({ nome });
      }

      setNome("");
      setInstrumentoEmEdicao(null);
      await carregarInstrumentos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar o instrumento.",
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarInstrumento(instrumento: Instrumento) {
    setInstrumentoEmEdicao(instrumento);
    setNome(instrumento.nome);
    setErro("");
  }

  function cancelarEdicao() {
    setInstrumentoEmEdicao(null);
    setNome("");
    setErro("");
  }

  async function removerInstrumento(instrumento: Instrumento) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${instrumento.nome}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarInstrumento(instrumento.id);
      await carregarInstrumentos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar o instrumento.",
      );
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Instrumentos"
        description="Gerir os instrumentos da EMUSA."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            {instrumentoEmEdicao
              ? "Editar instrumento"
              : "Novo instrumento"}
          </h2>

          <form className="form" onSubmit={guardarInstrumento}>
            <div className="form-field">
              <label htmlFor="nome">Nome</label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Piano"
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
                  : instrumentoEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar instrumento"}
              </button>

              {instrumentoEmEdicao && (
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
          <h2>Lista de instrumentos</h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : instrumentos.length === 0 ? (
            <p className="muted-text">Ainda não existem instrumentos.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th className="data-table__actions">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {instrumentos.map((instrumento) => (
                    <tr key={instrumento.id}>
                      <td>{instrumento.nome}</td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() => editarInstrumento(instrumento)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => removerInstrumento(instrumento)}
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

export default Instrumentos;