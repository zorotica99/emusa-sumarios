import { BookOpenText, CalendarDays } from "lucide-react";

export interface AtividadeRecente {
  id: string;
  data: string;
  professor: string;
  turma: string;
  disciplina: string;
  conteudo: string;
}

interface RecentActivityProps {
  atividades: AtividadeRecente[];
  aCarregar: boolean;
}

function formatarData(data: string): string {
  if (!data) {
    return "Data inválida";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;
  const dataFormatada = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
  );

  if (Number.isNaN(dataFormatada.getTime())) {
    return data;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dataFormatada);
}

function RecentActivity({
  atividades,
  aCarregar,
}: RecentActivityProps) {
  return (
    <section className="recent-activity">
      <header className="recent-activity__header">
        <div>
          <h2>Atividade recente</h2>
          <p>Últimos sumários registados na aplicação.</p>
        </div>

        <div className="recent-activity__header-icon">
          <BookOpenText size={22} />
        </div>
      </header>

      {aCarregar ? (
        <p className="recent-activity__empty">A carregar...</p>
      ) : atividades.length === 0 ? (
        <p className="recent-activity__empty">
          Ainda não existem sumários registados.
        </p>
      ) : (
        <div className="recent-activity__list">
          {atividades.map((atividade) => (
            <article
              className="recent-activity__item"
              key={atividade.id}
            >
              <div className="recent-activity__date">
                <CalendarDays size={18} />
                <span>{formatarData(atividade.data)}</span>
              </div>

              <div className="recent-activity__content">
                <strong>
                  {atividade.professor} · {atividade.turma}
                </strong>

                <span>{atividade.disciplina}</span>

                <p>{atividade.conteudo}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;