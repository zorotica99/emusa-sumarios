import {
  CheckCircle2,
  UsersRound,
} from "lucide-react";

interface AlunoGrupo {
  id: string;
  nome: string;
}

interface Props {
  alunos: AlunoGrupo[];
  selecionados: string[];
  descricao: string;
  automatico: boolean;
  aCarregar?: boolean;
  onToggle: (id: string) => void;
  onSelecionarTodos: () => void;
  onLimpar: () => void;
}

function GrupoSelector({
  alunos,
  selecionados,
  descricao,
  automatico,
  aCarregar = false,
  onToggle,
  onSelecionarTodos,
  onLimpar,
}: Props) {
  return (
    <section className="student-selection">
      <header className="student-selection__header">
        <div>
          <h3>
            <UsersRound size={18} />
            Participantes
          </h3>

          <p>{descricao}</p>
        </div>

        <span className="student-selection__counter">
          {selecionados.length}
        </span>
      </header>

      {aCarregar ? (
        <p className="student-selection__empty">
          A carregar participantes...
        </p>
      ) : alunos.length === 0 ? (
        <p className="student-selection__empty">
          Não existem alunos disponíveis.
        </p>
      ) : automatico ? (
        <>
          <div className="lesson-type-info">
            Os participantes são atualizados automaticamente
            através dos níveis e das exceções configuradas.
          </div>

          <div className="student-selection__list">
            {alunos.map((aluno) => (
              <div
                className="student-selection__row"
                key={aluno.id}
              >
                <CheckCircle2
                  size={18}
                  className="automatic-student-check"
                />

                <span>{aluno.nome}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="attendance-quick-actions">
            <button
              type="button"
              onClick={onSelecionarTodos}
            >
              Selecionar todos
            </button>

            <button
              type="button"
              onClick={onLimpar}
            >
              Limpar seleção
            </button>
          </div>

          <div className="student-selection__list">
            {alunos.map((aluno) => (
              <label
                className="student-selection__row"
                key={aluno.id}
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(
                    aluno.id,
                  )}
                  onChange={() =>
                    onToggle(aluno.id)
                  }
                />

                <span>{aluno.nome}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default GrupoSelector;