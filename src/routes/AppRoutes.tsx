import type { ReactNode } from "react";
import {
  Route,
  Routes,
} from "react-router";
import Alunos from "../pages/Alunos";
import AnoLetivo from "../pages/AnoLetivo";
import Calendario from "../pages/Calendario";
import Dashboard from "../pages/Dashboard";
import Disciplinas from "../pages/Disciplinas";
import GruposAutomaticos from "../pages/GruposAutomaticos";
import Horarios from "../pages/Horarios";
import Instrumentos from "../pages/Instrumentos";
import InterrupcoesLetivas from "../pages/InterrupcoesLetivas";
import Login from "../pages/Login";
import Niveis from "../pages/Niveis";
import NotFound from "../pages/NotFound";
import NovaPassword from "../pages/NovaPassword";
import Perfil from "../pages/Perfil";
import Presencas from "../pages/Presencas";
import Professores from "../pages/Professores";
import RecuperarPassword from "../pages/RecuperarPassword";
import RelatorioAluno from "../pages/RelatorioAluno";
import Relatorios from "../pages/Relatorios";
import Sumarios from "../pages/Sumarios";
import Turmas from "../pages/Turmas";
import Utilizadores from "../pages/Utilizadores";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

function proteger(
  elemento: ReactNode,
) {
  return (
    <ProtectedRoute>
      {elemento}
    </ProtectedRoute>
  );
}

function protegerAdministrador(
  elemento: ReactNode,
) {
  return proteger(
    <AdminRoute>
      {elemento}
    </AdminRoute>,
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/recuperar-password"
        element={<RecuperarPassword />}
      />

      <Route
        path="/nova-password"
        element={<NovaPassword />}
      />

      <Route
        path="/"
        element={proteger(
          <Dashboard />,
        )}
      />

      <Route
        path="/calendario"
        element={proteger(
          <Calendario />,
        )}
      />

      <Route
        path="/sumarios"
        element={proteger(
          <Sumarios />,
        )}
      />

      <Route
        path="/presencas"
        element={proteger(
          <Presencas />,
        )}
      />

      <Route
        path="/relatorio-aluno"
        element={proteger(
          <RelatorioAluno />,
        )}
      />

      <Route
        path="/perfil"
        element={proteger(
          <Perfil />,
        )}
      />

      <Route
        path="/professores"
        element={protegerAdministrador(
          <Professores />,
        )}
      />

      <Route
        path="/alunos"
        element={protegerAdministrador(
          <Alunos />,
        )}
      />

      <Route
        path="/instrumentos"
        element={protegerAdministrador(
          <Instrumentos />,
        )}
      />

      <Route
        path="/disciplinas"
        element={protegerAdministrador(
          <Disciplinas />,
        )}
      />

      <Route
        path="/niveis"
        element={protegerAdministrador(
          <Niveis />,
        )}
      />

      <Route
        path="/turmas"
        element={protegerAdministrador(
          <Turmas />,
        )}
      />

      <Route
        path="/horarios"
        element={protegerAdministrador(
          <Horarios />,
        )}
      />

      <Route
        path="/grupos-automaticos"
        element={protegerAdministrador(
          <GruposAutomaticos />,
        )}
      />

      <Route
        path="/relatorios"
        element={protegerAdministrador(
          <Relatorios />,
        )}
      />

      <Route
        path="/ano-letivo"
        element={protegerAdministrador(
          <AnoLetivo />,
        )}
      />

      <Route
        path="/interrupcoes-letivas"
        element={protegerAdministrador(
          <InterrupcoesLetivas />,
        )}
      />

      <Route
        path="/utilizadores"
        element={protegerAdministrador(
          <Utilizadores />,
        )}
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;