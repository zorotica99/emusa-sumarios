import { supabase } from "../lib/supabase";

export interface HorarioAutomatico {
  id: string;

  professor_id: string;

  turma_id: string | null;

  disciplina_id: string | null;

  instrumento_id: string | null;

  nivel_id: string |null;

  tipo_aula:string;

  hora_inicio:string;

  hora_fim:string;

  dia_semana:number;
}

export async function obterHorarioAutomatico(
  professorId:string,
  diaSemana:number,
  hora:string,
){

const {data,error}=await supabase
.from("horarios")
.select(`
id,
professor_id,
turma_id,
disciplina_id,
instrumento_id,
nivel_id,
tipo_aula,
hora_inicio,
hora_fim,
dia_semana
`)
.eq("professor_id",professorId)
.eq("dia_semana",diaSemana)
.lte("hora_inicio",hora)
.gte("hora_fim",hora)
.maybeSingle();

if(error){
throw new Error(error.message);
}

return data as HorarioAutomatico|null;

}