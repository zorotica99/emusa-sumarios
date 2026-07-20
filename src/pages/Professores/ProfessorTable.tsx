import { Pencil, Trash2 } from "lucide-react";
import type { ProfessorTableProps } from "./types";

function ProfessorTable({
  professores,
  instrumentos,
  aCarregar,
  onEdit,
  onDelete,
}: ProfessorTableProps) {
  function obterNomeInstrumento(instrumentoId: string | null) {
    if (!instrumentoId) {
      return "—";
    }

    const instrumento = instrumentos.find(
      (item) => item.id === instrumentoId,
    );

    return instrumento?.nome ?? "—";
  }

  return (
    <div className="panel">
      <h2>Lista de professores</h2>

      {aCarregar ? (
        <p className="muted-text">A carregar...</p>
      ) : professores.length === 0 ? (
        <p className="muted-text">Ainda não existem professores.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telemóvel</th>
                <th>Instrumento</th>
                <th className="data-table__actions">Ações</th>
              </tr>
            </thead>

            <tbody>
              {professores.map((professor) => (
                <tr key={professor.id}>
                  <td>{professor.nome}</td>
                  <td>{professor.email || "—"}</td>
                  <td>{professor.telemovel || "—"}</td>
                  <td>
                    {obterNomeInstrumento(professor.instrumento_id)}
                  </td>

                  <td className="data-table__actions">
                    <button
                      className="icon-button"
                      type="button"
                      title="Editar"
                      onClick={() => onEdit(professor)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="icon-button icon-button--danger"
                      type="button"
                      title="Eliminar"
                      onClick={() => onDelete(professor)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProfessorTable;