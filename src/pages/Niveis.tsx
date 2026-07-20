import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import {
  atualizarNivel,
  criarNivel,
  eliminarNivel,
  listarNiveis,
  type Nivel,
} from "../services/niveis.service";

function Niveis() {
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [nome, setNome] = useState("");
  const [nivelEmEdicao, setNivelEmEdicao] = useState<Nivel | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarNiveis() {
    try {
      setErro("");
      const dados = await listarNiveis();
      setNiveis(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os níveis.",
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarNiveis();
  }, []);

  async function guardarNivel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro("O nome do nível é obrigatório.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (nivelEmEdicao) {
        await atualizarNivel(nivelEmEdicao.id, { nome });
      } else {
        await criarNivel({ nome });
      }

      setNome("");
      setNivelEmEdicao(null);

      await carregarNiveis();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar o nível.",
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarNivel(nivel: Nivel) {
    setNivelEmEdicao(nivel);
    setNome(nivel.nome);
    setErro("");
  }

  function cancelarEdicao() {
    setNivelEmEdicao(null);
    setNome("");
    setErro("");
  }

  async function removerNivel(nivel: Nivel) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${nivel.nome}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarNivel(nivel.id);
      await carregarNiveis();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar o nível.",
      );
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Níveis"
        description="Gerir os níveis de ensino da EMUSA."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <div className="panel">
          <h2>{nivelEmEdicao ? "Editar nível" : "Novo nível"}</h2>

          <form className="form" onSubmit={guardarNivel}>
            <div className="form-field">
              <label htmlFor="nome">Nome</label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Nível 1"
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
                  : nivelEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar nível"}
              </button>

              {nivelEmEdicao && (
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
          <h2>Lista de níveis</h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : niveis.length === 0 ? (
            <p className="muted-text">Ainda não existem níveis.</p>
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
                  {niveis.map((nivel) => (
                    <tr key={nivel.id}>
                      <td>{nivel.nome}</td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() => editarNivel(nivel)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => removerNivel(nivel)}
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

export default Niveis;