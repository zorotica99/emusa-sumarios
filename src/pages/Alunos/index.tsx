import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import SelectField from "../../components/forms/SelectField";
import {
  atualizarAluno,
  criarAluno,
  eliminarAluno,
  listarAlunos,
  type Aluno,
} from "../../services/alunos.service";
import {
  listarAlunosPerfis,
  guardarPerfilDoAluno,
  type AlunoPerfil,
} from "../../services/alunosPerfis.service";
import {
  definirTurmasDoAluno,
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../services/alunosTurmas.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../services/instrumentos.service";
import {
  listarNiveis,
  type Nivel,
} from "../../services/niveis.service";
import {
  listarTurmas,
  type Turma,
} from "../../services/turmas.service";
import { obterMensagemErro } from "../../utils/errors";
import "./Alunos.css";

interface AlunoFormData {
  nome: string;
  dataNascimento: string;
  encarregado: string;
  contacto: string;
  turmaPrincipalId: string;
  classeConjuntoId: string;
  instrumentoId: string;
  nivelId: string;
}

const dadosIniciais: AlunoFormData = {
  nome: "",
  dataNascimento: "",
  encarregado: "",
  contacto: "",
  turmaPrincipalId: "",
  classeConjuntoId: "",
  instrumentoId: "",
  nivelId: "",
};

function formatarData(
  data: string | null,
): string {
  if (!data) {
    return "—";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  const [instrumentos, setInstrumentos] = useState<
    Instrumento[]
  >([]);

  const [niveis, setNiveis] = useState<Nivel[]>([]);

  const [alunosTurmas, setAlunosTurmas] = useState<
    AlunoTurma[]
  >([]);

  const [alunosPerfis, setAlunosPerfis] = useState<
    AlunoPerfil[]
  >([]);

  const [formulario, setFormulario] =
    useState<AlunoFormData>(dadosIniciais);

  const [alunoEmEdicao, setAlunoEmEdicao] =
    useState<Aluno | null>(null);

  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroClasseConjunto, setFiltroClasseConjunto] = useState("");
  const [filtroInstrumento, setFiltroInstrumento] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");

  async function carregarDados() {
    try {
      setErro("");

      const [
        dadosAlunos,
        dadosTurmas,
        dadosInstrumentos,
        dadosNiveis,
        dadosAlunosTurmas,
        dadosAlunosPerfis,
      ] = await Promise.all([
        listarAlunos(),
        listarTurmas(),
        listarInstrumentos(),
        listarNiveis(),
        listarAlunosTurmas(),
        listarAlunosPerfis(),
      ]);

      setAlunos(dadosAlunos);
      setTurmas(dadosTurmas);
      setInstrumentos(dadosInstrumentos);
      setNiveis(dadosNiveis);
      setAlunosTurmas(dadosAlunosTurmas);
      setAlunosPerfis(dadosAlunosPerfis);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os alunos.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const turmasPrincipais = useMemo(
    () =>
      turmas
        .filter(
          (turma) =>
            turma.tipo_turma === "Principal",
        )
        .sort((a, b) =>
          a.nome.localeCompare(b.nome),
        ),
    [turmas],
  );

  const classesConjunto = useMemo(
    () =>
      turmas
        .filter(
          (turma) =>
            turma.tipo_turma === "Conjunto",
        )
        .sort((a, b) =>
          a.nome.localeCompare(b.nome),
        ),
    [turmas],
  );

  function alterarCampo(
    campo: keyof AlunoFormData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErro("");
    setSucesso("");
  }

  function obterPerfilDoAluno(
    alunoId: string,
  ): AlunoPerfil | undefined {
    return alunosPerfis.find(
      (perfil) =>
        perfil.aluno_id === alunoId,
    );
  }

  function obterRegistosTurmaDoAluno(
    alunoId: string,
  ): AlunoTurma[] {
    return alunosTurmas.filter(
      (registo) =>
        registo.aluno_id === alunoId,
    );
  }

  function obterTurmaPrincipalIdDoAluno(
    alunoId: string,
  ): string {
    const ids = obterRegistosTurmaDoAluno(
      alunoId,
    ).map(
      (registo) => registo.turma_id,
    );

    return (
      turmasPrincipais.find((turma) =>
        ids.includes(turma.id),
      )?.id ?? ""
    );
  }

  function obterClasseConjuntoIdDoAluno(
    alunoId: string,
  ): string {
    const ids = obterRegistosTurmaDoAluno(
      alunoId,
    ).map(
      (registo) => registo.turma_id,
    );

    return (
      classesConjunto.find((turma) =>
        ids.includes(turma.id),
      )?.id ?? ""
    );
  }

  function obterNomeTurmaPrincipal(
    alunoId: string,
  ): string {
    const id =
      obterTurmaPrincipalIdDoAluno(
        alunoId,
      );

    return (
      turmasPrincipais.find(
        (turma) => turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterNomeClasseConjunto(
    alunoId: string,
  ): string {
    const id =
      obterClasseConjuntoIdDoAluno(
        alunoId,
      );

    return (
      classesConjunto.find(
        (turma) => turma.id === id,
      )?.nome ?? "—"
    );
  }

  function obterNomeInstrumento(
    alunoId: string,
  ): string {
    const instrumentoId =
      obterPerfilDoAluno(
        alunoId,
      )?.instrumento_id;

    if (!instrumentoId) {
      return "—";
    }

    return (
      instrumentos.find(
        (instrumento) =>
          instrumento.id === instrumentoId,
      )?.nome ?? "—"
    );
  }

  function obterNomeNivel(
    alunoId: string,
  ): string {
    const nivelId =
      obterPerfilDoAluno(
        alunoId,
      )?.nivel_id;

    if (!nivelId) {
      return "—";
    }

    return (
      niveis.find(
        (nivel) =>
          nivel.id === nivelId,
      )?.nome ?? "—"
    );
  }

  async function guardarAluno(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      setErro(
        "O nome do aluno é obrigatório.",
      );
      return;
    }

    if (!formulario.turmaPrincipalId) {
      setErro(
        "Selecione a turma principal.",
      );
      return;
    }

    if (!formulario.instrumentoId) {
      setErro(
        "Selecione o instrumento principal.",
      );
      return;
    }

    if (!formulario.nivelId) {
      setErro("Selecione o nível.");
      return;
    }

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      let alunoGuardado: Aluno;

      const dadosAluno = {
        nome: formulario.nome,
        dataNascimento:
          formulario.dataNascimento,
        encarregado:
          formulario.encarregado,
        contacto:
          formulario.contacto,
      };

      if (alunoEmEdicao) {
        alunoGuardado =
          await atualizarAluno(
            alunoEmEdicao.id,
            dadosAluno,
          );
      } else {
        alunoGuardado =
          await criarAluno(
            dadosAluno,
          );
      }

      await Promise.all([
        definirTurmasDoAluno(
          alunoGuardado.id,
          formulario.turmaPrincipalId,
          formulario.classeConjuntoId,
        ),

        guardarPerfilDoAluno({
          alunoId: alunoGuardado.id,
          instrumentoId:
            formulario.instrumentoId,
          nivelId:
            formulario.nivelId,
        }),
      ]);

      const estavaAEditar =
        Boolean(alunoEmEdicao);

      setFormulario(dadosIniciais);
      setAlunoEmEdicao(null);

      await carregarDados();

      setSucesso(
        estavaAEditar
          ? "Aluno atualizado com sucesso."
          : "Aluno adicionado com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar o aluno.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  function editarAluno(
    aluno: Aluno,
  ) {
    const perfil =
      obterPerfilDoAluno(aluno.id);

    setAlunoEmEdicao(aluno);

    setFormulario({
      nome: aluno.nome,
      dataNascimento:
        aluno.data_nascimento ?? "",
      encarregado:
        aluno.encarregado ?? "",
      contacto:
        aluno.contacto ?? "",
      turmaPrincipalId:
        obterTurmaPrincipalIdDoAluno(
          aluno.id,
        ),
      classeConjuntoId:
        obterClasseConjuntoIdDoAluno(
          aluno.id,
        ),
      instrumentoId:
        perfil?.instrumento_id ?? "",
      nivelId:
        perfil?.nivel_id ?? "",
    });

    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setAlunoEmEdicao(null);
    setFormulario(dadosIniciais);
    setErro("");
    setSucesso("");
  }

  async function removerAluno(
    aluno: Aluno,
  ) {
    const confirmado =
      window.confirm(
        `Tem a certeza de que pretende eliminar "${aluno.nome}"?`,
      );

    if (!confirmado) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await eliminarAluno(aluno.id);
      await carregarDados();

      setSucesso(
        "Aluno eliminado com sucesso.",
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível eliminar o aluno.",
        ),
      );
    }
  }

  const opcoesTurmasPrincipais =
    turmasPrincipais.map(
      (turma) => ({
        value: turma.id,
        label: `${turma.nome} — ${turma.ano_letivo}`,
      }),
    );

  const opcoesClassesConjunto =
    classesConjunto.map(
      (turma) => ({
        value: turma.id,
        label: `${turma.nome} — ${turma.ano_letivo}`,
      }),
    );

  const opcoesInstrumentos =
    instrumentos.map(
      (instrumento) => ({
        value: instrumento.id,
        label: instrumento.nome,
      }),
    );

  const opcoesNiveis =
    niveis.map(
      (nivel) => ({
        value: nivel.id,
        label: nivel.nome,
      }),
    );

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-PT");
    const turmaId = obterTurmaPrincipalIdDoAluno(aluno.id);
    const classeId = obterClasseConjuntoIdDoAluno(aluno.id);
    const perfil = obterPerfilDoAluno(aluno.id);

    if (filtroTurma && turmaId !== filtroTurma) return false;
    if (filtroClasseConjunto && classeId !== filtroClasseConjunto) return false;
    if (
      filtroInstrumento &&
      perfil?.instrumento_id !== filtroInstrumento
    ) return false;
    if (filtroNivel && perfil?.nivel_id !== filtroNivel) return false;

    if (!termo) return true;

    return [
      aluno.nome,
      obterNomeTurmaPrincipal(aluno.id),
      obterNomeClasseConjunto(aluno.id),
      obterNomeInstrumento(aluno.id),
      obterNomeNivel(aluno.id),
      aluno.encarregado ?? "",
      aluno.contacto ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("pt-PT")
      .includes(termo);
  });

  const existemFiltros =
    Boolean(pesquisa.trim()) ||
    Boolean(filtroTurma) ||
    Boolean(filtroClasseConjunto) ||
    Boolean(filtroInstrumento) ||
    Boolean(filtroNivel);

  function limparFiltros() {
    setPesquisa("");
    setFiltroTurma("");
    setFiltroClasseConjunto("");
    setFiltroInstrumento("");
    setFiltroNivel("");
  }

  return (
    <main className="page">
      <PageHeader
        title="Alunos"
        description="Gerir os dados pessoais e o perfil académico dos alunos."
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

      <section className="student-page-layout">
        <div className="panel student-form-panel">
          <h2>
            <UserRoundCog size={21} />

            {alunoEmEdicao
              ? "Editar aluno"
              : "Novo aluno"}
          </h2>

          <form
            className="form"
            onSubmit={guardarAluno}
          >
            <section className="student-form-section">
              <header>
                <span>1</span>

                <div>
                  <strong>
                    Dados pessoais
                  </strong>

                  <p>
                    Informação de identificação
                    e contacto.
                  </p>
                </div>
              </header>

              <div className="form-field">
                <label htmlFor="aluno-nome">
                  Nome
                </label>

                <input
                  id="aluno-nome"
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    alterarCampo(
                      "nome",
                      event.target.value,
                    )
                  }
                  placeholder="Nome completo do aluno"
                />
              </div>

              <div className="form-field">
                <label htmlFor="aluno-data">
                  Data de nascimento
                </label>

                <input
                  id="aluno-data"
                  type="date"
                  value={
                    formulario.dataNascimento
                  }
                  onChange={(event) =>
                    alterarCampo(
                      "dataNascimento",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="aluno-encarregado">
                  Encarregado de educação
                </label>

                <input
                  id="aluno-encarregado"
                  type="text"
                  value={
                    formulario.encarregado
                  }
                  onChange={(event) =>
                    alterarCampo(
                      "encarregado",
                      event.target.value,
                    )
                  }
                  placeholder="Nome do encarregado"
                />
              </div>

              <div className="form-field">
                <label htmlFor="aluno-contacto">
                  Contacto
                </label>

                <input
                  id="aluno-contacto"
                  type="text"
                  value={
                    formulario.contacto
                  }
                  onChange={(event) =>
                    alterarCampo(
                      "contacto",
                      event.target.value,
                    )
                  }
                  placeholder="Telefone ou email"
                />
              </div>
            </section>

            <section className="student-form-section">
              <header>
                <span>2</span>

                <div>
                  <strong>
                    Perfil académico
                  </strong>

                  <p>
                    Turma, classe de conjunto,
                    instrumento e nível.
                  </p>
                </div>
              </header>

              <SelectField
                id="aluno-turma-principal"
                label="Turma principal"
                value={
                  formulario.turmaPrincipalId
                }
                options={
                  opcoesTurmasPrincipais
                }
                placeholder="Selecione uma turma principal"
                onChange={(valor) =>
                  alterarCampo(
                    "turmaPrincipalId",
                    valor,
                  )
                }
              />

              <SelectField
                id="aluno-classe-conjunto"
                label="Classe de conjunto"
                value={
                  formulario.classeConjuntoId
                }
                options={
                  opcoesClassesConjunto
                }
                placeholder="Sem classe de conjunto"
                onChange={(valor) =>
                  alterarCampo(
                    "classeConjuntoId",
                    valor,
                  )
                }
              />

              <SelectField
                id="aluno-instrumento"
                label="Instrumento principal"
                value={
                  formulario.instrumentoId
                }
                options={
                  opcoesInstrumentos
                }
                placeholder="Selecione um instrumento"
                onChange={(valor) =>
                  alterarCampo(
                    "instrumentoId",
                    valor,
                  )
                }
              />

              <SelectField
                id="aluno-nivel"
                label="Nível"
                value={
                  formulario.nivelId
                }
                options={
                  opcoesNiveis
                }
                placeholder="Selecione um nível"
                onChange={(valor) =>
                  alterarCampo(
                    "nivelId",
                    valor,
                  )
                }
              />
            </section>

            <div className="form-actions">
              <button
                className="button button--primary"
                type="submit"
                disabled={aGuardar}
              >
                <Plus size={18} />

                {aGuardar
                  ? "A guardar..."
                  : alunoEmEdicao
                    ? "Guardar alterações"
                    : "Adicionar aluno"}
              </button>

              {alunoEmEdicao && (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={
                    cancelarEdicao
                  }
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Lista de alunos</h2>

          {!aCarregar && alunos.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div className="form-field">
                  <label htmlFor="pesquisa-alunos">Procurar aluno</label>
                  <div style={{ position: "relative" }}>
                    <Search
                      size={17}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="pesquisa-alunos"
                      type="text"
                      value={pesquisa}
                      onChange={(event) => setPesquisa(event.target.value)}
                      placeholder="Nome, turma, instrumento..."
                      style={{ width: "100%", paddingLeft: "38px" }}
                    />
                  </div>
                </div>

                <SelectField
                  id="filtro-turma-alunos"
                  label="Turma"
                  value={filtroTurma}
                  options={opcoesTurmasPrincipais}
                  placeholder="Todas as turmas"
                  onChange={setFiltroTurma}
                />

                <SelectField
                  id="filtro-classe-alunos"
                  label="Classe de conjunto"
                  value={filtroClasseConjunto}
                  options={opcoesClassesConjunto}
                  placeholder="Todas as classes"
                  onChange={setFiltroClasseConjunto}
                />

                <SelectField
                  id="filtro-instrumento-alunos"
                  label="Instrumento"
                  value={filtroInstrumento}
                  options={opcoesInstrumentos}
                  placeholder="Todos os instrumentos"
                  onChange={setFiltroInstrumento}
                />

                <SelectField
                  id="filtro-nivel-alunos"
                  label="Nível"
                  value={filtroNivel}
                  options={opcoesNiveis}
                  placeholder="Todos os níveis"
                  onChange={setFiltroNivel}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <span className="muted-text">
                  {alunosFiltrados.length} {alunosFiltrados.length === 1 ? "aluno" : "alunos"}
                  {existemFiltros ? ` de ${alunos.length}` : ""}
                </span>

                {existemFiltros && (
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </>
          )}

          {aCarregar ? (
            <p className="muted-text">
              A carregar...
            </p>
          ) : alunos.length === 0 ? (
            <p className="muted-text">
              Ainda não existem alunos.
            </p>
          ) : alunosFiltrados.length === 0 ? (
            <p className="muted-text">
              Nenhum aluno corresponde aos filtros selecionados.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Turma</th>
                    <th>
                      Classe de conjunto
                    </th>
                    <th>Instrumento</th>
                    <th>Nível</th>
                    <th>Nascimento</th>
                    <th>Encarregado</th>
                    <th>Contacto</th>

                    <th className="data-table__actions">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {alunosFiltrados.map(
                    (aluno) => (
                      <tr key={aluno.id}>
                        <td>
                          <strong>
                            {aluno.nome}
                          </strong>
                        </td>

                        <td>
                          {obterNomeTurmaPrincipal(
                            aluno.id,
                          )}
                        </td>

                        <td>
                          {obterNomeClasseConjunto(
                            aluno.id,
                          )}
                        </td>

                        <td>
                          {obterNomeInstrumento(
                            aluno.id,
                          )}
                        </td>

                        <td>
                          {obterNomeNivel(
                            aluno.id,
                          )}
                        </td>

                        <td>
                          {formatarData(
                            aluno.data_nascimento,
                          )}
                        </td>

                        <td>
                          {aluno.encarregado ||
                            "—"}
                        </td>

                        <td>
                          {aluno.contacto ||
                            "—"}
                        </td>

                        <td className="data-table__actions">
                          <button
                            className="icon-button"
                            type="button"
                            title="Editar"
                            onClick={() =>
                              editarAluno(
                                aluno,
                              )
                            }
                          >
                            <Pencil
                              size={18}
                            />
                          </button>

                          <button
                            className="icon-button icon-button--danger"
                            type="button"
                            title="Eliminar"
                            onClick={() =>
                              removerAluno(
                                aluno,
                              )
                            }
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </td>
                      </tr>
                    ),
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

export default Alunos;