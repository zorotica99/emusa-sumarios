import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  atualizarHorario,
  criarHorario,
  eliminarHorario,
  type Horario,
  type TipoAula,
} from "../../services/horarios.service";
import { definirAlunosDoHorario } from "../../services/horariosAlunos.service";
import { obterMensagemErro } from "../../utils/errors";
import HorarioForm, {
  type HorarioFormData,
} from "./components/HorarioForm";
import HorarioTable from "./components/HorarioTable";
import { useHorarios } from "./hooks/useHorarios";
import "./Horarios.css";

const dadosIniciais: HorarioFormData = {
  tipoAula: "Turma",
  professorId: "",
  turmaId: "",
  disciplinaId: "",
  instrumentoId: "",
  diaSemana: "",
  horaInicio: "",
  horaFim: "",
};

const opcoesTipoAula = [
  {
    value: "Individual",
    label: "Aula individual",
  },
  {
    value: "Turma",
    label: "Aula de turma",
  },
  {
    value: "Grupo",
    label: "Aula de grupo",
  },
];

const opcoesDias = [
  {
    value: "Segunda-feira",
    label: "Segunda-feira",
  },
  {
    value: "Terça-feira",
    label: "Terça-feira",
  },
  {
    value: "Quarta-feira",
    label: "Quarta-feira",
  },
  {
    value: "Quinta-feira",
    label: "Quinta-feira",
  },
  {
    value: "Sexta-feira",
    label: "Sexta-feira",
  },
  {
    value: "Sábado",
    label: "Sábado",
  },
];

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obterNumeroNivel(nomeNivel: string): number | null {
  const nomeNormalizado = normalizarTexto(nomeNivel);

  if (nomeNormalizado.includes("minion")) {
    return 0;
  }

  const resultado = nomeNormalizado.match(/\d+/);

  if (!resultado) {
    return null;
  }

  return Number(resultado[0]);
}

function Horarios() {
  const {
    horarios,
    horariosAlunos,
    alunos,
    alunosTurmas,
    alunosPerfis,
    professores,
    turmas,
    disciplinas,
    instrumentos,
    niveis,
    aCarregar,
    erro,
    setErro,
    carregarDados,
  } = useHorarios();

  const [formulario, setFormulario] =
    useState<HorarioFormData>(dadosIniciais);

  const [alunoIndividualId, setAlunoIndividualId] =
    useState("");

  const [alunoIdsGrupo, setAlunoIdsGrupo] = useState<
    string[]
  >([]);

  const [horarioEmEdicao, setHorarioEmEdicao] =
    useState<Horario | null>(null);

  const [aGuardar, setAGuardar] = useState(false);

  const alunosOrdenados = useMemo(
    () =>
      [...alunos].sort((a, b) =>
        a.nome.localeCompare(b.nome),
      ),
    [alunos],
  );

  const disciplinaSelecionada = useMemo(
    () =>
      disciplinas.find(
        (disciplina) =>
          disciplina.id === formulario.disciplinaId,
      ) ?? null,
    [disciplinas, formulario.disciplinaId],
  );

  const nomeDisciplinaNormalizado = normalizarTexto(
    disciplinaSelecionada?.nome ?? "",
  );

  const eOrquestra =
    nomeDisciplinaNormalizado === "orquestra";

  const eClasseConjunto =
    nomeDisciplinaNormalizado ===
    "classe de conjunto";

  const alunosDisponiveisGrupo = useMemo(() => {
    if (formulario.tipoAula !== "Grupo") {
      return [];
    }

    if (!eOrquestra && !eClasseConjunto) {
      return alunosOrdenados;
    }

    return alunosOrdenados.filter((aluno) => {
      const perfil = alunosPerfis.find(
        (item) => item.aluno_id === aluno.id,
      );

      if (!perfil?.nivel_id) {
        return false;
      }

      const nivel = niveis.find(
        (item) => item.id === perfil.nivel_id,
      );

      if (!nivel) {
        return false;
      }

      const numeroNivel = obterNumeroNivel(nivel.nome);

      if (numeroNivel === null) {
        return false;
      }

      if (eOrquestra) {
        return numeroNivel >= 4 && numeroNivel <= 8;
      }

      return numeroNivel >= 0 && numeroNivel <= 3;
    });
  }, [
    formulario.tipoAula,
    eOrquestra,
    eClasseConjunto,
    alunosOrdenados,
    alunosPerfis,
    niveis,
  ]);

  const descricaoGrupo = eOrquestra
    ? "Selecionados automaticamente: alunos do Nível 4 ao Nível 8."
    : eClasseConjunto
      ? "Selecionados automaticamente: alunos do Nível Minion ao Nível 3."
      : "Selecione manualmente os alunos pertencentes ao grupo.";

  function limparFormulario() {
    setFormulario(dadosIniciais);
    setAlunoIndividualId("");
    setAlunoIdsGrupo([]);
    setHorarioEmEdicao(null);
    setErro("");
  }

  function alterarCampo(
    campo: keyof HorarioFormData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErro("");
  }

  function alterarTipoAula(valor: string) {
    const tipoAula = valor as TipoAula;

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      tipoAula,
      turmaId: "",
      disciplinaId: "",
      instrumentoId:
        tipoAula === "Individual"
          ? dadosAtuais.instrumentoId
          : "",
    }));

    setAlunoIndividualId("");
    setAlunoIdsGrupo([]);
    setErro("");
  }

  function obterTurmaIdDoAluno(alunoId: string): string {
    return (
      alunosTurmas.find(
        (registo) => registo.aluno_id === alunoId,
      )?.turma_id ?? ""
    );
  }

  function obterPerfilDoAluno(alunoId: string) {
    return alunosPerfis.find(
      (perfil) => perfil.aluno_id === alunoId,
    );
  }

  function selecionarAlunoIndividual(alunoId: string) {
    setAlunoIndividualId(alunoId);

    if (!alunoId) {
      setFormulario((dadosAtuais) => ({
        ...dadosAtuais,
        turmaId: "",
        instrumentoId: "",
      }));

      setErro("");
      return;
    }

    const turmaId = obterTurmaIdDoAluno(alunoId);
    const perfil = obterPerfilDoAluno(alunoId);

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      turmaId,
      instrumentoId: perfil?.instrumento_id ?? "",
    }));

    if (!turmaId) {
      setErro(
        "Este aluno ainda não está associado a uma turma.",
      );
      return;
    }

    if (!perfil?.instrumento_id) {
      setErro(
        "Este aluno ainda não tem instrumento principal definido.",
      );
      return;
    }

    setErro("");
  }

  function alterarProfessor(professorId: string) {
    const professor = professores.find(
      (item) => item.id === professorId,
    );

    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      professorId,
      instrumentoId:
        dadosAtuais.tipoAula === "Individual"
          ? dadosAtuais.instrumentoId ||
            professor?.instrumento_id ||
            ""
          : dadosAtuais.instrumentoId,
    }));

    setErro("");
  }

  function obterAlunosAutomaticosDaDisciplina(
    disciplinaId: string,
  ): string[] {
    const disciplina = disciplinas.find(
      (item) => item.id === disciplinaId,
    );

    const nome = normalizarTexto(
      disciplina?.nome ?? "",
    );

    const orquestra = nome === "orquestra";

    const classeConjunto =
      nome === "classe de conjunto";

    if (!orquestra && !classeConjunto) {
      return [];
    }

    return alunosOrdenados
      .filter((aluno) => {
        const perfil = alunosPerfis.find(
          (item) => item.aluno_id === aluno.id,
        );

        const nivel = niveis.find(
          (item) => item.id === perfil?.nivel_id,
        );

        if (!nivel) {
          return false;
        }

        const numero = obterNumeroNivel(nivel.nome);

        if (numero === null) {
          return false;
        }

        if (orquestra) {
          return numero >= 4 && numero <= 8;
        }

        return numero >= 0 && numero <= 3;
      })
      .map((aluno) => aluno.id);
  }

  function alterarDisciplina(disciplinaId: string) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      disciplinaId,
    }));

    if (formulario.tipoAula === "Grupo") {
      setAlunoIdsGrupo(
        obterAlunosAutomaticosDaDisciplina(
          disciplinaId,
        ),
      );
    }

    setErro("");
  }

  function alternarAlunoDoGrupo(alunoId: string) {
    setAlunoIdsGrupo((idsAtuais) =>
      idsAtuais.includes(alunoId)
        ? idsAtuais.filter((id) => id !== alunoId)
        : [...idsAtuais, alunoId],
    );
  }

  function selecionarTodosAlunosGrupo() {
    setAlunoIdsGrupo(
      alunosDisponiveisGrupo.map(
        (aluno) => aluno.id,
      ),
    );
  }

  function limparAlunosGrupo() {
    setAlunoIdsGrupo([]);
  }

  function obterAlunoIdsDaTurma(
    turmaId: string,
  ): string[] {
    return alunosTurmas
      .filter(
        (registo) => registo.turma_id === turmaId,
      )
      .map((registo) => registo.aluno_id);
  }

  function validarFormulario(): string {
    if (!formulario.professorId) {
      return "Selecione um professor.";
    }

    if (!formulario.disciplinaId) {
      return "Selecione uma disciplina.";
    }

    if (!formulario.turmaId) {
      return "Selecione uma turma.";
    }

    if (
      formulario.tipoAula === "Individual" &&
      !alunoIndividualId
    ) {
      return "Selecione o aluno da aula individual.";
    }

    if (
      formulario.tipoAula === "Individual" &&
      !formulario.instrumentoId
    ) {
      return "O aluno não tem um instrumento definido.";
    }

    if (
      formulario.tipoAula === "Grupo" &&
      alunoIdsGrupo.length === 0
    ) {
      return "Selecione pelo menos um aluno para o grupo.";
    }

    if (!formulario.diaSemana) {
      return "Selecione o dia da semana.";
    }

    if (!formulario.horaInicio) {
      return "Indique a hora de início.";
    }

    if (!formulario.horaFim) {
      return "Indique a hora de fim.";
    }

    if (formulario.horaFim <= formulario.horaInicio) {
      return "A hora de fim deve ser posterior à hora de início.";
    }

    return "";
  }

  async function guardarHorario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setAGuardar(true);
      setErro("");

      const dados = {
        professorId: formulario.professorId,
        turmaId: formulario.turmaId,
        disciplinaId: formulario.disciplinaId,
        instrumentoId: formulario.instrumentoId,
        tipoAula: formulario.tipoAula,
        diaSemana: formulario.diaSemana,
        horaInicio: formulario.horaInicio,
        horaFim: formulario.horaFim,
      };

      const horarioGuardado = horarioEmEdicao
        ? await atualizarHorario(
            horarioEmEdicao.id,
            dados,
          )
        : await criarHorario(dados);

      let alunoIds: string[] = [];

      if (formulario.tipoAula === "Individual") {
        alunoIds = [alunoIndividualId];
      }

      if (formulario.tipoAula === "Turma") {
        alunoIds = obterAlunoIdsDaTurma(
          formulario.turmaId,
        );
      }

      if (formulario.tipoAula === "Grupo") {
        alunoIds = alunoIdsGrupo;
      }

      await definirAlunosDoHorario(
        horarioGuardado.id,
        alunoIds,
      );

      limparFormulario();
      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar o horário.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  function obterAlunoIdsDoHorario(
    horarioId: string,
  ): string[] {
    return horariosAlunos
      .filter(
        (registo) =>
          registo.horario_id === horarioId,
      )
      .map((registo) => registo.aluno_id);
  }

  function editarHorario(horario: Horario) {
    const alunoIds = obterAlunoIdsDoHorario(horario.id);

    setHorarioEmEdicao(horario);

    setFormulario({
      tipoAula: horario.tipo_aula ?? "Turma",
      professorId: horario.professor_id,
      turmaId: horario.turma_id,
      disciplinaId: horario.disciplina_id,
      instrumentoId: horario.instrumento_id ?? "",
      diaSemana: horario.dia_semana,
      horaInicio: horario.hora_inicio.slice(0, 5),
      horaFim: horario.hora_fim.slice(0, 5),
    });

    if (horario.tipo_aula === "Individual") {
      setAlunoIndividualId(alunoIds[0] ?? "");
      setAlunoIdsGrupo([]);
    } else if (horario.tipo_aula === "Grupo") {
      setAlunoIndividualId("");
      setAlunoIdsGrupo(alunoIds);
    } else {
      setAlunoIndividualId("");
      setAlunoIdsGrupo([]);
    }

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function removerHorario(horario: Horario) {
    const confirmado = window.confirm(
      "Tem a certeza de que pretende eliminar este horário?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      await eliminarHorario(horario.id);
      await carregarDados();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível eliminar o horário.",
        ),
      );
    }
  }

  function obterNomeAluno(id: string): string {
    return (
      alunos.find((aluno) => aluno.id === id)?.nome ??
      "—"
    );
  }

  function obterNomeProfessor(id: string): string {
    return (
      professores.find((item) => item.id === id)?.nome ??
      "—"
    );
  }

  function obterNomeTurma(id: string): string {
    return (
      turmas.find((item) => item.id === id)?.nome ??
      "—"
    );
  }

  function obterNomeDisciplina(id: string): string {
    return (
      disciplinas.find((item) => item.id === id)?.nome ??
      "—"
    );
  }

  function obterNomeInstrumento(
    id: string | null,
  ): string {
    if (!id) {
      return "Sem instrumento específico";
    }

    return (
      instrumentos.find((item) => item.id === id)?.nome ??
      "—"
    );
  }

  function obterParticipantes(
    horario: Horario,
  ): string {
    const alunoIds = obterAlunoIdsDoHorario(horario.id);

    if (horario.tipo_aula === "Individual") {
      return alunoIds[0]
        ? obterNomeAluno(alunoIds[0])
        : "—";
    }

    return `${alunoIds.length} aluno${
      alunoIds.length === 1 ? "" : "s"
    }`;
  }

  const opcoesProfessores = professores.map(
    (professor) => ({
      value: professor.id,
      label: professor.nome,
    }),
  );

  const opcoesTurmas = turmas.map((turma) => ({
    value: turma.id,
    label: `${turma.nome} — ${turma.ano_letivo}`,
  }));

  const opcoesDisciplinas = disciplinas.map(
    (disciplina) => ({
      value: disciplina.id,
      label: disciplina.nome,
    }),
  );

  const opcoesInstrumentos = instrumentos.map(
    (instrumento) => ({
      value: instrumento.id,
      label: instrumento.nome,
    }),
  );

  const opcoesAlunos = alunosOrdenados.map((aluno) => {
    const perfil = obterPerfilDoAluno(aluno.id);

    const instrumento = perfil?.instrumento_id
      ? obterNomeInstrumento(perfil.instrumento_id)
      : "Sem instrumento";

    return {
      value: aluno.id,
      label: `${aluno.nome} — ${instrumento}`,
    };
  });

  return (
    <main className="page">
      <PageHeader
        title="Horários"
        description="Gerir aulas individuais, turmas e grupos por níveis."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      <section className="crud-grid">
        <div className="panel">
          <h2>
            {horarioEmEdicao
              ? "Editar horário"
              : "Novo horário"}
          </h2>

          <HorarioForm
            formulario={formulario}
            opcoesTipoAula={opcoesTipoAula}
            opcoesProfessores={opcoesProfessores}
            opcoesTurmas={opcoesTurmas}
            opcoesDisciplinas={opcoesDisciplinas}
            opcoesInstrumentos={opcoesInstrumentos}
            opcoesDias={opcoesDias}
            opcoesAlunos={opcoesAlunos}
            alunosDisponiveisGrupo={
              alunosDisponiveisGrupo
            }
            descricaoGrupo={descricaoGrupo}
            alunoIndividualId={alunoIndividualId}
            alunoIdsGrupo={alunoIdsGrupo}
            aGuardar={aGuardar}
            horarioEmEdicao={horarioEmEdicao}
            alterarTipoAula={alterarTipoAula}
            alterarCampo={alterarCampo}
            alterarProfessor={alterarProfessor}
            alterarDisciplina={alterarDisciplina}
            selecionarAlunoIndividual={
              selecionarAlunoIndividual
            }
            alternarAlunoDoGrupo={
              alternarAlunoDoGrupo
            }
            selecionarTodosAlunosGrupo={
              selecionarTodosAlunosGrupo
            }
            limparAlunosGrupo={limparAlunosGrupo}
            guardarHorario={guardarHorario}
            cancelarEdicao={limparFormulario}
          />
        </div>

        <div className="panel">
          <h2>Lista de horários</h2>

          <HorarioTable
            horarios={horarios}
            aCarregar={aCarregar}
            obterParticipantes={obterParticipantes}
            obterNomeProfessor={obterNomeProfessor}
            obterNomeTurma={obterNomeTurma}
            obterNomeDisciplina={obterNomeDisciplina}
            obterNomeInstrumento={obterNomeInstrumento}
            editarHorario={editarHorario}
            removerHorario={removerHorario}
          />
        </div>
      </section>
    </main>
  );
}

export default Horarios;