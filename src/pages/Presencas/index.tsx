import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
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
  atualizarPresenca,
  criarPresenca,
  eliminarPresenca,
  listarPresencas,
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

interface PresencaFormData {
  horarioId: string;
  alunoId: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string;
}

const dadosIniciais: PresencaFormData = {
  horarioId: "",
  alunoId: "",
  data: "",
  estado: "Presente",
  observacoes: "",
};

const opcoesEstado = [
  { value: "Presente", label: "Presente" },
  { value: "Falta", label: "Falta" },
  {
    value: "Falta justificada",
    label: "Falta justificada",
  },
];

function Presencas() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  const [formulario, setFormulario] =
    useState<PresencaFormData>(dadosIniciais);

  const [presencaEmEdicao, setPresencaEmEdicao] =
    useState<Presenca | null>(null);

  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const [
        dadosPresencas,
        dadosAlunos,
        dadosHorarios,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
      ] = await Promise.all([
        listarPresencas(),
        listarAlunos(),
        listarHorarios(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
      ]);

      setPresencas(dadosPresencas);
      setAlunos(dadosAlunos);
      setHorarios(dadosHorarios);
      setProfessores(dadosProfessores);
      setTurmas(dadosTurmas);
      setDisciplinas(dadosDisciplinas);
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
    carregarDados();
  }, []);

  function alterarCampo(
    campo: keyof PresencaFormData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function guardarPresenca(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !formulario.horarioId ||
      !formulario.alunoId ||
      !formulario.data
    ) {
      setErro("Preencha o horário, o aluno e a data.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (presencaEmEdicao) {
        await atualizarPresenca(
          presencaEmEdicao.id,
          formulario,
        );
      } else {
        await criarPresenca(formulario);
      }

      setFormulario(dadosIniciais);
      setPresencaEmEdicao(null);

      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar a presença.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarPresenca(presenca: Presenca) {
    setPresencaEmEdicao(presenca);

    setFormulario({
      horarioId: presenca.horario_id,
      alunoId: presenca.aluno_id,
      data: presenca.data,
      estado: presenca.estado,
      observacoes: presenca.observacoes ?? "",
    });

    setErro("");
  }

  function cancelarEdicao() {
    setPresencaEmEdicao(null);
    setFormulario(dadosIniciais);
    setErro("");
  }

  async function removerPresenca(presenca: Presenca) {
    const confirmado = window.confirm(
      "Tem a certeza de que pretende eliminar esta presença?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarPresenca(presenca.id);
      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível eliminar a presença.",
        ),
      );
    }
  }

  function obterNomeAluno(id: string) {
    return alunos.find((aluno) => aluno.id === id)?.nome ?? "—";
  }

  function obterDescricaoHorario(horario: Horario) {
    const professor =
      professores.find(
        (item) => item.id === horario.professor_id,
      )?.nome ?? "Professor";

    const turma =
      turmas.find((item) => item.id === horario.turma_id)
        ?.nome ?? "Turma";

    const disciplina =
      disciplinas.find(
        (item) => item.id === horario.disciplina_id,
      )?.nome ?? "Disciplina";

    return `${professor} — ${turma} — ${disciplina} — ${horario.dia_semana} ${horario.hora_inicio.slice(0, 5)}`;
  }

  function obterHorario(id: string) {
    const horario = horarios.find((item) => item.id === id);

    return horario ? obterDescricaoHorario(horario) : "—";
  }

  const opcoesAlunos = alunos.map((aluno) => ({
    value: aluno.id,
    label: aluno.nome,
  }));

  const opcoesHorarios = horarios.map((horario) => ({
    value: horario.id,
    label: obterDescricaoHorario(horario),
  }));

  return (
    <main className="page">
      <PageHeader
        title="Presenças"
        description="Registar a presença dos alunos nas aulas."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            {presencaEmEdicao
              ? "Editar presença"
              : "Nova presença"}
          </h2>

          <form className="form" onSubmit={guardarPresenca}>
            <SelectField
              id="presenca-horario"
              label="Horário"
              value={formulario.horarioId}
              options={opcoesHorarios}
              placeholder="Selecione um horário"
              onChange={(valor) =>
                alterarCampo("horarioId", valor)
              }
            />

            <SelectField
              id="presenca-aluno"
              label="Aluno"
              value={formulario.alunoId}
              options={opcoesAlunos}
              placeholder="Selecione um aluno"
              onChange={(valor) =>
                alterarCampo("alunoId", valor)
              }
            />

            <div className="form-field">
              <label htmlFor="presenca-data">Data</label>

              <input
                id="presenca-data"
                type="date"
                value={formulario.data}
                onChange={(event) =>
                  alterarCampo("data", event.target.value)
                }
              />
            </div>

            <SelectField
              id="presenca-estado"
              label="Estado"
              value={formulario.estado}
              options={opcoesEstado}
              placeholder="Selecione o estado"
              onChange={(valor) =>
                alterarCampo("estado", valor)
              }
            />

            <div className="form-field">
              <label htmlFor="presenca-observacoes">
                Observações
              </label>

              <textarea
                id="presenca-observacoes"
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
                  : presencaEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar presença"}
              </button>

              {presencaEmEdicao && (
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
          <h2>Lista de presenças</h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : presencas.length === 0 ? (
            <p className="muted-text">
              Ainda não existem presenças.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Aluno</th>
                    <th>Horário</th>
                    <th>Estado</th>
                    <th>Observações</th>
                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {presencas.map((presenca) => (
                    <tr key={presenca.id}>
                      <td>{presenca.data}</td>
                      <td>{obterNomeAluno(presenca.aluno_id)}</td>
                      <td>{obterHorario(presenca.horario_id)}</td>
                      <td>{presenca.estado}</td>
                      <td>{presenca.observacoes || "—"}</td>

                      <td className="data-table__actions">
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() =>
                            editarPresenca(presenca)
                          }
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="icon-button icon-button--danger"
                          type="button"
                          title="Eliminar"
                          onClick={() =>
                            removerPresenca(presenca)
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

export default Presencas;