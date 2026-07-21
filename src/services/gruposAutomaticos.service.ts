import { supabase } from "../lib/supabase";
import {
  listarAlunos,
  type Aluno,
} from "./alunos.service";
import {
  listarAlunosPerfis,
  type AlunoPerfil,
} from "./alunosPerfis.service";
import {
  listarNiveis,
  type Nivel,
} from "./niveis.service";

export type TipoExcecaoGrupo =
  | "Incluir"
  | "Excluir";

export interface GrupoAutomatico {
  id: string;
  nome: string;
  disciplina_id: string | null;
  nivel_minimo_ordem: number;
  nivel_maximo_ordem: number;
  ativo: boolean;
}

export interface GrupoAutomaticoExcecao {
  id: string;
  grupo_id: string;
  aluno_id: string;
  tipo: TipoExcecaoGrupo;
}

export interface AlunoGrupoAutomatico {
  aluno: Aluno;
  perfil: AlunoPerfil | null;
  nivel: Nivel | null;
  ordemNivel: number | null;
  incluidoAutomaticamente: boolean;
  excecao: TipoExcecaoGrupo | null;
  participa: boolean;
}

const camposGrupo = `
  id,
  nome,
  disciplina_id,
  nivel_minimo_ordem,
  nivel_maximo_ordem,
  ativo
`;

const camposExcecao = `
  id,
  grupo_id,
  aluno_id,
  tipo
`;

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function obterOrdemNivel(
  nomeNivel: string,
): number | null {
  const nome = normalizarTexto(nomeNivel);

  if (nome.includes("minion")) {
    return 0;
  }

  const correspondencia = nome.match(/\d+/);

  if (!correspondencia) {
    return null;
  }

  const numero = Number(correspondencia[0]);

  return Number.isFinite(numero)
    ? numero
    : null;
}

export async function listarGruposAutomaticos(): Promise<
  GrupoAutomatico[]
> {
  const { data, error } = await supabase
    .from("grupos_automaticos")
    .select(camposGrupo)
    .order("nome", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GrupoAutomatico[];
}

export async function obterGrupoAutomaticoPorDisciplina(
  disciplinaId: string,
): Promise<GrupoAutomatico | null> {
  if (!disciplinaId.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("grupos_automaticos")
    .select(camposGrupo)
    .eq("disciplina_id", disciplinaId)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as GrupoAutomatico | null;
}

export async function atualizarGrupoAutomatico(
  id: string,
  dados: {
    nivelMinimoOrdem: number;
    nivelMaximoOrdem: number;
    ativo: boolean;
  },
): Promise<void> {
  if (!id.trim()) {
    throw new Error("Grupo automático inválido.");
  }

  if (
    dados.nivelMaximoOrdem <
    dados.nivelMinimoOrdem
  ) {
    throw new Error(
      "O nível máximo não pode ser inferior ao nível mínimo.",
    );
  }

  const { error } = await supabase
    .from("grupos_automaticos")
    .update({
      nivel_minimo_ordem:
        dados.nivelMinimoOrdem,
      nivel_maximo_ordem:
        dados.nivelMaximoOrdem,
      ativo: dados.ativo,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listarExcecoesGrupo(
  grupoId: string,
): Promise<GrupoAutomaticoExcecao[]> {
  if (!grupoId.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("grupos_automaticos_excecoes")
    .select(camposExcecao)
    .eq("grupo_id", grupoId);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data ?? []
  ) as GrupoAutomaticoExcecao[];
}

export async function definirExcecaoGrupo(
  grupoId: string,
  alunoId: string,
  tipo: TipoExcecaoGrupo | null,
): Promise<void> {
  if (!grupoId.trim() || !alunoId.trim()) {
    throw new Error(
      "Grupo ou aluno inválido.",
    );
  }

  if (!tipo) {
    const { error } = await supabase
      .from("grupos_automaticos_excecoes")
      .delete()
      .eq("grupo_id", grupoId)
      .eq("aluno_id", alunoId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase
    .from("grupos_automaticos_excecoes")
    .upsert(
      {
        grupo_id: grupoId,
        aluno_id: alunoId,
        tipo,
      },
      {
        onConflict: "grupo_id,aluno_id",
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function obterAlunosDoGrupoAutomatico(
  grupo: GrupoAutomatico,
): Promise<AlunoGrupoAutomatico[]> {
  const [
    alunos,
    perfis,
    niveis,
    excecoes,
  ] = await Promise.all([
    listarAlunos(),
    listarAlunosPerfis(),
    listarNiveis(),
    listarExcecoesGrupo(grupo.id),
  ]);

  return alunos
    .map((aluno) => {
      const perfil =
        perfis.find(
          (item) =>
            item.aluno_id === aluno.id,
        ) ?? null;

      const nivel =
        niveis.find(
          (item) =>
            item.id === perfil?.nivel_id,
        ) ?? null;

      const ordemNivel = nivel
        ? obterOrdemNivel(nivel.nome)
        : null;

      const incluidoAutomaticamente =
        ordemNivel !== null &&
        ordemNivel >=
          grupo.nivel_minimo_ordem &&
        ordemNivel <=
          grupo.nivel_maximo_ordem;

      const excecao =
        excecoes.find(
          (item) =>
            item.aluno_id === aluno.id,
        )?.tipo ?? null;

      let participa =
        incluidoAutomaticamente;

      if (excecao === "Incluir") {
        participa = true;
      }

      if (excecao === "Excluir") {
        participa = false;
      }

      return {
        aluno,
        perfil,
        nivel,
        ordemNivel,
        incluidoAutomaticamente,
        excecao,
        participa,
      };
    })
    .sort((a, b) =>
      a.aluno.nome.localeCompare(
        b.aluno.nome,
      ),
    );
}

export async function obterAlunoIdsDoGrupoAutomatico(
  disciplinaId: string,
): Promise<string[]> {
  const grupo =
    await obterGrupoAutomaticoPorDisciplina(
      disciplinaId,
    );

  if (!grupo || !grupo.ativo) {
    return [];
  }

  const alunos =
    await obterAlunosDoGrupoAutomatico(
      grupo,
    );

  return alunos
    .filter((item) => item.participa)
    .map((item) => item.aluno.id);
}