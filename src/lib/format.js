export const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
export const num = (v) => new Intl.NumberFormat('pt-BR').format(Number(v) || 0);
export const pct = (v) => `${(Number(v) || 0).toFixed(1).replace('.', ',')}%`;
export const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');
export const mes = (iso) => (iso || '').slice(0, 7);
export const mesLabel = (ym) => {
  const [y, m] = ym.split('-');
  return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m - 1] + '/' + y.slice(2);
};
export const soma = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
export const hojeISO = () => new Date().toISOString().slice(0, 10);
export function agrupar(arr, chave) {
  const m = new Map();
  for (const x of arr) { const k = chave(x) ?? '—'; (m.get(k) ?? m.set(k, []).get(k)).push(x); }
  return m;
}
// Evita injeção de fórmula ao exportar CSV
export const csvSeguro = (v) => { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; };
