import { Pencil, Trash2 } from "lucide-react";
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
  if (aCarregar) {
    return <p className="muted-text">A carregar...</p>;
  }

  if (horarios.length === 0) {
    return (
      <p className="muted-text">
        Ainda não existem horários.
      </p>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Participantes</th>
            <th>Professor</th>
            <th>Turma</th>
            <th>Disciplina</th>
            <th>Instrumento</th>
            <th>Dia</th>
            <th>Hora</th>
            <th className="data-table__actions">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {horarios.map((horario) => (
            <tr key={horario.id}>
              <td>
                <span className="lesson-type-badge">
                  {horario.tipo_aula}
                </span>
              </td>

              <td>{obterParticipantes(horario)}</td>

              <td>
                {obterNomeProfessor(horario.professor_id)}
              </td>

              <td>{obterNomeTurma(horario.turma_id)}</td>

              <td>
                {obterNomeDisciplina(
                  horario.disciplina_id,
                )}
              </td>

              <td>
                {obterNomeInstrumento(
                  horario.instrumento_id,
                )}
              </td>

              <td>{horario.dia_semana}</td>

              <td>
                {horario.hora_inicio.slice(0, 5)}
                {" – "}
                {horario.hora_fim.slice(0, 5)}
              </td>

              <td className="data-table__actions">
                <button
                  className="icon-button"
                  type="button"
                  title="Editar"
                  onClick={() => editarHorario(horario)}
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="icon-button icon-button--danger"
                  type="button"
                  title="Eliminar"
                  onClick={() => removerHorario(horario)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HorarioTable;