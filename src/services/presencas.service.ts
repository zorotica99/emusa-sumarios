import { supabase } from "../lib/supabase";

export type EstadoPresenca =
  | "Presente"
  | "Falta"
  | "Falta justificada";

export interface Presenca {
  id: string;
  horario_id: string;
  aluno_id: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string | null;
}

export interface GuardarPresencaData {
  horarioId: string;
  alunoId: string;
  data: string;
  estado: EstadoPresenca;
  observacoes: string;
}

export interface PresencaEmLote {
  alunoId: string;
  estado: EstadoPresenca;
  observacoes?: string;
}

const camposPresenca = `
  id,
  horario_id,
  aluno_id,
  data,
  estado,
  observacoes
`;

function validarEstado(
  estado: EstadoPresenca,
): void {
  const estadosValidos: EstadoPresenca[] = [
    "Presente",
    "Falta",
    "Falta justificada",
  ];

  if (!estadosValidos.includes(estado)) {
    throw new Error(
      "Estado de presença inválido.",
    );
  }
}

function validarPresenca(
  dados: GuardarPresencaData,
): void {
  if (!dados.horarioId.trim()) {
    throw new Error(
      "Selecione um horário.",
    );
  }

  if (!dados.alunoId.trim()) {
    throw new Error(
      "Selecione um aluno.",
    );
  }

  if (!dados.data.trim()) {
    throw new Error(
      "Selecione uma data.",
    );
  }

  validarEstado(dados.estado);
}

export async function listarPresencas(): Promise<
  Presenca[]
> {
  const { data, error } = await supabase
    .from("presencas")
    .select(camposPresenca)
    .order("data", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Presenca[];
}

export async function listarPresencasDaAula(
  horarioId: string,
  dataAula: string,
): Promise<Presenca[]> {
  if (
    !horarioId.trim() ||
    !dataAula.trim()
  ) {
    return [];
  }

  const { data, error } = await supabase
    .from("presencas")
    .select(camposPresenca)
    .eq("horario_id", horarioId)
    .eq("data", dataAula)
    .order("aluno_id", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Presenca[];
}

export async function guardarPresencasEmLote(
  horarioId: string,
  dataAula: string,
  presencas: PresencaEmLote[],
): Promise<void> {
  if (!horarioId.trim()) {
    throw new Error(
      "Selecione um horário.",
    );
  }

  if (!dataAula.trim()) {
    throw new Error(
      "Selecione uma data.",
    );
  }

  if (presencas.length === 0) {
    throw new Error(
      "Esta aula não tem alunos associados.",
    );
  }

  const alunosUnicos = new Set(
    presencas.map(
      (presenca) => presenca.alunoId,
    ),
  );

  if (
    alunosUnicos.size !==
    presencas.length
  ) {
    throw new Error(
      "Existem alunos repetidos na lista de presenças.",
    );
  }

  const registos = presencas.map(
    (presenca) => {
      if (!presenca.alunoId.trim()) {
        throw new Error(
          "Foi encontrado um aluno inválido.",
        );
      }

      validarEstado(presenca.estado);

      return {
        horario_id: horarioId,
        aluno_id: presenca.alunoId,
        data: dataAula,
        estado: presenca.estado,
        observacoes:
          presenca.observacoes?.trim() ||
          null,
      };
    },
  );

  const { error } = await supabase
    .from("presencas")
    .upsert(registos, {
      onConflict:
        "horario_id,data,aluno_id",
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function criarPresenca(
  dados: GuardarPresencaData,
): Promise<Presenca> {
  validarPresenca(dados);

  const { data, error } = await supabase
    .from("presencas")
    .insert({
      horario_id: dados.horarioId,
      aluno_id: dados.alunoId,
      data: dados.data,
      estado: dados.estado,
      observacoes:
        dados.observacoes.trim() ||
        null,
    })
    .select(camposPresenca)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe uma presença deste aluno para este horário e data.",
      );
    }

    throw new Error(error.message);
  }

  return data as Presenca;
}

export async function atualizarPresenca(
  id: string,
  dados: GuardarPresencaData,
): Promise<Presenca> {
  if (!id.trim()) {
    throw new Error(
      "Presença inválida.",
    );
  }

  validarPresenca(dados);

  const { data, error } = await supabase
    .from("presencas")
    .update({
      horario_id: dados.horarioId,
      aluno_id: dados.alunoId,
      data: dados.data,
      estado: dados.estado,
      observacoes:
        dados.observacoes.trim() ||
        null,
    })
    .eq("id", id)
    .select(camposPresenca)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Presenca;
}

export async function eliminarPresenca(
  id: string,
): Promise<void> {
  if (!id.trim()) {
    throw new Error(
      "Presença inválida.",
    );
  }

  const { error } = await supabase
    .from("presencas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}