import {
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  criarUtilizador,
  type PerfilUtilizador,
} from "../../services/criarUtilizador.service";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import { supabase } from "../../lib/supabase";
import { obterMensagemErro } from "../../utils/errors";
import "./Utilizadores.css";

interface UtilizadorPerfil {
  id: string;
  auth_user_id: string;
  professor_id: string | null;
  email: string;
  nome: string;
  perfil: PerfilUtilizador;
  ativo: boolean;
}

function Utilizadores() {
  const [professores, setProfessores] =
    useState<Professor[]>([]);

  const [utilizadores, setUtilizadores] =
    useState<UtilizadorPerfil[]>([]);

  const [email, setEmail] =
    useState("");

  const [nome, setNome] =
    useState("");

  const [
    professorId,
    setProfessorId,
  ] = useState("");

  const [perfil, setPerfil] =
    useState<PerfilUtilizador>(
      "Professor",
    );

  const [ativo, setAtivo] =
    useState(true);

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
        dadosProfessores,
        respostaUtilizadores,
      ] = await Promise.all([
        listarProfessores(),

        supabase
          .from("utilizadores_perfis")
          .select(
            `
              id,
              auth_user_id,
              professor_id,
              email,
              nome,
              perfil,
              ativo
            `,
          )
          .order("nome", {
            ascending: true,
          }),
      ]);

      if (
        respostaUtilizadores.error
      ) {
        throw respostaUtilizadores.error;
      }

      setProfessores(
        dadosProfessores,
      );

      setUtilizadores(
        (respostaUtilizadores.data ??
          []) as UtilizadorPerfil[],
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

  const professoresDisponiveis =
    useMemo(() => {
      const professorIdsLigados =
        new Set(
          utilizadores
            .map(
              (utilizador) =>
                utilizador.professor_id,
            )
            .filter(Boolean),
        );

      return professores.filter(
        (professor) =>
          !professorIdsLigados.has(
            professor.id,
          ),
      );
    }, [
      professores,
      utilizadores,
    ]);

  function selecionarProfessor(
    id: string,
  ) {
    setProfessorId(id);

    const professor =
      professores.find(
        (item) =>
          item.id === id,
      );

    if (professor) {
      setNome(professor.nome);

      const emailProfessor =
        "email" in professor
          ? String(
              professor.email ?? "",
            )
          : "";

      if (
        emailProfessor &&
        !email.trim()
      ) {
        setEmail(emailProfessor);
      }
    }

    setErro("");
    setSucesso("");
  }

  function limparFormulario() {
    setEmail("");
    setNome("");
    setProfessorId("");
    setPerfil("Professor");
    setAtivo(true);
  }

  async function guardarUtilizador(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      const resultado =
        await criarUtilizador({
          email,
          nome,
          professorId:
            perfil === "Professor"
              ? professorId
              : null,
          perfil,
          ativo,
        });

      limparFormulario();

      await carregarDados();

      setSucesso(
        resultado.message ??
          "Conta criada e convite enviado.",
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

  async function alterarEstado(
    utilizador: UtilizadorPerfil,
  ) {
    try {
      setErro("");
      setSucesso("");

      const novoEstado =
        !utilizador.ativo;

      const { error } =
        await supabase
          .from("utilizadores_perfis")
          .update({
            ativo: novoEstado,
          })
          .eq(
            "id",
            utilizador.id,
          );

      if (error) {
        throw error;
      }

      await carregarDados();

      setSucesso(
        novoEstado
          ? "Acesso ativado."
          : "Acesso desativado.",
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

  function obterNomeProfessor(
    id: string | null,
  ): string {
    if (!id) {
      return "—";
    }

    return (
      professores.find(
        (professor) =>
          professor.id === id,
      )?.nome ?? "—"
    );
  }

  return (
    <main className="page">
      <PageHeader
        title="Utilizadores"
        description="Criar contas, enviar convites e controlar os acessos."
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
        <article className="panel">
          <h2>
            <KeyRound size={21} />
            Nova conta
          </h2>

          <div className="users-invite-info">
            <Mail size={21} />

            <div>
              <strong>
                Convite automático
              </strong>

              <p>
                O utilizador receberá um
                email para definir a sua
                palavra-passe.
              </p>
            </div>
          </div>

          <form
            className="form"
            onSubmit={
              guardarUtilizador
            }
          >
            <div className="form-field">
              <label htmlFor="utilizador-perfil">
                Tipo de acesso
              </label>

              <select
                id="utilizador-perfil"
                value={perfil}
                onChange={(event) => {
                  const novoPerfil =
                    event.target
                      .value as
                      PerfilUtilizador;

                  setPerfil(novoPerfil);

                  if (
                    novoPerfil ===
                    "Administrador"
                  ) {
                    setProfessorId("");
                  }

                  setErro("");
                  setSucesso("");
                }}
              >
                <option value="Professor">
                  Professor
                </option>

                <option value="Administrador">
                  Administrador
                </option>
              </select>
            </div>

            {perfil === "Professor" && (
              <div className="form-field">
                <label htmlFor="utilizador-professor">
                  Professor associado
                </label>

                <select
                  id="utilizador-professor"
                  value={professorId}
                  onChange={(event) =>
                    selecionarProfessor(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Selecione um professor
                  </option>

                  {professoresDisponiveis.map(
                    (professor) => (
                      <option
                        key={professor.id}
                        value={professor.id}
                      >
                        {professor.nome}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="utilizador-nome">
                Nome apresentado
              </label>

              <input
                id="utilizador-nome"
                type="text"
                value={nome}
                placeholder="Nome do utilizador"
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
              <label htmlFor="utilizador-email">
                Email
              </label>

              <input
                id="utilizador-email"
                type="email"
                value={email}
                placeholder="professor@emusa.pt"
                autoComplete="email"
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
              />
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

              <span>Acesso ativo</span>
            </label>

            <button
              className="button button--primary"
              type="submit"
              disabled={aGuardar}
            >
              <Send size={18} />

              {aGuardar
                ? "A criar conta..."
                : "Criar e enviar convite"}
            </button>
          </form>
        </article>

        <article className="panel">
          <header className="users-list-header">
            <div>
              <h2>
                <ShieldCheck size={21} />
                Acessos configurados
              </h2>

              <p>
                {utilizadores.length}
                {" "}
                utilizador
                {utilizadores.length === 1
                  ? ""
                  : "es"}
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
              A carregar utilizadores...
            </p>
          ) : utilizadores.length === 0 ? (
            <p className="muted-text">
              Ainda não existem acessos
              configurados.
            </p>
          ) : (
            <div className="users-list">
              {utilizadores.map(
                (utilizador) => (
                  <div
                    className="user-access-card"
                    key={utilizador.id}
                  >
                    <div className="user-access-card__icon">
                      <UserRound
                        size={21}
                      />
                    </div>

                    <div className="user-access-card__identity">
                      <strong>
                        {utilizador.nome}
                      </strong>

                      <span>
                        {utilizador.email}
                      </span>

                      {utilizador.professor_id && (
                        <small>
                          Professor:{" "}
                          {obterNomeProfessor(
                            utilizador.professor_id,
                          )}
                        </small>
                      )}
                    </div>

                    <div className="user-access-card__details">
                      <span className="user-role-badge">
                        {utilizador.perfil}
                      </span>

                      <span
                        className={
                          utilizador.ativo
                            ? "user-state user-state--active"
                            : "user-state user-state--inactive"
                        }
                      >
                        {utilizador.ativo ? (
                          <CheckCircle2
                            size={15}
                          />
                        ) : (
                          <XCircle
                            size={15}
                          />
                        )}

                        {utilizador.ativo
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </div>

                    <button
                      className={
                        utilizador.ativo
                          ? "button button--secondary"
                          : "button button--primary"
                      }
                      type="button"
                      onClick={() =>
                        alterarEstado(
                          utilizador,
                        )
                      }
                    >
                      {utilizador.ativo
                        ? "Desativar"
                        : "Ativar"}
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Utilizadores;