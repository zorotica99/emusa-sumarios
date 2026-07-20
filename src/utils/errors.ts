export function obterMensagemErro(
  erro: unknown,
  mensagemPadrao: string,
): string {
  if (erro instanceof Error && erro.message.trim()) {
    return erro.message;
  }

  return mensagemPadrao;
}