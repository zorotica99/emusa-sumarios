import { Plus } from "lucide-react";
import SelectField from "../../components/forms/SelectField";
import type { ProfessorFormProps } from "./types";

function ProfessorForm({
  dados,
  instrumentos,
  aGuardar,
  emEdicao,
  onChange,
  onSubmit,
  onCancel,
}: ProfessorFormProps) {
  const opcoesInstrumentos = instrumentos.map((instrumento) => ({
    value: instrumento.id,
    label: instrumento.nome,
  }));

  return (
    <div className="panel">
      <h2>{emEdicao ? "Editar professor" : "Novo professor"}</h2>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-field">
          <label htmlFor="professor-nome">Nome</label>

          <input
            id="professor-nome"
            type="text"
            value={dados.nome}
            onChange={(event) => onChange("nome", event.target.value)}
            placeholder="Nome do professor"
          />
        </div>

        <div className="form-field">
          <label htmlFor="professor-email">Email</label>

          <input
            id="professor-email"
            type="email"
            value={dados.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="exemplo@email.com"
          />
        </div>

        <div className="form-field">
          <label htmlFor="professor-telemovel">Telemóvel</label>

          <input
            id="professor-telemovel"
            type="text"
            value={dados.telemovel}
            onChange={(event) => onChange("telemovel", event.target.value)}
            placeholder="Número de telemóvel"
          />
        </div>

        <SelectField
          id="professor-instrumento"
          label="Instrumento"
          value={dados.instrumentoId}
          options={opcoesInstrumentos}
          placeholder="Selecione um instrumento"
          onChange={(valor) => onChange("instrumentoId", valor)}
        />

        <div className="form-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={aGuardar}
          >
            <Plus size={18} />

            {aGuardar
              ? "A guardar..."
              : emEdicao
                ? "Guardar alterações"
                : "Adicionar professor"}
          </button>

          {emEdicao && (
            <button
              className="button button--secondary"
              type="button"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfessorForm;