import type { FormEvent } from "react";
import SelectField from "../../../components/forms/SelectField";
import type {
  Horario,
  TipoAula,
} from "../../../services/horarios.service";
import GrupoSelector from "./GrupoSelector";
import IndividualSelector from "./IndividualSelector";

interface Opcao {
  value: string;
  label: string;
}

interface AlunoDisponivel {
  id: string;
  nome: string;
}

export interface HorarioFormData {
  tipoAula: TipoAula;
  professorId: string;
  turmaId: string;
  disciplinaId: string;
  instrumentoId: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
}

interface Props {
  formulario: HorarioFormData;

  opcoesTipoAula: Opcao[];
  opcoesProfessores: Opcao[];
  opcoesTurmas: Opcao[];
  opcoesDisciplinas: Opcao[];
  opcoesInstrumentos: Opcao[];
  opcoesDias: Opcao[];
  opcoesAlunos: Opcao[];

  alunosDisponiveisGrupo: AlunoDisponivel[];
  descricaoGrupo: string;

  alunoIndividualId: string;
  alunoIdsGrupo: string[];

  aGuardar: boolean;
  horarioEmEdicao: Horario | null;

  alterarTipoAula: (valor: string) => void;

  alterarCampo: (
    campo: keyof HorarioFormData,
    valor: string,
  ) => void;

  alterarProfessor: (valor: string) => void;
  alterarDisciplina: (valor: string) => void;
  selecionarAlunoIndividual: (id: string) => void;
  alternarAlunoDoGrupo: (id: string) => void;
  selecionarTodosAlunosGrupo: () => void;
  limparAlunosGrupo: () => void;

  guardarHorario: (
    event: FormEvent<HTMLFormElement>,
  ) => void;

  cancelarEdicao: () => void;
}

function HorarioForm({
  formulario,
  opcoesTipoAula,
  opcoesProfessores,
  opcoesTurmas,
  opcoesDisciplinas,
  opcoesInstrumentos,
  opcoesDias,
  opcoesAlunos,
  alunosDisponiveisGrupo,
  descricaoGrupo,
  alunoIndividualId,
  alunoIdsGrupo,
  aGuardar,
  horarioEmEdicao,
  alterarTipoAula,
  alterarCampo,
  alterarProfessor,
  alterarDisciplina,
  selecionarAlunoIndividual,
  alternarAlunoDoGrupo,
  selecionarTodosAlunosGrupo,
  limparAlunosGrupo,
  guardarHorario,
  cancelarEdicao,
}: Props) {
  return (
    <form className="form" onSubmit={guardarHorario}>
      <SelectField
        id="horario-tipo"
        label="Tipo de aula"
        value={formulario.tipoAula}
        options={opcoesTipoAula}
        placeholder="Selecione o tipo de aula"
        onChange={alterarTipoAula}
      />

      {formulario.tipoAula === "Individual" && (
        <IndividualSelector
          alunoId={alunoIndividualId}
          opcoes={opcoesAlunos}
          onChange={selecionarAlunoIndividual}
        />
      )}

      {formulario.tipoAula === "Turma" && (
        <p className="lesson-type-info">
          Todos os alunos associados à turma serão incluídos
          automaticamente.
        </p>
      )}

      {formulario.tipoAula === "Grupo" && (
        <p className="lesson-type-info">
          Na Orquestra e na Classe de Conjunto, os alunos são
          selecionados automaticamente através dos níveis.
        </p>
      )}

      <SelectField
        id="horario-turma"
        label={
          formulario.tipoAula === "Grupo"
            ? "Turma de referência"
            : "Turma"
        }
        value={formulario.turmaId}
        options={opcoesTurmas}
        placeholder="Selecione uma turma"
        disabled={formulario.tipoAula === "Individual"}
        onChange={(valor) =>
          alterarCampo("turmaId", valor)
        }
      />

      <SelectField
        id="horario-professor"
        label="Professor"
        value={formulario.professorId}
        options={opcoesProfessores}
        placeholder="Selecione um professor"
        onChange={alterarProfessor}
      />

      <SelectField
        id="horario-disciplina"
        label="Disciplina"
        value={formulario.disciplinaId}
        options={opcoesDisciplinas}
        placeholder="Selecione uma disciplina"
        onChange={alterarDisciplina}
      />

      {formulario.tipoAula === "Grupo" &&
        formulario.disciplinaId && (
          <GrupoSelector
            alunos={alunosDisponiveisGrupo}
            selecionados={alunoIdsGrupo}
            descricao={descricaoGrupo}
            onToggle={alternarAlunoDoGrupo}
            onSelecionarTodos={
              selecionarTodosAlunosGrupo
            }
            onLimpar={limparAlunosGrupo}
          />
        )}

      <SelectField
        id="horario-instrumento"
        label={
          formulario.tipoAula === "Individual"
            ? "Instrumento"
            : "Instrumento opcional"
        }
        value={formulario.instrumentoId}
        options={opcoesInstrumentos}
        placeholder={
          formulario.tipoAula === "Individual"
            ? "Selecione um instrumento"
            : "Sem instrumento específico"
        }
        onChange={(valor) =>
          alterarCampo("instrumentoId", valor)
        }
      />

      <SelectField
        id="horario-dia"
        label="Dia da semana"
        value={formulario.diaSemana}
        options={opcoesDias}
        placeholder="Selecione o dia da semana"
        onChange={(valor) =>
          alterarCampo("diaSemana", valor)
        }
      />

      <div className="form-field">
        <label htmlFor="horario-hora-inicio">
          Hora de início
        </label>

        <input
          id="horario-hora-inicio"
          type="time"
          value={formulario.horaInicio}
          onChange={(event) =>
            alterarCampo(
              "horaInicio",
              event.target.value,
            )
          }
        />
      </div>

      <div className="form-field">
        <label htmlFor="horario-hora-fim">
          Hora de fim
        </label>

        <input
          id="horario-hora-fim"
          type="time"
          value={formulario.horaFim}
          onChange={(event) =>
            alterarCampo(
              "horaFim",
              event.target.value,
            )
          }
        />
      </div>

      <div className="form-actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={aGuardar}
        >
          {aGuardar
            ? "A guardar..."
            : horarioEmEdicao
              ? "Guardar alterações"
              : "Adicionar horário"}
        </button>

        {horarioEmEdicao && (
          <button
            className="button button--secondary"
            type="button"
            onClick={cancelarEdicao}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default HorarioForm;