import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";
import { obterMensagemErro } from "../../utils/errors";
import "./RecuperarPassword.css";

function RecuperarPassword() {
  const [email, setEmail] =
    useState("");

  const [aEnviar, setAEnviar] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function enviarLigacao(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const emailLimpo =
      email.trim().toLowerCase();

    if (!emailLimpo) {
      setErro(
        "Introduza o endereço de email.",
      );

      return;
    }

    try {
      setAEnviar(true);
      setErro("");
      setSucesso("");

      const redirectTo =
        `${window.location.origin}/nova-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          emailLimpo,
          {
            redirectTo,
          },
        );

      if (error) {
        throw error;
      }

      setSucesso(
        "Enviámos uma ligação para alterar a palavra-passe. Verifique também a pasta de spam.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível enviar a ligação de recuperação.",
        ),
      );
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <main className="password-recovery-page">
      <section className="password-recovery-card">
        <div className="password-recovery-logo">
          <Mail size={30} />
        </div>

        <div className="password-recovery-heading">
          <span>EMUSA Sumários</span>

          <h1>
            Recuperar palavra-passe
          </h1>

          <p>
            Introduza o email da sua conta.
            Receberá uma ligação para definir
            uma nova palavra-passe.
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

        <form
          className="form"
          onSubmit={enviarLigacao}
        >
          <div className="form-field">
            <label htmlFor="recuperar-email">
              Email
            </label>

            <input
              id="recuperar-email"
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

          <button
            className="button button--primary"
            type="submit"
            disabled={aEnviar}
          >
            <Send size={18} />

            {aEnviar
              ? "A enviar..."
              : "Enviar ligação"}
          </button>
        </form>

        <Link
          className="password-recovery-back"
          to="/login"
        >
          <ArrowLeft size={17} />
          Voltar ao início de sessão
        </Link>
      </section>
    </main>
  );
}

export default RecuperarPassword;