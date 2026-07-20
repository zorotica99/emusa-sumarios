import type { Instrumento } from "../../services/instrumentos.service";
import type { Professor } from "../../services/professores.service";

export interface ProfessorFormData {
  nome: string;
  email: string;
  telemovel: string;
  instrumentoId: string;
}

export interface ProfessorFormProps {
  dados: ProfessorFormData;
  instrumentos: Instrumento[];
  aGuardar: boolean;
  emEdicao: boolean;
  onChange: (campo: keyof ProfessorFormData, valor: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface ProfessorTableProps {
  professores: Professor[];
  instrumentos: Instrumento[];
  aCarregar: boolean;
  onEdit: (professor: Professor) => void;
  onDelete: (professor: Professor) => void;
}