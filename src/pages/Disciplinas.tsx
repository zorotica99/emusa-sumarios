import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import {
  atualizarDisciplina,
  criarDisciplina,
  eliminarDisciplina,
  listarDisciplinas,
  type Disciplina,
} from "../services/disciplinas.service";

function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [disciplinaEmEdicao, setDisciplinaEmEdicao] =
    useState<Disciplina | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDisciplinas() {
    try {
      setErro("");
      const dados = await listarDisciplinas();
      setDisciplinas(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as disciplinas.",
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  async function guardarDisciplina(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro("O nome da disciplina é obrigatório.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (disciplinaEmEdicao) {
        await atualizarDisciplina(disciplinaEmEdicao.id, {
          nome,
          codigo,
        });
      } else {
        await criarDisciplina({
          nome,
          codigo,
        });
      }

      setNome("");
      setCodigo("");
      setDisciplinaEmEdicao(null);

      await carregarDisciplinas();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar a disciplina.",
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarDisciplina(disciplina: Disciplina) {
    setDisciplinaEmEdicao(disciplina);
    setNome(disciplina.nome);
    setCodigo(disciplina.codigo ?? "");
    setErro("");
  }

  function cancelarEdicao() {
    setDisciplinaEmEdicao(null);
    setNome("");
    setCodigo("");
    setErro("");
  }

  async function removerDisciplina(disciplina: Disciplina) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${disciplina.nome}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarDisciplina(disciplina.id);
      await carregarDisciplinas();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar a disciplina.",
      );
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Disciplinas"
        description="Gerir as disciplinas da EMUSA."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            {disciplinaEmEdicao ? "Editar disciplina" : "Nova disciplina"}
          </h2>

          <form className="form" onSubmit={guardarDisciplina}>
            <div className="form-field">
              <label htmlFor="nome">Nome</label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Formação Musical"
              />
            </div>

            <div className="form-field">
              <label htmlFor="codigo">Código</label>

              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ex.: FM"
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
                  : disciplinaEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar disciplina"}
              </button>

              {disciplinaEmEdicao && (
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
          <h2>Lista de disciplinas</h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : disciplinas.length === 0 ? (
            <p className="muted-text">Ainda não existem disciplinas.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Código</th>
                    <th className="data-table__actions">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {disciplinas.map((disciplina) => (
                    <tr key={disciplina.id}>
                      <td>{disciplina.nome}</td>
                      <td>{disciplina.codigo || "—"}</td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() => editarDisciplina(disciplina)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() => removerDisciplina(disciplina)}
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

export default Disciplinas;