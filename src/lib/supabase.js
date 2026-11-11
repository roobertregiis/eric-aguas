import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const DEMO = import.meta.env.DEV && import.meta.env.VITE_DEMO === '1';
export const configured = Boolean(url && anon);
export const supabase = configured ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

const TABELAS = ['produtos', 'clientes', 'vendas', 'estoque_mov', 'gastos', 'cobrancas'];

async function todas(tabela) {
  const out = []; const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(tabela).select('*').range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export async function carregarTudo() {
  if (DEMO) { const { gerarDemo } = await import('./demo.js'); return gerarDemo(); }
  const res = await Promise.all(TABELAS.map(todas));
  return Object.fromEntries(TABELAS.map((t, i) => [t, res[i]]));
}

export async function inserir(tabela, linha) {
  if (DEMO) return { ...linha, id: Date.now() };
  const { data, error } = await supabase.from(tabela).insert(linha).select().single();
  if (error) throw error;
  return data;
}

export async function atualizar(tabela, id, campos) {
  if (DEMO) return { id, ...campos };
  const { data, error } = await supabase.from(tabela).update(campos).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
