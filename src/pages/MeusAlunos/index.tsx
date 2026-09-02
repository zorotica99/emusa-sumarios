import {
  CalendarDays,
  Clock3,
  GraduationCap,
  School,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import {
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  listarHorarios,
  type Horario,
} from "../../services/horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../services/horariosAlunos.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";

interface AulaDoAluno {
  horario: Horario;
  turmaNome: string;
  disciplinaNome: string;
}

interface AlunoDoProfessor {
  aluno: Aluno;
  aulas: AulaDoAluno[];
}

function MeusAlunos() {
  const { perfil, eAdministrador } = useAuth();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosTurmas, setAlunosTurmas] = useState<AlunoTurma[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horariosAlunos, setHorariosAlunos] = useState<HorarioAluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setACarregar(true);
        setErro("");

        const [
          dadosAlunos,
          dadosAlunosTurmas,
          dadosHorarios,
          dadosHorariosAlunos,
          dadosTurmas,
          dadosDisciplinas,
        ] = await Promise.all([
          listarAlunos(),
          listarAlunosTurmas(),
          listarHorarios(),
          listarHorariosAlunos(),
          listarTurmas(),
          listarDisciplinas(),
        ]);

        setAlunos(dadosAlunos);
        setAlunosTurmas(dadosAlunosTurmas);
        setHorarios(dadosHorarios);
        setHorariosAlunos(dadosHorariosAlunos);
        setTurmas(dadosTurmas);
        setDisciplinas(dadosDisciplinas);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar os seus alunos.",
          ),
        );
      } finally {
        setACarregar(false);
      }
    }

    carregarDados();
  }, []);

  const horariosDoProfessor = useMemo(() => {
    if (
      perfil?.perfil !== "Professor" ||
      !perfil.professor_id
    ) {
      return [];
    }

    return horarios.filter(
      (horario) =>
        horario.professor_id === perfil.professor_id,
    );
  }, [horarios, perfil]);

  function alunoPertenceAoHorario(
    alunoId: string,
    horario: Horario,
  ): boolean {
    if (horario.tipo_aula === "Turma") {
      return alunosTurmas.some(
        (registo) =>
          registo.aluno_id === alunoId &&
          registo.turma_id === horario.turma_id,
      );
    }

    return horariosAlunos.some(
      (registo) =>
        registo.aluno_id === alunoId &&
        registo.horario_id === horario.id,
    );
  }

  function obterTurmaNome(turmaId: string): string {
    return (
      turmas.find((turma) => turma.id === turmaId)?.nome ??
      "Turma"
    );
  }

  function obterDisciplinaNome(
    disciplinaId: string,
  ): string {
    return (
      disciplinas.find(
        (disciplina) => disciplina.id === disciplinaId,
      )?.nome ?? "Disciplina"
    );
  }

  const alunosDoProfessor = useMemo<AlunoDoProfessor[]>(() => {
    return alunos
      .map((aluno) => {
        const aulas = horariosDoProfessor
          .filter((horario) =>
            alunoPertenceAoHorario(aluno.id, horario),
          )
          .map((horario) => ({
            horario,
            turmaNome: obterTurmaNome(horario.turma_id),
            disciplinaNome: obterDisciplinaNome(
              horario.disciplina_id,
            ),
          }))
          .sort((a, b) => {
            const porDia = a.horario.dia_semana.localeCompare(
              b.horario.dia_semana,
            );

            if (porDia !== 0) {
              return porDia;
            }

            return a.horario.hora_inicio.localeCompare(
              b.horario.hora_inicio,
            );
          });

        return {
          aluno,
          aulas,
        };
      })
      .filter((registo) => registo.aulas.length > 0)
      .sort((a, b) =>
        a.aluno.nome.localeCompare(b.aluno.nome),
      );
  }, [
    alunos,
    horariosDoProfessor,
    alunosTurmas,
    horariosAlunos,
    turmas,
    disciplinas,
  ]);

  if (eAdministrador) {
    return (
      <main className="page">
        <PageHeader
          title="Os meus alunos"
          description="Esta página pertence à área do professor."
        />

        <div className="panel">
          <p className="muted-text">
            No perfil de Administrador, utilize a página Alunos ou Relatório por aluno.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader
        title="Os meus alunos"
        description="Alunos das suas turmas, grupos e aulas individuais."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gap: "16px",
        }}
      >
        <div className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <UsersRound size={21} />
                Alunos associados às minhas aulas
              </h2>

              <p className="muted-text">
                Esta página é apenas de consulta. A gestão dos dados dos alunos continua a pertencer ao Administrador.
              </p>
            </div>

            <div
              style={{
                minWidth: "92px",
                textAlign: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--surface-soft, #f4f7fb)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "24px",
                }}
              >
                {aCarregar ? "…" : alunosDoProfessor.length}
              </strong>
              <span className="muted-text">
                alunos
              </span>
            </div>
          </div>
        </div>

        {aCarregar ? (
          <div className="panel">
            <p className="muted-text">
              A carregar os seus alunos...
            </p>
          </div>
        ) : alunosDoProfessor.length === 0 ? (
          <div className="panel">
            <div
              style={{
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "8px",
              }}
            >
              <GraduationCap size={42} />
              <h2 style={{ margin: 0 }}>
                Ainda não tem alunos associados
              </h2>
              <p className="muted-text">
                Os alunos aparecerão aqui automaticamente quando estiverem associados às suas turmas, grupos ou aulas individuais.
              </p>
            </div>
          </div>
        ) : (
          alunosDoProfessor.map(({ aluno, aulas }) => (
            <article
              className="panel"
              key={aluno.id}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--surface-soft, #f4f7fb)",
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={22} />
                </div>

                <div>
                  <h2 style={{ margin: 0 }}>
                    {aluno.nome}
                  </h2>
                  <p className="muted-text">
                    {aulas.length} aula{aulas.length === 1 ? "" : "s"} consigo
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {aulas.map(({ horario, turmaNome, disciplinaNome }) => (
                  <div
                    key={horario.id}
                    style={{
                      display: "grid",
                      gap: "6px",
                      padding: "12px 14px",
                      border: "1px solid var(--border-color, #e3e8ef)",
                      borderRadius: "12px",
                    }}
                  >
                    <strong>
                      {disciplinaNome}
                    </strong>

                    <div
                      className="muted-text"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px 16px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <School size={15} />
                        {turmaNome} · {horario.tipo_aula}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <CalendarDays size={15} />
                        {horario.dia_semana}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Clock3 size={15} />
                        {horario.hora_inicio.slice(0, 5)}–{horario.hora_fim.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default MeusAlunos;
