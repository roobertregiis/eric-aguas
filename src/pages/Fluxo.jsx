import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead, Tabela } from '../components/ui.jsx';
import { brl, mes, mesLabel, soma } from '../lib/format.js';

export default function Fluxo() {
  const { vendas, gastos, estoque_mov } = useDados();
  const serie = useMemo(() => {
    const meses = [...new Set([...vendas.map((v) => mes(v.data_pagamento || '')), ...gastos.map((g) => mes(g.data)), ...estoque_mov.map((e) => mes(e.data))])].filter(Boolean).sort();
    let acum = 0;
    return meses.map((m) => {
      const entradas = soma(vendas.filter((v) => mes(v.data_pagamento || '') === m), (v) => Number(v.valor) - Number(v.saldo_devedor || 0));
      const saidas = soma(gastos.filter((g) => mes(g.data) === m), (g) => g.valor_total) + soma(estoque_mov.filter((e) => mes(e.data) === m), (e) => e.valor_total);
      acum += entradas - saidas;
      return { id: m, mes: mesLabel(m), entradas, saidas, saldo: entradas - saidas, acumulado: acum };
    });
  }, [vendas, gastos, estoque_mov]);
  const tot = (k) => soma(serie, (s) => s[k]);
  return (
    <>
      <PageHead titulo="Fluxo de caixa" sub="Entradas pela data de pagamento · saídas = gastos + compras de estoque" />
      <div className="grid kpis">
        <Kpi hero label="Saldo acumulado" value={brl(tot('saldo'))} />
        <Kpi label="Entradas" value={brl(tot('entradas'))} />
        <Kpi label="Saídas" value={brl(tot('saidas'))} />
        <Kpi label="Média mensal" value={brl(serie.length ? tot('saldo') / serie.length : 0)} hint="resultado de caixa" />
      </div>
      <Card titulo="Entradas × saídas">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={serie}>
            <CartesianGrid stroke="#d9e3f0" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={brl} contentStyle={{ borderRadius: 14 }} />
            <Legend />
            <Bar dataKey="entradas" name="Entradas" fill="#2f6db5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="saidas" name="Saídas" fill="#9dbfe6" radius={[8, 8, 0, 0]} />
            <Line dataKey="acumulado" name="Acumulado" stroke="#0e2652" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
      <div style={{ height: 'var(--gap)' }} />
      <Card titulo="Mês a mês">
        <Tabela linhas={[...serie].reverse()} colunas={[{ k: 'mes', t: 'Mês' }, { k: 'entradas', t: 'Entradas', num: true, f: brl }, { k: 'saidas', t: 'Saídas', num: true, f: brl }, { k: 'saldo', t: 'Saldo', num: true, f: brl }, { k: 'acumulado', t: 'Acumulado', num: true, f: brl }]} />
      </Card>
    </>
  );
}
