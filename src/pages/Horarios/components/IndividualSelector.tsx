import SelectField from "../../../components/forms/SelectField";

interface Props {
  alunoId: string;
  opcoes: {
    value: string;
    label: string;
  }[];
  onChange: (valor: string) => void;
}

export default function IndividualSelector({
  alunoId,
  opcoes,
  onChange,
}: Props) {
  return (
    <>
      <p className="lesson-type-info">
        Escolha o aluno. A turma e o instrumento serão preenchidos
        automaticamente através da ficha do aluno.
      </p>

      <SelectField
        id="horario-aluno"
        label="Aluno"
        value={alunoId}
        options={opcoes}
        placeholder="Selecione um aluno"
        onChange={onChange}
      />
    </>
  );
}