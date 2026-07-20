import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__card">
        <span className="not-found__code">404</span>

        <h1>Página não encontrada</h1>

        <p>
          A página que procuras não existe ou foi movida.
        </p>

        <Link className="button button--primary" to="/">
          <ArrowLeft size={18} />
          Voltar ao Dashboard
        </Link>
      </div>
    </main>
  );
}

export default NotFound;