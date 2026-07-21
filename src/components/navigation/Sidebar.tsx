import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarOff,
  CalendarRange,
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
  Menu,
  Music2,
  School,
  Settings,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  NavLink,
  useLocation,
} from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { obterDadosDashboard } from "../../services/dashboard.service";
import { obterMensagemErro } from "../../utils/errors";
import "./MobileNavigation.css";

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
    label: "Grupos automáticos",
    icon: UsersRound,
    path: "/grupos-automaticos",
  },
  {
    label: "Relatórios",
    icon: BarChart3,
    path: "/relatorios",
  },
  {
    label: "Anos letivos",
    icon: CalendarRange,
    path: "/anos-letivos",
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

  const [menuAberto, setMenuAberto] =
    useState(false);

  const [
    numeroSumariosEmFalta,
    setNumeroSumariosEmFalta,
  ] = useState(0);

  const [
    aCarregarSumarios,
    setACarregarSumarios,
  ] = useState(false);

  const itens = useMemo(
    () =>
      eAdministrador
        ? [
            menuProfessor[0],

            ...menuAdministrador.slice(
              0,
              8,
            ),

            ...menuProfessor.slice(1),

            ...menuAdministrador.slice(
              8,
            ),
          ]
        : menuProfessor,
    [eAdministrador],
  );

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
          "Não foi possível carregar os sumários em falta:",
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
    setMenuAberto(false);
  }, [
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    const intervalo =
      window.setInterval(
        carregarNumeroSumarios,
        60000,
      );

    function atualizarAoVoltar() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        carregarNumeroSumarios();
      }
    }

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

  useEffect(() => {
    document.body.style.overflow =
      menuAberto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

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

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <>
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={
          menuAberto
            ? "Fechar menu"
            : "Abrir menu"
        }
        aria-expanded={menuAberto}
        onClick={() =>
          setMenuAberto(
            (estadoAtual) =>
              !estadoAtual,
          )
        }
      >
        {menuAberto ? (
          <X size={23} />
        ) : (
          <Menu size={23} />
        )}
      </button>

      {menuAberto && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Fechar menu"
          onClick={fecharMenu}
        />
      )}

      <aside
        className={`sidebar ${
          menuAberto
            ? "sidebar--open"
            : ""
        }`}
      >
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
                onClick={fecharMenu}
                className={({
                  isActive,
                }) =>
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
                    <span className="sidebar__badge">
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
                    <span className="sidebar__loading-dot" />
                  )}
              </NavLink>
            ),
          )}

          <NavLink
            to="/perfil"
            onClick={fecharMenu}
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
    </>
  );
}

export default Sidebar;