export function fromCentavos(c: bigint | number): number {
  const n = typeof c === 'bigint' ? Number(c) : c;
  return n / 100;
}
export function formatBRL(c: bigint | number): string {
  return fromCentavos(c).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
