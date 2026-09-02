import {
  FilterX,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import type { Horario } from "../../../services/horarios.service";

interface Props {
  horarios: Horario[];
  aCarregar: boolean;
  obterParticipantes: (horario: Horario) => string;
  obterNomeProfessor: (id: string) => string;
  obterNomeTurma: (id: string) => string;
  obterNomeDisciplina: (id: string) => string;
  obterNomeInstrumento: (id: string | null) => string;
  editarHorario: (horario: Horario) => void;
  removerHorario: (horario: Horario) => void;
}

const ordemDias: Record<string, number> = {
  "Segunda-feira": 1,
  "Terça-feira": 2,
  "Quarta-feira": 3,
  "Quinta-feira": 4,
  "Sexta-feira": 5,
  Sábado: 6,
  Domingo: 7,
};

function HorarioTable({
  horarios,
  aCarregar,
  obterParticipantes,
  obterNomeProfessor,
  obterNomeTurma,
  obterNomeDisciplina,
  obterNomeInstrumento,
  editarHorario,
  removerHorario,
}: Props) {
  const [pesquisa, setPesquisa] =
    useState("");

  const [filtroTipo, setFiltroTipo] =
    useState("");

  const [
    filtroProfessor,
    setFiltroProfessor,
  ] = useState("");

  const [filtroTurma, setFiltroTurma] =
    useState("");

  const [
    filtroDisciplina,
    setFiltroDisciplina,
  ] = useState("");

  const [filtroDia, setFiltroDia] =
    useState("");

  const opcoesProfessores = useMemo(() => {
    const mapa = new Map<
      string,
      string
    >();

    horarios.forEach((horario) => {
      mapa.set(
        horario.professor_id,
        obterNomeProfessor(
          horario.professor_id,
        ),
      );
    });

    return Array.from(
      mapa.entries(),
    )
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) =>
        a.nome.localeCompare(b.nome),
      );
  }, [
    horarios,
    obterNomeProfessor,
  ]);

  const opcoesTurmas = useMemo(() => {
    const mapa = new Map<
      string,
      string
    >();

    horarios.forEach((horario) => {
      mapa.set(
        horario.turma_id,
        obterNomeTurma(
          horario.turma_id,
        ),
      );
    });

    return Array.from(
      mapa.entries(),
    )
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) =>
        a.nome.localeCompare(b.nome),
      );
  }, [
    horarios,
    obterNomeTurma,
  ]);

  const opcoesDisciplinas =
    useMemo(() => {
      const mapa = new Map<
        string,
        string
      >();

      horarios.forEach((horario) => {
        mapa.set(
          horario.disciplina_id,
          obterNomeDisciplina(
            horario.disciplina_id,
          ),
        );
      });

      return Array.from(
        mapa.entries(),
      )
        .map(([id, nome]) => ({
          id,
          nome,
        }))
        .sort((a, b) =>
          a.nome.localeCompare(b.nome),
        );
    }, [
      horarios,
      obterNomeDisciplina,
    ]);

  const opcoesDias = useMemo(() => {
    return Array.from(
      new Set(
        horarios.map(
          (horario) =>
            horario.dia_semana,
        ),
      ),
    ).sort(
      (a, b) =>
        (ordemDias[a] ?? 99) -
        (ordemDias[b] ?? 99),
    );
  }, [horarios]);

  const horariosFiltrados = useMemo(
    () => {
      const termo =
        pesquisa
          .trim()
          .toLowerCase();

      return horarios
        .filter((horario) => {
          if (
            filtroTipo &&
            horario.tipo_aula !==
              filtroTipo
          ) {
            return false;
          }

          if (
            filtroProfessor &&
            horario.professor_id !==
              filtroProfessor
          ) {
            return false;
          }

          if (
            filtroTurma &&
            horario.turma_id !==
              filtroTurma
          ) {
            return false;
          }

          if (
            filtroDisciplina &&
            horario.disciplina_id !==
              filtroDisciplina
          ) {
            return false;
          }

          if (
            filtroDia &&
            horario.dia_semana !==
              filtroDia
          ) {
            return false;
          }

          if (!termo) {
            return true;
          }

          const valores = [
            horario.tipo_aula,
            obterParticipantes(
              horario,
            ),
            obterNomeProfessor(
              horario.professor_id,
            ),
            obterNomeTurma(
              horario.turma_id,
            ),
            obterNomeDisciplina(
              horario.disciplina_id,
            ),
            obterNomeInstrumento(
              horario.instrumento_id,
            ),
            horario.dia_semana,
            horario.hora_inicio.slice(
              0,
              5,
            ),
            horario.hora_fim.slice(
              0,
              5,
            ),
          ];

          return valores.some(
            (valor) =>
              valor
                .toLowerCase()
                .includes(termo),
          );
        })
        .sort((a, b) => {
          const ordemDiaA =
            ordemDias[
              a.dia_semana
            ] ?? 99;

          const ordemDiaB =
            ordemDias[
              b.dia_semana
            ] ?? 99;

          if (
            ordemDiaA !==
            ordemDiaB
          ) {
            return (
              ordemDiaA -
              ordemDiaB
            );
          }

          return a.hora_inicio.localeCompare(
            b.hora_inicio,
          );
        });
    },
    [
      horarios,
      pesquisa,
      filtroTipo,
      filtroProfessor,
      filtroTurma,
      filtroDisciplina,
      filtroDia,
      obterParticipantes,
      obterNomeProfessor,
      obterNomeTurma,
      obterNomeDisciplina,
      obterNomeInstrumento,
    ],
  );

  const horariosPorDia = useMemo(
    () => {
      const grupos = new Map<
        string,
        Horario[]
      >();

      horariosFiltrados.forEach(
        (horario) => {
          const atuais =
            grupos.get(
              horario.dia_semana,
            ) ?? [];

          atuais.push(horario);

          grupos.set(
            horario.dia_semana,
            atuais,
          );
        },
      );

      return Array.from(
        grupos.entries(),
      ).sort(
        ([diaA], [diaB]) =>
          (ordemDias[diaA] ??
            99) -
          (ordemDias[diaB] ??
            99),
      );
    },
    [horariosFiltrados],
  );

  const existemFiltros =
    Boolean(
      pesquisa ||
        filtroTipo ||
        filtroProfessor ||
        filtroTurma ||
        filtroDisciplina ||
        filtroDia,
    );

  function limparFiltros() {
    setPesquisa("");
    setFiltroTipo("");
    setFiltroProfessor("");
    setFiltroTurma("");
    setFiltroDisciplina("");
    setFiltroDia("");
  }

  if (aCarregar) {
    return (
      <p className="muted-text">
        A carregar...
      </p>
    );
  }

  if (horarios.length === 0) {
    return (
      <p className="muted-text">
        Ainda não existem horários.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div className="form-field">
          <label htmlFor="horarios-pesquisa">
            Procurar
          </label>

          <div
            style={{
              position: "relative",
            }}
          >
            <Search
              size={17}
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                opacity: 0.55,
              }}
            />

            <input
              id="horarios-pesquisa"
              type="search"
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(
                  event.target.value,
                )
              }
              placeholder="Professor, turma, disciplina..."
              style={{
                paddingLeft: "36px",
              }}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="horarios-tipo">
            Tipo
          </label>

          <select
            id="horarios-tipo"
            value={filtroTipo}
            onChange={(event) =>
              setFiltroTipo(
                event.target.value,
              )
            }
          >
            <option value="">
              Todos
            </option>

            <option value="Individual">
              Individual
            </option>

            <option value="Turma">
              Turma
            </option>

            <option value="Grupo">
              Grupo
            </option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="horarios-professor">
            Professor
          </label>

          <select
            id="horarios-professor"
            value={filtroProfessor}
            onChange={(event) =>
              setFiltroProfessor(
                event.target.value,
              )
            }
          >
            <option value="">
              Todos
            </option>

            {opcoesProfessores.map(
              (professor) => (
                <option
                  key={
                    professor.id
                  }
                  value={
                    professor.id
                  }
                >
                  {
                    professor.nome
                  }
                </option>
              ),
            )}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="horarios-turma">
            Turma / grupo
          </label>

          <select
            id="horarios-turma"
            value={filtroTurma}
            onChange={(event) =>
              setFiltroTurma(
                event.target.value,
              )
            }
          >
            <option value="">
              Todos
            </option>

            {opcoesTurmas.map(
              (turma) => (
                <option
                  key={turma.id}
                  value={turma.id}
                >
                  {turma.nome}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="horarios-disciplina">
            Disciplina
          </label>

          <select
            id="horarios-disciplina"
            value={
              filtroDisciplina
            }
            onChange={(event) =>
              setFiltroDisciplina(
                event.target.value,
              )
            }
          >
            <option value="">
              Todas
            </option>

            {opcoesDisciplinas.map(
              (disciplina) => (
                <option
                  key={
                    disciplina.id
                  }
                  value={
                    disciplina.id
                  }
                >
                  {
                    disciplina.nome
                  }
                </option>
              ),
            )}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="horarios-dia">
            Dia
          </label>

          <select
            id="horarios-dia"
            value={filtroDia}
            onChange={(event) =>
              setFiltroDia(
                event.target.value,
              )
            }
          >
            <option value="">
              Todos
            </option>

            {opcoesDias.map(
              (dia) => (
                <option
                  key={dia}
                  value={dia}
                >
                  {dia}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <span className="muted-text">
          {horariosFiltrados.length}{" "}
          horário
          {horariosFiltrados.length ===
          1
            ? ""
            : "s"}
          {existemFiltros
            ? " encontrado(s)"
            : " no total"}
        </span>

        {existemFiltros && (
          <button
            className="button button--secondary"
            type="button"
            onClick={limparFiltros}
          >
            <FilterX size={17} />
            Limpar filtros
          </button>
        )}
      </div>

      {horariosFiltrados.length ===
      0 ? (
        <p className="muted-text">
          Não foram encontrados
          horários com estes filtros.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {horariosPorDia.map(
            ([dia, horariosDia]) => (
              <section
                key={dia}
                style={{
                  border:
                    "1px solid var(--border-color, #e5e7eb)",
                  borderRadius:
                    "14px",
                  overflow: "hidden",
                }}
              >
                <header
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "12px",
                    padding:
                      "13px 16px",
                    background:
                      "rgba(37, 99, 235, 0.06)",
                  }}
                >
                  <strong>{dia}</strong>

                  <span className="muted-text">
                    {
                      horariosDia.length
                    }{" "}
                    horário
                    {horariosDia.length ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </header>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>
                          Turma / grupo
                        </th>
                        <th>
                          Disciplina
                        </th>
                        <th>
                          Professor
                        </th>
                        <th>
                          Participantes
                        </th>
                        <th>
                          Instrumento
                        </th>

                        <th className="data-table__actions">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {horariosDia.map(
                        (horario) => (
                          <tr
                            key={
                              horario.id
                            }
                          >
                            <td>
                              <strong>
                                {horario.hora_inicio.slice(
                                  0,
                                  5,
                                )}
                              </strong>

                              {" – "}

                              {horario.hora_fim.slice(
                                0,
                                5,
                              )}
                            </td>

                            <td>
                              <span className="lesson-type-badge">
                                {
                                  horario.tipo_aula
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                {obterNomeTurma(
                                  horario.turma_id,
                                )}
                              </strong>
                            </td>

                            <td>
                              {obterNomeDisciplina(
                                horario.disciplina_id,
                              )}
                            </td>

                            <td>
                              {obterNomeProfessor(
                                horario.professor_id,
                              )}
                            </td>

                            <td>
                              {obterParticipantes(
                                horario,
                              )}
                            </td>

                            <td>
                              {obterNomeInstrumento(
                                horario.instrumento_id,
                              )}
                            </td>

                            <td className="data-table__actions">
                              <button
                                className="icon-button"
                                type="button"
                                title="Editar"
                                onClick={() =>
                                  editarHorario(
                                    horario,
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    18
                                  }
                                />
                              </button>

                              <button
                                className="icon-button icon-button--danger"
                                type="button"
                                title="Eliminar"
                                onClick={() =>
                                  removerHorario(
                                    horario,
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    18
                                  }
                                />
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default HorarioTable;