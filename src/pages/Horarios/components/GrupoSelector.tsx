import { UsersRound } from "lucide-react";

interface AlunoGrupo {
  id: string;
  nome: string;
}

interface Props {
  alunos: AlunoGrupo[];
  selecionados: string[];
  descricao: string;
  onToggle: (id: string) => void;
  onSelecionarTodos: () => void;
  onLimpar: () => void;
}

function GrupoSelector({
  alunos,
  selecionados,
  descricao,
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

      {alunos.length === 0 ? (
        <p className="student-selection__empty">
          Não existem alunos com os níveis necessários.
        </p>
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