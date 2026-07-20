import {
  KeyRound,
  Plus,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import {
  alterarEstadoUtilizador,
  criarUtilizador,
  listarUtilizadoresPerfis,
  type TipoPerfilUtilizador,
  type UtilizadorPerfil,
} from "../../services/utilizadoresPerfis.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Utilizadores.css";

interface FormularioData {
  email: string;
  password: string;
  professorId: string;
  nome: string;
  perfil: TipoPerfilUtilizador;
}

const dadosIniciais: FormularioData = {
  email: "",
  password: "",
  professorId: "",
  nome: "",
  perfil: "Professor",
};

const opcoesPerfil = [
  {
    value: "Professor",
    label: "Professor",
  },
  {
    value: "Administrador",
    label: "Administrador",
  },
];

function Utilizadores() {
  const [utilizadores, setUtilizadores] =
    useState<UtilizadorPerfil[]>([]);

  const [professores, setProfessores] =
    useState<Professor[]>([]);

  const [formulario, setFormulario] =
    useState<FormularioData>(
      dadosIniciais,
    );

  const [aCarregar, setACarregar] =
    useState(true);

  const [aGuardar, setAGuardar] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosUtilizadores,
        dadosProfessores,
      ] = await Promise.all([
        listarUtilizadoresPerfis(),
        listarProfessores(),
      ]);

      setUtilizadores(
        dadosUtilizadores,
      );

      setProfessores(
        dadosProfessores,
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os utilizadores.",
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
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErro("");
    setSucesso("");
  }

  function alterarProfessor(
    professorId: string,
  ) {
    const professor =
      professores.find(
        (item) =>
          item.id === professorId,
      );

    setFormulario((atual) => ({
      ...atual,
      professorId,
      nome:
        professor?.nome ??
        atual.nome,
    }));

    setErro("");
    setSucesso("");
  }

  async function guardar(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      await criarUtilizador({
        email: formulario.email,
        password:
          formulario.password,
        nome: formulario.nome,
        perfil: formulario.perfil,
        professorId:
          formulario.professorId,
      });

      setFormulario(dadosIniciais);

      await carregarDados();

      setSucesso(
        "Conta criada e acesso configurado com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível criar a conta.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  async function alternarEstado(
    utilizador: UtilizadorPerfil,
  ) {
    try {
      setErro("");
      setSucesso("");

      await alterarEstadoUtilizador(
        utilizador.id,
        !utilizador.ativo,
      );

      await carregarDados();

      setSucesso(
        utilizador.ativo
          ? "Acesso desativado."
          : "Acesso ativado.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível alterar o acesso.",
        ),
      );
    }
  }

  function obterProfessorNome(
    professorId: string | null,
  ): string {
    if (!professorId) {
      return "—";
    }

    return (
      professores.find(
        (professor) =>
          professor.id ===
          professorId,
      )?.nome ?? "—"
    );
  }

  const opcoesProfessores =
    professores.map((professor) => ({
      value: professor.id,
      label: professor.nome,
    }));

  return (
    <main className="page">
      <PageHeader
        title="Utilizadores"
        description="Criar contas e controlar o acesso dos professores."
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

      <section className="users-layout">
        <div className="panel">
          <h2>
            <KeyRound size={21} />
            Nova conta
          </h2>

          <form
            className="form"
            onSubmit={guardar}
          >
            <SelectField
              id="utilizador-perfil"
              label="Tipo de acesso"
              value={formulario.perfil}
              options={opcoesPerfil}
              placeholder="Selecione o tipo"
              onChange={(valor) =>
                alterarCampo(
                  "perfil",
                  valor,
                )
              }
            />

            {formulario.perfil ===
              "Professor" && (
              <SelectField
                id="utilizador-professor"
                label="Professor associado"
                value={
                  formulario.professorId
                }
                options={
                  opcoesProfessores
                }
                placeholder="Selecione um professor"
                onChange={
                  alterarProfessor
                }
              />
            )}

            <div className="form-field">
              <label htmlFor="utilizador-nome">
                Nome apresentado
              </label>

              <input
                id="utilizador-nome"
                type="text"
                value={formulario.nome}
                onChange={(event) =>
                  alterarCampo(
                    "nome",
                    event.target.value,
                  )
                }
                placeholder="Nome do utilizador"
              />
            </div>

            <div className="form-field">
              <label htmlFor="utilizador-email">
                Email
              </label>

              <input
                id="utilizador-email"
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  alterarCampo(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="professor@emusa.pt"
              />
            </div>

            <div className="form-field">
              <label htmlFor="utilizador-password">
                Palavra-passe inicial
              </label>

              <input
                id="utilizador-password"
                type="password"
                value={
                  formulario.password
                }
                onChange={(event) =>
                  alterarCampo(
                    "password",
                    event.target.value,
                  )
                }
                placeholder="Mínimo de 8 caracteres"
              />
            </div>

            <button
              className="button button--primary"
              type="submit"
              disabled={aGuardar}
            >
              <Plus size={18} />

              {aGuardar
                ? "A criar conta..."
                : "Criar conta"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>
            Acessos configurados
          </h2>

          {aCarregar ? (
            <p className="muted-text">
              A carregar...
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Perfil</th>
                    <th>Professor</th>
                    <th>Estado</th>
                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {utilizadores.map(
                    (utilizador) => (
                      <tr key={utilizador.id}>
                        <td>
                          <strong>
                            {utilizador.nome}
                          </strong>
                        </td>

                        <td>
                          <span className="user-profile-badge">
                            {
                              utilizador.perfil
                            }
                          </span>
                        </td>

                        <td>
                          {obterProfessorNome(
                            utilizador.professor_id,
                          )}
                        </td>

                        <td>
                          <span
                            className={`user-state ${
                              utilizador.ativo
                                ? "user-state--active"
                                : "user-state--inactive"
                            }`}
                          >
                            {utilizador.ativo
                              ? "Ativo"
                              : "Desativado"}
                          </span>
                        </td>

                        <td className="data-table__actions">
                          <button
                            className="icon-button"
                            type="button"
                            title={
                              utilizador.ativo
                                ? "Desativar"
                                : "Ativar"
                            }
                            onClick={() =>
                              alternarEstado(
                                utilizador,
                              )
                            }
                          >
                            {utilizador.ativo ? (
                              <UserX
                                size={18}
                              />
                            ) : (
                              <UserCheck
                                size={18}
                              />
                            )}
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Utilizadores;