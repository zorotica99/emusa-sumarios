import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  listarNiveis,
  type Nivel,
} from "../../services/niveis.service";
import {
  atualizarTurma,
  criarTurma,
  eliminarTurma,
  listarTurmas,
  type TipoTurma,
  type Turma,
} from "../../services/turmas.service";

interface TurmaFormData {
  nome: string;
  nivelId: string;
  anoLetivo: string;
  tipoTurma: TipoTurma;
}

const dadosIniciais: TurmaFormData = {
  nome: "",
  nivelId: "",
  anoLetivo: "",
  tipoTurma: "Principal",
};

function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [formulario, setFormulario] =
    useState<TurmaFormData>(dadosIniciais);
  const [turmaEmEdicao, setTurmaEmEdicao] =
    useState<Turma | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const [dadosTurmas, dadosNiveis] = await Promise.all([
        listarTurmas(),
        listarNiveis(),
      ]);

      setTurmas(dadosTurmas);
      setNiveis(dadosNiveis);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as turmas.",
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarCampo(
    campo: keyof TurmaFormData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function guardarTurma(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      setErro("O nome da turma é obrigatório.");
      return;
    }

    if (!formulario.nivelId) {
      setErro("Selecione um nível.");
      return;
    }

    if (!formulario.anoLetivo.trim()) {
      setErro("O ano letivo é obrigatório.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (turmaEmEdicao) {
        await atualizarTurma(
          turmaEmEdicao.id,
          formulario,
        );
      } else {
        await criarTurma(formulario);
      }

      setFormulario(dadosIniciais);
      setTurmaEmEdicao(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar a turma.",
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarTurma(turma: Turma) {
    setTurmaEmEdicao(turma);

    setFormulario({
      nome: turma.nome,
      nivelId: turma.nivel_id,
      anoLetivo: turma.ano_letivo,
      tipoTurma: turma.tipo_turma,
    });

    setErro("");
  }

  function cancelarEdicao() {
    setTurmaEmEdicao(null);
    setFormulario(dadosIniciais);
    setErro("");
  }

  async function removerTurma(turma: Turma) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${turma.nome}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarTurma(turma.id);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar a turma.",
      );
    }
  }

  function obterNomeNivel(nivelId: string) {
    return (
      niveis.find((nivel) => nivel.id === nivelId)?.nome ??
      "—"
    );
  }

  function obterNomeTipo(tipoTurma: TipoTurma) {
    return tipoTurma === "Principal"
      ? "Turma principal"
      : "Classe de conjunto";
  }

  const opcoesNiveis = niveis.map((nivel) => ({
    value: nivel.id,
    label: nivel.nome,
  }));

  const opcoesTiposTurma = [
    {
      value: "Principal",
      label: "Turma principal",
    },
    {
      value: "Conjunto",
      label: "Classe de conjunto",
    },
  ];

  return (
    <main className="page">
      <PageHeader
        title="Turmas"
        description="Gerir as turmas e classes de conjunto da EMUSA."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            {turmaEmEdicao
              ? "Editar turma"
              : "Nova turma"}
          </h2>

          <form
            className="form"
            onSubmit={guardarTurma}
          >
            <div className="form-field">
              <label htmlFor="turma-nome">
                Nome
              </label>

              <input
                id="turma-nome"
                type="text"
                value={formulario.nome}
                onChange={(event) =>
                  alterarCampo(
                    "nome",
                    event.target.value,
                  )
                }
                placeholder="Ex.: Turma A ou Orquestra"
              />
            </div>

            <SelectField
              id="turma-tipo"
              label="Tipo de turma"
              value={formulario.tipoTurma}
              options={opcoesTiposTurma}
              placeholder="Selecione o tipo"
              onChange={(valor) =>
                alterarCampo(
                  "tipoTurma",
                  valor,
                )
              }
            />

            <SelectField
              id="turma-nivel"
              label="Nível"
              value={formulario.nivelId}
              options={opcoesNiveis}
              placeholder="Selecione um nível"
              onChange={(valor) =>
                alterarCampo(
                  "nivelId",
                  valor,
                )
              }
            />

            <div className="form-field">
              <label htmlFor="turma-ano-letivo">
                Ano letivo
              </label>

              <input
                id="turma-ano-letivo"
                type="text"
                value={formulario.anoLetivo}
                onChange={(event) =>
                  alterarCampo(
                    "anoLetivo",
                    event.target.value,
                  )
                }
                placeholder="Ex.: 2026/2027"
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
                  : turmaEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar turma"}
              </button>

              {turmaEmEdicao && (
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
          <h2>Lista de turmas</h2>

          {aCarregar ? (
            <p className="muted-text">
              A carregar...
            </p>
          ) : turmas.length === 0 ? (
            <p className="muted-text">
              Ainda não existem turmas.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Nível</th>
                    <th>Ano letivo</th>
                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {turmas.map((turma) => (
                    <tr key={turma.id}>
                      <td>{turma.nome}</td>
                      <td>
                        {obterNomeTipo(
                          turma.tipo_turma,
                        )}
                      </td>
                      <td>
                        {obterNomeNivel(
                          turma.nivel_id,
                        )}
                      </td>
                      <td>{turma.ano_letivo}</td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() =>
                            editarTurma(turma)
                          }
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() =>
                            removerTurma(turma)
                          }
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

export default Turmas;