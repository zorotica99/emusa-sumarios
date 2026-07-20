import { LockKeyhole, LogIn, Music2 } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { obterMensagemErro } from "../../utils/errors";

function Login() {
  const { login, session } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aEntrar, setAEntrar] = useState(false);
  const [erro, setErro] = useState("");

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function submeter(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErro("Preencha o email e a palavra-passe.");
      return;
    }

    try {
      setAEntrar(true);
      setErro("");

      await login(email.trim(), password);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível iniciar sessão.",
        ),
      );
    } finally {
      setAEntrar(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__logo">
          <Music2 size={32} />
        </div>

        <div className="login-card__header">
          <h1>EMUSA Sumários</h1>
          <p>Inicie sessão para entrar na aplicação.</p>
        </div>

        {erro && <div className="alert alert--error">{erro}</div>}

        <form className="form" onSubmit={submeter}>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@emusa.pt"
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Palavra-passe</label>

            <div className="login-password">
              <LockKeyhole size={18} />

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Palavra-passe"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            className="button button--primary login-button"
            type="submit"
            disabled={aEntrar}
          >
            <LogIn size={18} />

            {aEntrar ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;