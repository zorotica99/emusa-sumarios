import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CalendarOff,
  CheckSquare,
  ClipboardList,
  Clock,
  FileUser,
  GraduationCap,
  Guitar,
  House,
  KeyRound,
  Layers3,
  LogOut,
  Music2,
  School,
  Settings,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  NavLink,
  useLocation,
} from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { obterDadosDashboard } from "../../services/dashboard.service";
import { obterMensagemErro } from "../../utils/errors";

interface MenuItem {
  label: string;
  icon: typeof House;
  path: string;
}

const menuProfessor: MenuItem[] = [
  {
    label: "Dashboard",
    icon: House,
    path: "/",
  },
  {
    label: "Calendário",
    icon: CalendarDays,
    path: "/calendario",
  },
  {
    label: "Sumários",
    icon: ClipboardList,
    path: "/sumarios",
  },
  {
    label: "Presenças",
    icon: CheckSquare,
    path: "/presencas",
  },
  {
    label: "Relatório por aluno",
    icon: FileUser,
    path: "/relatorio-aluno",
  },
];

const menuAdministrador: MenuItem[] = [
  {
    label: "Professores",
    icon: Users,
    path: "/professores",
  },
  {
    label: "Alunos",
    icon: GraduationCap,
    path: "/alunos",
  },
  {
    label: "Instrumentos",
    icon: Guitar,
    path: "/instrumentos",
  },
  {
    label: "Disciplinas",
    icon: BookOpen,
    path: "/disciplinas",
  },
  {
    label: "Níveis",
    icon: Layers3,
    path: "/niveis",
  },
  {
    label: "Turmas",
    icon: School,
    path: "/turmas",
  },
  {
    label: "Horários",
    icon: Clock,
    path: "/horarios",
  },
  {
    label: "Relatórios",
    icon: BarChart3,
    path: "/relatorios",
  },
  {
    label: "Ano letivo",
    icon: CalendarCheck2,
    path: "/ano-letivo",
  },
  {
    label: "Interrupções letivas",
    icon: CalendarOff,
    path: "/interrupcoes-letivas",
  },
  {
    label: "Utilizadores",
    icon: KeyRound,
    path: "/utilizadores",
  },
];

function Sidebar() {
  const location = useLocation();

  const {
    user,
    perfil,
    eAdministrador,
    logout,
  } = useAuth();

  const [
    numeroSumariosEmFalta,
    setNumeroSumariosEmFalta,
  ] = useState(0);

  const [
    aCarregarSumarios,
    setACarregarSumarios,
  ] = useState(false);

  const itens = eAdministrador
    ? [
        menuProfessor[0],
        ...menuAdministrador.slice(0, 7),
        ...menuProfessor.slice(1),
        ...menuAdministrador.slice(7),
      ]
    : menuProfessor;

  const carregarNumeroSumarios =
    useCallback(async () => {
      if (!perfil) {
        setNumeroSumariosEmFalta(0);
        return;
      }

      try {
        setACarregarSumarios(true);

        const professorId =
          perfil.perfil === "Professor"
            ? perfil.professor_id
            : null;

        const dados =
          await obterDadosDashboard(
            professorId,
          );

        setNumeroSumariosEmFalta(
          dados.sumariosEmFalta.length,
        );
      } catch (error) {
        console.error(
          "Não foi possível carregar o número de sumários em falta:",
          error,
        );

        setNumeroSumariosEmFalta(0);
      } finally {
        setACarregarSumarios(false);
      }
    }, [perfil]);

  useEffect(() => {
    carregarNumeroSumarios();
  }, [
    carregarNumeroSumarios,
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    const intervalo = window.setInterval(
      carregarNumeroSumarios,
      60000,
    );

    const atualizarAoVoltar =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          carregarNumeroSumarios();
        }
      };

    document.addEventListener(
      "visibilitychange",
      atualizarAoVoltar,
    );

    return () => {
      window.clearInterval(intervalo);

      document.removeEventListener(
        "visibilitychange",
        atualizarAoVoltar,
      );
    };
  }, [carregarNumeroSumarios]);

  async function terminarSessao() {
    try {
      await logout();
    } catch (error) {
      window.alert(
        obterMensagemErro(
          error,
          "Não foi possível terminar a sessão.",
        ),
      );
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Music2 size={28} />
        </div>

        <div>
          <strong>EMUSA</strong>
          <span>Sumários</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {itens.map(
          ({
            label,
            icon: Icon,
            path,
          }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `sidebar__item ${
                  isActive
                    ? "sidebar__item--active"
                    : ""
                }`
              }
            >
              <Icon size={20} />

              <span>{label}</span>

              {path === "/sumarios" &&
                numeroSumariosEmFalta >
                  0 && (
                  <span
                    title={`${numeroSumariosEmFalta} sumários em falta`}
                    style={{
                      display: "grid",
                      minWidth: "25px",
                      height: "25px",
                      marginLeft: "auto",
                      padding: "0 7px",
                      placeItems: "center",
                      borderRadius: "999px",
                      background: "#f97316",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {numeroSumariosEmFalta >
                    99
                      ? "99+"
                      : numeroSumariosEmFalta}
                  </span>
                )}

              {path === "/sumarios" &&
                aCarregarSumarios &&
                numeroSumariosEmFalta ===
                  0 && (
                  <span
                    title="A atualizar..."
                    style={{
                      width: "7px",
                      height: "7px",
                      marginLeft: "auto",
                      borderRadius: "50%",
                      background: "#94a3b8",
                    }}
                  />
                )}
            </NavLink>
          ),
        )}

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `sidebar__item ${
              isActive
                ? "sidebar__item--active"
                : ""
            }`
          }
        >
          <Settings size={20} />
          <span>Minha conta</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span>
            {perfil?.perfil ??
              "Sessão iniciada"}
          </span>

          <strong>
            {perfil?.nome ??
              user?.email ??
              "Utilizador"}
          </strong>
        </div>

        <button
          className="sidebar__logout"
          type="button"
          onClick={terminarSessao}
        >
          <LogOut size={19} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;