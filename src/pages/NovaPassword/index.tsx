import {
  CheckCircle2,
  KeyRound,
  Save,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import { supabase } from "../../lib/supabase";
import { obterMensagemErro } from "../../utils/errors";
import "./NovaPassword.css";

function NovaPassword() {
  const navigate = useNavigate();

  const [novaPassword, setNovaPassword] =
    useState("");

  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState("");

  const [
    sessaoRecuperacaoValida,
    setSessaoRecuperacaoValida,
  ] = useState(false);

  const [
    aVerificar,
    setAVerificar,
  ] = useState(true);

  const [aGuardar, setAGuardar] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    let componenteAtivo = true;

    async function verificarSessao() {
      try {
        const {
          data: { session },
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (componenteAtivo) {
          setSessaoRecuperacaoValida(
            Boolean(session),
          );
        }
      } catch (error) {
        if (componenteAtivo) {
          setErro(
            obterMensagemErro(
              error,
              "A ligação de recuperação é inválida ou expirou.",
            ),
          );
        }
      } finally {
        if (componenteAtivo) {
          setAVerificar(false);
        }
      }
    }

    verificarSessao();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (evento, session) => {
          if (
            evento ===
              "PASSWORD_RECOVERY" ||
            session
          ) {
            setSessaoRecuperacaoValida(
              true,
            );

            setAVerificar(false);
          }
        },
      );

    return () => {
      componenteAtivo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function guardarPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (novaPassword.length < 8) {
      setErro(
        "A palavra-passe deve ter pelo menos 8 caracteres.",
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
        "A palavra-passe foi alterada com sucesso.",
      );

      window.setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 1800);
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
    <main className="new-password-page">
      <section className="new-password-card">
        <div className="new-password-logo">
          {sucesso ? (
            <CheckCircle2 size={30} />
          ) : (
            <KeyRound size={30} />
          )}
        </div>

        <div className="new-password-heading">
          <span>EMUSA Sumários</span>

          <h1>
            Definir nova palavra-passe
          </h1>

          <p>
            Escolha uma palavra-passe com,
            pelo menos, oito caracteres.
          </p>
        </div>

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

        {aVerificar ? (
          <p className="muted-text">
            A validar a ligação...
          </p>
        ) : !sessaoRecuperacaoValida ? (
          <div className="new-password-invalid">
            <p>
              A ligação é inválida ou já
              expirou.
            </p>

            <Link
              className="button button--primary"
              to="/recuperar-password"
            >
              Pedir nova ligação
            </Link>
          </div>
        ) : (
          <form
            className="form"
            onSubmit={guardarPassword}
          >
            <div className="form-field">
              <label htmlFor="nova-password">
                Nova palavra-passe
              </label>

              <input
                id="nova-password"
                type="password"
                value={novaPassword}
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                onChange={(event) => {
                  setNovaPassword(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
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
                placeholder="Repita a palavra-passe"
                autoComplete="new-password"
                onChange={(event) => {
                  setConfirmarPassword(
                    event.target.value,
                  );

                  setErro("");
                  setSucesso("");
                }}
              />
            </div>

            <button
              className="button button--primary"
              type="submit"
              disabled={
                aGuardar ||
                Boolean(sucesso)
              }
            >
              <Save size={18} />

              {aGuardar
                ? "A guardar..."
                : "Guardar palavra-passe"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default NovaPassword;