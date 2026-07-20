export interface FeriadoPortugal {
  data: string;
  titulo: string;
  tipo: "Feriado nacional";
}

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function adicionarDias(data: Date, dias: number): Date {
  const resultado = new Date(data);

  resultado.setDate(resultado.getDate() + dias);

  return resultado;
}

function calcularDomingoPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);

  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);
}

export function obterFeriadosPortugal(
  ano: number,
): FeriadoPortugal[] {
  const domingoPascoa = calcularDomingoPascoa(ano);

  const feriadosFixos = [
    {
      data: `${ano}-01-01`,
      titulo: "Ano Novo",
    },
    {
      data: `${ano}-04-25`,
      titulo: "Dia da Liberdade",
    },
    {
      data: `${ano}-05-01`,
      titulo: "Dia do Trabalhador",
    },
    {
      data: `${ano}-06-10`,
      titulo: "Dia de Portugal",
    },
    {
      data: `${ano}-08-15`,
      titulo: "Assunção de Nossa Senhora",
    },
    {
      data: `${ano}-10-05`,
      titulo: "Implantação da República",
    },
    {
      data: `${ano}-11-01`,
      titulo: "Dia de Todos os Santos",
    },
    {
      data: `${ano}-12-01`,
      titulo: "Restauração da Independência",
    },
    {
      data: `${ano}-12-08`,
      titulo: "Imaculada Conceição",
    },
    {
      data: `${ano}-12-25`,
      titulo: "Natal",
    },
  ];

  const feriadosMoveis = [
    {
      data: formatarDataISO(
        adicionarDias(domingoPascoa, -2),
      ),
      titulo: "Sexta-feira Santa",
    },
    {
      data: formatarDataISO(domingoPascoa),
      titulo: "Domingo de Páscoa",
    },
    {
      data: formatarDataISO(
        adicionarDias(domingoPascoa, 60),
      ),
      titulo: "Corpo de Deus",
    },
  ];

  return [...feriadosFixos, ...feriadosMoveis].map(
    (feriado) => ({
      ...feriado,
      tipo: "Feriado nacional" as const,
    }),
  );
}

export function encontrarFeriadoPortugal(
  data: string,
): FeriadoPortugal | undefined {
  const ano = Number(data.slice(0, 4));

  if (!Number.isInteger(ano)) {
    return undefined;
  }

  return obterFeriadosPortugal(ano).find(
    (feriado) => feriado.data === data,
  );
}