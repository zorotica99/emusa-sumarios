import { useEffect, useState } from "react";
import {
  listarAlunos,
  type Aluno,
} from "../../../services/alunos.service";
import {
  listarAlunosPerfis,
  type AlunoPerfil,
} from "../../../services/alunosPerfis.service";
import {
  listarAlunosTurmas,
  type AlunoTurma,
} from "../../../services/alunosTurmas.service";
import {
  listarDisciplinas,
  type Disciplina,
} from "../../../services/disciplinas.service";
import {
  listarHorarios,
  type Horario,
} from "../../../services/horarios.service";
import {
  listarHorariosAlunos,
  type HorarioAluno,
} from "../../../services/horariosAlunos.service";
import {
  listarInstrumentos,
  type Instrumento,
} from "../../../services/instrumentos.service";
import {
  listarNiveis,
  type Nivel,
} from "../../../services/niveis.service";
import {
  listarProfessores,
  type Professor,
} from "../../../services/professores.service";
import {
  listarTurmas,
  type Turma,
} from "../../../services/turmas.service";
import { obterMensagemErro } from "../../../utils/errors";

export function useHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [horariosAlunos, setHorariosAlunos] = useState<
    HorarioAluno[]
  >([]);

  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [alunosTurmas, setAlunosTurmas] = useState<
    AlunoTurma[]
  >([]);

  const [alunosPerfis, setAlunosPerfis] = useState<
    AlunoPerfil[]
  >([]);

  const [professores, setProfessores] = useState<
    Professor[]
  >([]);

  const [turmas, setTurmas] = useState<Turma[]>([]);

  const [disciplinas, setDisciplinas] = useState<
    Disciplina[]
  >([]);

  const [instrumentos, setInstrumentos] = useState<
    Instrumento[]
  >([]);

  const [niveis, setNiveis] = useState<Nivel[]>([]);

  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setACarregar(true);
      setErro("");

      const [
        dadosHorarios,
        dadosHorariosAlunos,
        dadosAlunos,
        dadosAlunosTurmas,
        dadosAlunosPerfis,
        dadosProfessores,
        dadosTurmas,
        dadosDisciplinas,
        dadosInstrumentos,
        dadosNiveis,
      ] = await Promise.all([
        listarHorarios(),
        listarHorariosAlunos(),
        listarAlunos(),
        listarAlunosTurmas(),
        listarAlunosPerfis(),
        listarProfessores(),
        listarTurmas(),
        listarDisciplinas(),
        listarInstrumentos(),
        listarNiveis(),
      ]);

      setHorarios(dadosHorarios);
      setHorariosAlunos(dadosHorariosAlunos);
      setAlunos(dadosAlunos);
      setAlunosTurmas(dadosAlunosTurmas);
      setAlunosPerfis(dadosAlunosPerfis);
      setProfessores(dadosProfessores);
      setTurmas(dadosTurmas);
      setDisciplinas(dadosDisciplinas);
      setInstrumentos(dadosInstrumentos);
      setNiveis(dadosNiveis);
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível carregar os horários.",
        ),
      );
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return {
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
  };
}