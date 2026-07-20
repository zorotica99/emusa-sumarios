import {
  CalendarCheck2,
  CalendarRange,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  guardarAnoLetivo,
  obterAnoLetivoAtual,
} from "../../services/anoLetivo.service";
import { obterMensagemErro } from "../../utils/errors";
import "./AnoLetivo.css";

interface AnoLetivoFormData {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

const dadosIniciais: AnoLetivoFormData = {
  nome: "",
  dataInicio: "",
  dataFim: "",
};

function formatarData(data: string): string {
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

function AnoLetivo() {
  const [formulario, setFormulario] =
    useState<AnoLetivoFormData>(dadosIniciais);

  const [configurado, setConfigurado] = useState(false);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarAnoLetivo() {
      try {
        setErro("");

        const configuracao = await obterAnoLetivoAtual();

        if (configuracao) {
          setFormulario({
            nome: configuracao.nome,
            dataInicio: configuracao.data_inicio,
            dataFim: configuracao.data_fim,
          });

          setConfigurado(true);
        }
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar o ano letivo.",
          ),
        );
      } finally {
        setACarregar(false);
      }
    }

    carregarAnoLetivo();
  }, []);

  function alterarCampo(
    campo: keyof AnoLetivoFormData,
    valor: string,
  ) {
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));

    setErro("");
    setSucesso("");
  }

  async function submeter(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      setErro("O nome do ano letivo é obrigatório.");
      return;
    }

    if (!formulario.dataInicio || !formulario.dataFim) {
      setErro("Preencha as datas de início e fim.");
      return;
    }

    if (formulario.dataFim < formulario.dataInicio) {
      setErro(
        "A data de fim deve ser posterior à data de início.",
      );
      return;
    }

    try {
      setAGuardar(true);
      setErro("");
      setSucesso("");

      await guardarAnoLetivo(formulario);

      setConfigurado(true);
      setSucesso("Ano letivo guardado com sucesso.");
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível guardar o ano letivo.",
        ),
      );
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <main className="page">
      <PageHeader
        title="Ano letivo"
        description="Definir o período oficial de funcionamento da escola."
      />

      {erro && <div className="alert alert--error">{erro}</div>}

      {sucesso && (
        <div className="alert alert--success">{sucesso}</div>
      )}

      <section className="school-year-layout">
        <div className="panel">
          <h2>
            <CalendarRange size={21} />
            Configuração
          </h2>

          {aCarregar ? (
            <p className="muted-text">A carregar...</p>
          ) : (
            <form className="form" onSubmit={submeter}>
              <div className="form-field">
                <label htmlFor="ano-letivo-nome">
                  Nome do ano letivo
                </label>

                <input
                  id="ano-letivo-nome"
                  type="text"
                  value={formulario.nome}
                  onChange={(event) =>
                    alterarCampo("nome", event.target.value)
                  }
                  placeholder="Ex.: 2026/2027"
                />
              </div>

              <div className="form-field">
                <label htmlFor="ano-letivo-inicio">
                  Data de início
                </label>

                <input
                  id="ano-letivo-inicio"
                  type="date"
                  value={formulario.dataInicio}
                  onChange={(event) =>
                    alterarCampo(
                      "dataInicio",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="ano-letivo-fim">
                  Data de fim
                </label>

                <input
                  id="ano-letivo-fim"
                  type="date"
                  value={formulario.dataFim}
                  onChange={(event) =>
                    alterarCampo("dataFim", event.target.value)
                  }
                />
              </div>

              <button
                className="button button--primary"
                type="submit"
                disabled={aGuardar}
              >
                <Save size={18} />

                {aGuardar
                  ? "A guardar..."
                  : "Guardar ano letivo"}
              </button>
            </form>
          )}
        </div>

        <div className="school-year-summary">
          <div className="school-year-summary__icon">
            <CalendarCheck2 size={30} />
          </div>

          <span>Período atual</span>

          <h2>
            {configurado
              ? formulario.nome
              : "Ainda não configurado"}
          </h2>

          {configurado ? (
            <p>
              {formatarData(formulario.dataInicio)}
              {" até "}
              {formatarData(formulario.dataFim)}
            </p>
          ) : (
            <p>
              Defina as datas oficiais do ano letivo da EMUSA.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default AnoLetivo;