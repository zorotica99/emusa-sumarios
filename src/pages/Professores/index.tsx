import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { listarInstrumentos, type Instrumento } from "../../services/instrumentos.service";
import {
  atualizarProfessor,
  criarProfessor,
  eliminarProfessor,
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import ProfessorForm from "./ProfessorForm";
import ProfessorTable from "./ProfessorTable";
import type { ProfessorFormData } from "./types";

const dadosIniciais: ProfessorFormData = {
  nome: "",
  email: "",
  telemovel: "",
  instrumentoId: "",
};

function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [formulario, setFormulario] = useState<ProfessorFormData>(dadosIniciais);
  const [professorEmEdicao, setProfessorEmEdicao] = useState<Professor | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const [dadosProfessores, dadosInstrumentos] = await Promise.all([
        listarProfessores(),
        listarInstrumentos(),
      ]);

      setProfessores(dadosProfessores);
      setInstrumentos(dadosInstrumentos);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os professores.",
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarCampo(campo: keyof ProfessorFormData, valor: string) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function guardarProfessor() {
    if (!formulario.nome.trim()) {
      setErro("O nome do professor é obrigatório.");
      return;
    }

    if (!formulario.instrumentoId) {
      setErro("Selecione um instrumento.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      if (professorEmEdicao) {
        await atualizarProfessor(professorEmEdicao.id, formulario);
      } else {
        await criarProfessor(formulario);
      }

      setFormulario(dadosIniciais);
      setProfessorEmEdicao(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível guardar o professor.",
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarProfessor(professor: Professor) {
    setProfessorEmEdicao(professor);

    setFormulario({
      nome: professor.nome,
      email: professor.email ?? "",
      telemovel: professor.telemovel ?? "",
      instrumentoId: professor.instrumento_id ?? "",
    });

    setErro("");
  }

  function cancelarEdicao() {
    setProfessorEmEdicao(null);
    setFormulario(dadosIniciais);
    setErro("");
  }

  async function removerProfessor(professor: Professor) {
    const confirmado = window.confirm(
      `Tem a certeza de que pretende eliminar "${professor.nome}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");

      await eliminarProfessor(professor.id);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar o professor.",
      );
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Professores"
        description="Gerir os professores da EMUSA."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud-grid">
        <ProfessorForm
          dados={formulario}
          instrumentos={instrumentos}
          aGuardar={aGuardar}
          emEdicao={Boolean(professorEmEdicao)}
          onChange={alterarCampo}
          onSubmit={guardarProfessor}
          onCancel={cancelarEdicao}
        />

        <ProfessorTable
          professores={professores}
          instrumentos={instrumentos}
          aCarregar={aCarregar}
          onEdit={editarProfessor}
          onDelete={removerProfessor}
        />
      </section>
    </main>
  );
}

export default Professores;