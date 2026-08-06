export function formatarNomeAlimento(
  nome: string,
): string {
  return nome
    .replace(
      /^Arroz,\s*tipo\s*1,\s*/i,
      "Arroz branco, ",
    )
    .replace(/,\s*tipo\s*1\b/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function deveOcultarAlimento(
  nome: string,
): boolean {
  return /,\s*tipo\s*2\b/i.test(nome);
}

export function normalizarTermoBusca(
  termo: string,
): string {
  if (/^arroz\s+branco/i.test(termo)) {
    return "arroz";
  }

  return termo.trim();
}