import {
  KeyRound,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { obterMensagemErro } from "../../utils/errors";
import "./Perfil.css";

function Perfil() {
  const {
    user,
    perfil,
  } = useAuth();

  const [novaPassword, setNovaPassword] =
    useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [aGuardar, setAGuardar] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function alterarPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (novaPassword.length < 8) {
      setErro(
        "A nova palavra-passe deve ter pelo menos 8 caracteres.",
      );

      return;
    }

    if (
      novaPassword !==
      confirmarPassword
    ) {
      setErro(
        "As palavras-passe não coincidem.",
      );

      return;
    }

    try {
      setAGuardar(true);

      const { error } =
        await supabase.auth.updateUser({
          password: novaPassword,
        });

      if (error) {
        throw error;
      }

      setNovaPassword("");
      setConfirmarPassword("");

      setSucesso(
        "Palavra-passe alterada com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível alterar a palavra-passe.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Minha conta"
        description="Consultar os dados da conta e alterar a palavra-passe."
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

      <section className="profile-layout">
        <article className="panel profile-card">
          <div className="profile-card__icon">
            <UserRound size={34} />
          </div>

          <div>
            <span>Nome</span>

            <strong>
              {perfil?.nome ??
                "Utilizador"}
            </strong>
          </div>

          <div>
            <span>Email</span>

            <strong>
              {user?.email ?? "—"}
            </strong>
          </div>

          <div>
            <span>Perfil</span>

            <strong className="profile-role">
              <ShieldCheck size={17} />

              {perfil?.perfil ?? "—"}
            </strong>
          </div>

          {perfil?.perfil ===
            "Professor" && (
            <div>
              <span>
                Professor associado
              </span>

              <strong>
                {perfil.professor_id
                  ? "Conta associada"
                  : "Sem associação"}
              </strong>
            </div>
          )}
        </article>

        <article className="panel">
          <h2 className="profile-section-title">
            <KeyRound size={21} />
            Alterar palavra-passe
          </h2>

          <form
            className="form"
            onSubmit={alterarPassword}
          >
            <div className="form-field">
              <label htmlFor="nova-password">
                Nova palavra-passe
              </label>

              <input
                id="nova-password"
                type="password"
                value={novaPassword}
                onChange={(event) => {
                  setNovaPassword(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmar-password">
                Confirmar palavra-passe
              </label>

              <input
                id="confirmar-password"
                type="password"
                value={confirmarPassword}
                onChange={(event) => {
                  setConfirmarPassword(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
                placeholder="Repita a nova palavra-passe"
                autoComplete="new-password"
              />
            </div>

            <button
              className="button button--primary"
              type="submit"
              disabled={aGuardar}
            >
              <Save size={18} />

              {aGuardar
                ? "A guardar..."
                : "Alterar palavra-passe"}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}

export default Perfil;