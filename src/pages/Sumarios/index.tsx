import {
  CalendarDays,
  Clock3,
  History,
  Eye,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import { useAuth } from "../../hooks/useAuth";
import {
  obterAnoLetivoAtivo,
  type AnoLetivo,
} from "../../services/anosLetivos.service";
import {
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../services/disciplinas.service";
import {
  listarHorarios,
  type Horario,
} from "../../services/horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../services/horariosAlunos.service";
import {
  guardarPresencasEmLote,
  listarPresencasDaAula,
  type EstadoPresenca,
} from "../../services/presencas.service";
import {
  listarProfessores,
  type Professor,
} from "../../services/professores.service";
import { obterUltimoSumarioDoHorario } from "../../services/sumarioInteligente.service";
import {
  atualizarSumario,
  criarSumario,
  eliminarSumario,
  listarSumarios,
  type Sumario,
} from "../../services/sumarios.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Sumarios.css";

interface SumarioFormData {
  data: string;
  horarioId: string;
  conteudo: string;
}

const dadosIniciais: SumarioFormData = {
  data: "",
  horarioId: "",
  conteudo: "",
};

const nomesDiasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function criarDataLocal(dataIso: string): Date | null {
  const partes = dataIso.split("-").map(Number);

  if (partes.length !== 3) {
    return null;
  }

  const [ano, mes, dia] = partes;

  if (!ano || !mes || !dia) {
    return null;
  }

  return new Date(ano, mes - 1, dia);
}

function obterNomeDia(dataIso: string): string {
  const data = criarDataLocal(dataIso);

  if (!data) {
    return "";
  }

  return nomesDiasSemana[data.getDay()];
}

function formatarData(dataIso: string): string {
  const data = criarDataLocal(dataIso);

  if (!data) {
    return dataIso;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

function obterDataHojeIso(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterHoraAtual(): string {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

function Sumarios() {
  const [searchParams] = useSearchParams();

  const { perfil, eAdministrador } = useAuth();

  const parametrosAplicados = useRef(false);

  const [sumarios, setSumarios] = useState<Sumario[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horariosAlunos, setHorariosAlunos] = useState<
    HorarioAluno[]
  >([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosTurmas, setAlunosTurmas] = useState<
    AlunoTurma[]
  >([]);
  const [professores, setProfessores] = useState<
    Professor[]
  >([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<
    Disciplina[]
  >([]);
  const [anoLetivoAtivo, setAnoLetivoAtivo] =
    useState<AnoLetivo | null>(null);

  const [formulario, setFormulario] =
    useState<SumarioFormData>(dadosIniciais);

  const [estadosPresenca, setEstadosPresenca] = useState<
    Record<string, EstadoPresenca>
  >({});

  const [ultimoSumario, setUltimoSumario] =
    useState<Sumario | null>(null);

  const [sumarioEmEdicao, setSumarioEmEdicao] =
    useState<Sumario | null>(null);

  const sumarioBloqueadoParaProfessor =
    Boolean(sumarioEmEdicao) && !eAdministrador;

  const [aCarregar, setACarregar] = useState(true);
  const [aCarregarPresencas, setACarregarPresencas] =
    useState(false);
  const [aCarregarUltimo, setACarregarUltimo] =
    useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [instanteAtual, setInstanteAtual] = useState(() =>
    new Date(),
  );

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setInstanteAtual(new Date());
    }, 30000);

    return () => window.clearInterval(intervalo);
  }, []);

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosSumarios,
        dadosHorarios,
        dadosHorariosAlunos,
        dadosAlunos,
        dadosAlunosTurmas,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
        dadosAnoLetivoAtivo,
      ] = await Promise.all([
        listarSumarios(),
        listarHorarios(),
        listarHorariosAlunos(),
        listarAlunos(),
        listarAlunosTurmas(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
        obterAnoLetivoAtivo(),
      ]);

      setSumarios(dadosSumarios);
      setHorarios(dadosHorarios);
      setHorariosAlunos(dadosHorariosAlunos);
      setAlunos(dadosAlunos);
      setAlunosTurmas(dadosAlunosTurmas);
      setProfessores(dadosProfessores);
      setTurmas(dadosTurmas);
      setDisciplinas(dadosDisciplinas);
      setAnoLetivoAtivo(dadosAnoLetivoAtivo);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os sumários.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const horariosDoProfessor = useMemo(() => {
    if (eAdministrador) {
      return horarios;
    }

    if (
      perfil?.perfil === "Professor" &&
      perfil.professor_id
    ) {
      return horarios.filter(
        (horario) =>
          horario.professor_id === perfil.professor_id,
      );
    }

    return [];
  }, [horarios, perfil, eAdministrador]);

  const horarioIdsPermitidos = useMemo(
    () =>
      new Set(
        horariosDoProfessor.map(
          (horario) => horario.id,
        ),
      ),
    [horariosDoProfessor],
  );

  function dataPertenceAoAnoAtivo(data: string): boolean {
    if (eAdministrador) {
      return true;
    }

    if (!anoLetivoAtivo) {
      return false;
    }

    return (
      data >= anoLetivoAtivo.data_inicio &&
      data <= anoLetivoAtivo.data_fim
    );
  }

  function professorPodeRegistarAula(
    data: string,
    horario: Horario,
  ): boolean {
    if (eAdministrador) {
      return true;
    }

    const hoje = obterDataHojeIso();

    if (data < hoje) {
      return true;
    }

    if (data > hoje) {
      return false;
    }

    return horario.hora_inicio.slice(0, 5) <= obterHoraAtual();
  }

  const sumariosVisiveis = useMemo(
    () =>
      sumarios
        .filter(
          (sumario) =>
            horarioIdsPermitidos.has(sumario.horario_id) &&
            (eAdministrador ||
              (anoLetivoAtivo !== null &&
                sumario.data >= anoLetivoAtivo.data_inicio &&
                sumario.data <= anoLetivoAtivo.data_fim)),
        )
        .sort((a, b) =>
          b.data.localeCompare(a.data),
        ),
    [
      sumarios,
      horarioIdsPermitidos,
      eAdministrador,
      anoLetivoAtivo,
    ],
  );

  const horariosDaData = useMemo(() => {
    if (!formulario.data) {
      return [];
    }

    if (!dataPertenceAoAnoAtivo(formulario.data)) {
      return [];
    }

    const nomeDia = obterNomeDia(formulario.data);

    return horariosDoProfessor
      .filter(
        (horario) =>
          horario.dia_semana === nomeDia &&
          professorPodeRegistarAula(
            formulario.data,
            horario,
          ),
      )
      .sort((a, b) =>
        a.hora_inicio.localeCompare(
          b.hora_inicio,
        ),
      );
  }, [
    formulario.data,
    horariosDoProfessor,
    eAdministrador,
    anoLetivoAtivo,
    instanteAtual,
  ]);

  const horarioSelecionado = useMemo(
    () =>
      horariosDoProfessor.find(
        (horario) =>
          horario.id === formulario.horarioId,
      ) ?? null,
    [horariosDoProfessor, formulario.horarioId],
  );

  const alunosDoHorario = useMemo(() => {
    if (!horarioSelecionado) {
      return [];
    }

    // Nas aulas de turma, os participantes são sempre os alunos
    // que pertencem atualmente à turma. Assim, quando um aluno
    // entra na turma, aparece automaticamente nos sumários sem
    // ser necessário editar novamente o horário.
    if (horarioSelecionado.tipo_aula === "Turma") {
      const idsDaTurma = alunosTurmas
        .filter(
          (registo) =>
            registo.turma_id === horarioSelecionado.turma_id,
        )
        .map((registo) => registo.aluno_id);

      return alunos
        .filter((aluno) => idsDaTurma.includes(aluno.id))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    // Nas aulas individuais e de grupo, mantemos exatamente
    // os alunos escolhidos especificamente para esse horário.
    const idsDoHorario = horariosAlunos
      .filter(
        (registo) =>
          registo.horario_id === horarioSelecionado.id,
      )
      .map((registo) => registo.aluno_id);

    return alunos
      .filter((aluno) => idsDoHorario.includes(aluno.id))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [
    horarioSelecionado,
    horariosAlunos,
    alunosTurmas,
    alunos,
  ]);

  useEffect(() => {
    if (
      aCarregar ||
      parametrosAplicados.current
    ) {
      return;
    }

    const horarioId =
      searchParams.get("horarioId") ?? "";

    const data =
      searchParams.get("data") ?? "";

    if (!horarioId && !data) {
      parametrosAplicados.current = true;
      return;
    }

    if (
      horarioId &&
      !horarioIdsPermitidos.has(horarioId)
    ) {
      setErro(
        "Não tem permissão para aceder a esta aula.",
      );

      parametrosAplicados.current = true;
      return;
    }

    const existente = sumariosVisiveis.find(
      (sumario) =>
        sumario.horario_id === horarioId &&
        sumario.data === data,
    );

    if (existente) {
      setSumarioEmEdicao(existente);

      setFormulario({
        data: existente.data,
        horarioId: existente.horario_id,
        conteudo: existente.conteudo,
      });
    } else {
      setSumarioEmEdicao(null);

      setFormulario({
        data,
        horarioId,
        conteudo: "",
      });
    }

    parametrosAplicados.current = true;
  }, [
    aCarregar,
    searchParams,
    horarioIdsPermitidos,
    sumariosVisiveis,
  ]);

  useEffect(() => {
    async function carregarUltimoSumario() {
      if (
        !formulario.horarioId ||
        !formulario.data
      ) {
        setUltimoSumario(null);
        return;
      }

      try {
        setACarregarUltimo(true);

        const ultimo =
          await obterUltimoSumarioDoHorario(
            formulario.horarioId,
            formulario.data,
          );

        if (
          ultimo &&
          !eAdministrador &&
          !dataPertenceAoAnoAtivo(ultimo.data)
        ) {
          setUltimoSumario(null);
        } else {
          setUltimoSumario(ultimo);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar último sumário:",
          error,
        );

        setUltimoSumario(null);
      } finally {
        setACarregarUltimo(false);
      }
    }

    carregarUltimoSumario();
  }, [
    formulario.horarioId,
    formulario.data,
    eAdministrador,
    anoLetivoAtivo,
  ]);

  useEffect(() => {
    async function carregarPresencas() {
      if (
        !formulario.horarioId ||
        !formulario.data
      ) {
        setEstadosPresenca({});
        return;
      }

      try {
        setACarregarPresencas(true);

        const existentes =
          await listarPresencasDaAula(
            formulario.horarioId,
            formulario.data,
          );

        const novosEstados: Record<
          string,
          EstadoPresenca
        > = {};

        alunosDoHorario.forEach((aluno) => {
          const encontrada = existentes.find(
            (presenca) =>
              presenca.aluno_id === aluno.id,
          );

          novosEstados[aluno.id] =
            encontrada?.estado ?? "Presente";
        });

        setEstadosPresenca(novosEstados);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar as presenças.",
          ),
        );
      } finally {
        setACarregarPresencas(false);
      }
    }

    carregarPresencas();
  }, [
    formulario.horarioId,
    formulario.data,
    alunosDoHorario,
  ]);

  function obterProfessorNome(id: string): string {
    return (
      professores.find(
        (professor) => professor.id === id,
      )?.nome ?? "—"
    );
  }

  function obterTurmaNome(id: string): string {
    return (
      turmas.find(
        (turma) => turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDisciplinaNome(id: string): string {
    return (
      disciplinas.find(
        (disciplina) => disciplina.id === id,
      )?.nome ?? "—"
    );
  }

  function obterDescricaoHorario(
    horario: Horario,
  ): string {
    const participantes =
      horario.tipo_aula === "Turma"
        ? alunosTurmas.filter(
            (registo) => registo.turma_id === horario.turma_id,
          ).length
        : horariosAlunos.filter(
            (registo) => registo.horario_id === horario.id,
          ).length;

    return [
      `${horario.hora_inicio.slice(
        0,
        5,
      )}–${horario.hora_fim.slice(0, 5)}`,
      obterDisciplinaNome(
        horario.disciplina_id,
      ),
      obterTurmaNome(horario.turma_id),
      `${participantes} aluno${
        participantes === 1 ? "" : "s"
      }`,
    ].join(" — ");
  }

  function alterarData(valor: string) {
    setFormulario({
      data: valor,
      horarioId: "",
      conteudo: "",
    });

    setSumarioEmEdicao(null);
    setEstadosPresenca({});
    setUltimoSumario(null);
    setErro("");
    setSucesso("");
  }

  function alterarHorario(horarioId: string) {
    const existente = sumariosVisiveis.find(
      (sumario) =>
        sumario.horario_id === horarioId &&
        sumario.data === formulario.data,
    );

    if (existente) {
      setSumarioEmEdicao(existente);

      setFormulario((atual) => ({
        ...atual,
        horarioId,
        conteudo: existente.conteudo,
      }));
    } else {
      setSumarioEmEdicao(null);

      setFormulario((atual) => ({
        ...atual,
        horarioId,
        conteudo: "",
      }));
    }

    setErro("");
    setSucesso("");
  }

  function alterarEstadoPresenca(
    alunoId: string,
    estado: EstadoPresenca,
  ) {
    setEstadosPresenca((atual) => ({
      ...atual,
      [alunoId]: estado,
    }));
  }

  function marcarTodos(
    estado: EstadoPresenca,
  ) {
    const novosEstados: Record<
      string,
      EstadoPresenca
    > = {};

    alunosDoHorario.forEach((aluno) => {
      novosEstados[aluno.id] = estado;
    });

    setEstadosPresenca(novosEstados);
  }

  function limparFormulario() {
    setFormulario(dadosIniciais);
    setSumarioEmEdicao(null);
    setEstadosPresenca({});
    setUltimoSumario(null);
    setErro("");
    setSucesso("");
  }

  async function guardarSumario(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (sumarioBloqueadoParaProfessor) {
      setErro(
        "Depois de guardado, o sumário fica disponível apenas para consulta. Para corrigir um sumário, contacte o administrador.",
      );
      return;
    }

    if (!formulario.data) {
      setErro("Selecione a data da aula.");
      return;
    }

    if (!dataPertenceAoAnoAtivo(formulario.data)) {
      setErro(
        anoLetivoAtivo
          ? `Os professores só podem registar sumários no ano letivo ativo (${anoLetivoAtivo.nome}).`
          : "Não existe um ano letivo ativo. Contacte o administrador.",
      );
      return;
    }

    if (!formulario.horarioId) {
      setErro("Selecione a aula.");
      return;
    }

    if (
      !horarioIdsPermitidos.has(
        formulario.horarioId,
      )
    ) {
      setErro(
        "Não tem permissão para guardar este sumário.",
      );
      return;
    }

    if (
      !eAdministrador &&
      horarioSelecionado &&
      !professorPodeRegistarAula(
        formulario.data,
        horarioSelecionado,
      )
    ) {
      setErro(
        `Este sumário só pode ser registado a partir das ${horarioSelecionado.hora_inicio.slice(0, 5)}, quando a aula começar.`,
      );
      return;
    }

    if (!formulario.conteudo.trim()) {
      setErro(
        "O conteúdo do sumário é obrigatório.",
      );
      return;
    }

    if (alunosDoHorario.length === 0) {
      setErro(
        "Esta aula ainda não tem alunos associados.",
      );
      return;
    }

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      const estavaAEditar =
        Boolean(sumarioEmEdicao);

      if (sumarioEmEdicao) {
        await atualizarSumario(
          sumarioEmEdicao.id,
          formulario,
        );
      } else {
        await criarSumario(formulario);
      }

      await guardarPresencasEmLote(
        formulario.horarioId,
        formulario.data,
        alunosDoHorario.map((aluno) => ({
          alunoId: aluno.id,
          estado:
            estadosPresenca[aluno.id] ??
            "Presente",
        })),
      );

      limparFormulario();
      await carregarDados();

      setSucesso(
        estavaAEditar
          ? "Sumário e presenças atualizados com sucesso."
          : "Sumário e presenças guardados com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar o sumário.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  function abrirSumarioDoHistorico(sumario: Sumario) {
    setSumarioEmEdicao(sumario);

    setFormulario({
      data: sumario.data,
      horarioId: sumario.horario_id,
      conteudo: sumario.conteudo,
    });

    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function removerSumario(
    sumario: Sumario,
  ) {
    if (!eAdministrador) {
      setErro(
        "Apenas o administrador pode eliminar sumários.",
      );
      return;
    }

    const confirmado = window.confirm(
      "Tem a certeza de que pretende eliminar este sumário?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await eliminarSumario(sumario.id);
      await carregarDados();

      setSucesso(
        "Sumário eliminado com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível eliminar o sumário.",
        ),
      );
    }
  }

  const opcoesHorarios = horariosDaData.map(
    (horario) => ({
      value: horario.id,
      label: obterDescricaoHorario(horario),
    }),
  );

  return (
    <main className="page">
      <PageHeader
        title="Sumários"
        description="Escolha a data e a aula. A aplicação preenche automaticamente os restantes dados."
      />

      {erro && (
        <div className="alert alert--error">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="alert alert--success">
          {sucesso}
        </div>
      )}

      <section className="summary-layout">
        <div className="panel">
          <h2>
            {sumarioEmEdicao
              ? eAdministrador
                ? "Editar sumário"
                : "Consultar sumário"
              : "Novo sumário"}
          </h2>

          <form
            className="form"
            onSubmit={guardarSumario}
          >
            <div className="form-field">
              <label htmlFor="sumario-data">
                Data da aula
              </label>

              <input
                id="sumario-data"
                type="date"
                value={formulario.data}
                min={
                  !eAdministrador && anoLetivoAtivo
                    ? anoLetivoAtivo.data_inicio
                    : undefined
                }
                max={
                  !eAdministrador && anoLetivoAtivo
                    ? anoLetivoAtivo.data_fim < obterDataHojeIso()
                      ? anoLetivoAtivo.data_fim
                      : obterDataHojeIso()
                    : undefined
                }
                disabled={sumarioBloqueadoParaProfessor}
                onChange={(event) =>
                  alterarData(
                    event.target.value,
                  )
                }
              />
            </div>

            {formulario.data && (
              <div className="summary-date-info">
                <CalendarDays size={18} />

                <span>
                  {obterNomeDia(
                    formulario.data,
                  )}
                  {" — "}
                  {formatarData(
                    formulario.data,
                  )}
                </span>
              </div>
            )}

            <SelectField
              id="sumario-horario"
              label="Aula"
              value={formulario.horarioId}
              options={opcoesHorarios}
              placeholder={
                !formulario.data
                  ? "Selecione primeiro a data"
                  : horariosDaData.length
                    ? "Selecione a aula"
                    : !eAdministrador &&
                        formulario.data === obterDataHojeIso()
                      ? "Ainda não existem aulas disponíveis para sumário"
                      : "Não existem aulas neste dia"
              }
              disabled={
                sumarioBloqueadoParaProfessor ||
                !formulario.data ||
                horariosDaData.length === 0
              }
              onChange={alterarHorario}
            />

            {horarioSelecionado && (
              <section className="summary-lesson-info">
                <span>
                  {horarioSelecionado.tipo_aula}
                </span>

                <strong>
                  {obterDisciplinaNome(
                    horarioSelecionado.disciplina_id,
                  )}
                </strong>

                <p>
                  <Clock3 size={15} />

                  {horarioSelecionado.hora_inicio.slice(
                    0,
                    5,
                  )}
                  {"–"}
                  {horarioSelecionado.hora_fim.slice(
                    0,
                    5,
                  )}
                </p>

                <p>
                  {obterProfessorNome(
                    horarioSelecionado.professor_id,
                  )}
                  {" — "}
                  {obterTurmaNome(
                    horarioSelecionado.turma_id,
                  )}
                </p>
              </section>
            )}

            {formulario.horarioId &&
              formulario.data && (
                <section className="previous-summary">
                  <header>
                    <History size={19} />

                    <strong>
                      Último sumário desta aula
                    </strong>
                  </header>

                  {aCarregarUltimo ? (
                    <p>A carregar...</p>
                  ) : ultimoSumario ? (
                    <>
                      <span>
                        {formatarData(
                          ultimoSumario.data,
                        )}
                      </span>

                      <p>
                        {ultimoSumario.conteudo}
                      </p>
                    </>
                  ) : (
                    <p>
                      Ainda não existe um sumário
                      anterior para esta aula.
                    </p>
                  )}
                </section>
              )}

            <div className="form-field">
              <label htmlFor="sumario-conteudo">
                Conteúdo do sumário
              </label>

              <textarea
                id="sumario-conteudo"
                value={formulario.conteudo}
                readOnly={sumarioBloqueadoParaProfessor}
                onChange={(event) => {
                  setFormulario((atual) => ({
                    ...atual,
                    conteudo: event.target.value,
                  }));

                  setErro("");
                  setSucesso("");
                }}
                placeholder="Ex.: Escala de Sol maior. Estudo Rose n.º 6. Trabalho de articulação."
                rows={7}
              />
            </div>

            <section className="attendance-box">
              <header className="attendance-box__header">
                <div>
                  <h3>
                    <UsersRound size={20} />
                    Presenças
                  </h3>

                  <p>
                    Alunos associados a esta aula.
                  </p>
                </div>

                <span>
                  {alunosDoHorario.length}
                </span>
              </header>

              {!formulario.horarioId ? (
                <p className="attendance-box__empty">
                  Selecione uma aula para ver os alunos.
                </p>
              ) : aCarregarPresencas ? (
                <p className="attendance-box__empty">
                  A carregar presenças...
                </p>
              ) : alunosDoHorario.length === 0 ? (
                <p className="attendance-box__empty">
                  Esta aula ainda não tem alunos associados.
                </p>
              ) : (
                <>
                  <div className="attendance-quick-actions">
                    <button
                      type="button"
                      disabled={sumarioBloqueadoParaProfessor}
                      onClick={() =>
                        marcarTodos("Presente")
                      }
                    >
                      Todos presentes
                    </button>

                    <button
                      type="button"
                      disabled={sumarioBloqueadoParaProfessor}
                      onClick={() =>
                        marcarTodos("Falta")
                      }
                    >
                      Todos em falta
                    </button>
                  </div>

                  <div className="attendance-list">
                    {alunosDoHorario.map(
                      (aluno) => (
                        <div
                          className="attendance-row"
                          key={aluno.id}
                        >
                          <strong>
                            {aluno.nome}
                          </strong>

                          <select
                            disabled={sumarioBloqueadoParaProfessor}
                            value={
                              estadosPresenca[
                                aluno.id
                              ] ?? "Presente"
                            }
                            onChange={(event) =>
                              alterarEstadoPresenca(
                                aluno.id,
                                event.target
                                  .value as EstadoPresenca,
                              )
                            }
                          >
                            <option value="Presente">
                              Presente
                            </option>

                            <option value="Falta">
                              Falta
                            </option>

                            <option value="Falta justificada">
                              Falta justificada
                            </option>
                          </select>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </section>

            {sumarioBloqueadoParaProfessor && (
              <div className="summary-date-info">
                <Eye size={18} />
                <span>
                  Este sumário já foi guardado e está disponível apenas para consulta.
                </span>
              </div>
            )}

            <div className="form-actions">
              {!sumarioBloqueadoParaProfessor && (
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={aGuardar}
                >
                  {aGuardar ? (
                    "A guardar..."
                  ) : (
                    <>
                      <Plus size={18} />

                      {sumarioEmEdicao
                        ? "Guardar alterações"
                        : "Guardar sumário e presenças"}
                    </>
                  )}
                </button>
              )}

              {(sumarioEmEdicao ||
                formulario.data ||
                formulario.horarioId) && (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={limparFormulario}
                >
                  {sumarioBloqueadoParaProfessor
                    ? "Fechar consulta"
                    : "Limpar"}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Histórico de sumários</h2>

          {aCarregar ? (
            <p className="muted-text">
              A carregar...
            </p>
          ) : sumariosVisiveis.length === 0 ? (
            <p className="muted-text">
              Ainda não existem sumários.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>

                    {eAdministrador && (
                      <th>Professor</th>
                    )}

                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Conteúdo</th>

                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sumariosVisiveis.map(
                    (sumario) => {
                      const horario =
                        horariosDoProfessor.find(
                          (item) =>
                            item.id ===
                            sumario.horario_id,
                        );

                      return (
                        <tr key={sumario.id}>
                          <td>
                            {formatarData(
                              sumario.data,
                            )}
                          </td>

                          {eAdministrador && (
                            <td>
                              {horario
                                ? obterProfessorNome(
                                    horario.professor_id,
                                  )
                                : "—"}
                            </td>
                          )}

                          <td>
                            {horario
                              ? obterDisciplinaNome(
                                  horario.disciplina_id,
                                )
                              : "—"}
                          </td>

                          <td>
                            {horario
                              ? obterTurmaNome(
                                  horario.turma_id,
                                )
                              : "—"}
                          </td>

                          <td className="summary-content-cell">
                            {sumario.conteudo}
                          </td>

                          <td className="data-table__actions">
                            <button
                              className="icon-button"
                              type="button"
                              title={
                                eAdministrador
                                  ? "Editar"
                                  : "Ver sumário"
                              }
                              onClick={() =>
                                abrirSumarioDoHistorico(sumario)
                              }
                            >
                              {eAdministrador ? (
                                <Pencil size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>

                            {eAdministrador && (
                              <button
                                className="icon-button icon-button--danger"
                                type="button"
                                title="Eliminar"
                                onClick={() =>
                                  removerSumario(
                                    sumario,
                                  )
                                }
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Sumarios;