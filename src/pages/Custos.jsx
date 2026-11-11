import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead, Tabela } from '../components/ui.jsx';
import { agrupar, brl, dataBR, soma } from '../lib/format.js';

export default function Custos() {
  const { gastos } = useDados();
  const porCat = useMemo(() => [...agrupar(gastos, (g) => g.categoria).entries()].map(([n, a]) => ({ n, v: soma(a, (x) => x.valor_total) })).sort((a, b) => b.v - a.v), [gastos]);
  const linhas = useMemo(() => [...gastos].sort((a, b) => b.data.localeCompare(a.data)), [gastos]);
  return (
    <>
      <PageHead titulo="Custos" sub="Gastos operacionais por categoria" />
      <div className="grid kpis">
        <Kpi hero label="Total de gastos" value={brl(soma(gastos, (g) => g.valor_total))} hint={`${gastos.length} lançamentos`} />
        {porCat.slice(0, 3).map((c) => <Kpi key={c.n} label={c.n} value={brl(c.v)} />)}
      </div>
      <div className="grid cols-2">
        <Card titulo="Por categoria">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porCat}>
              <CartesianGrid stroke="#d9e3f0" vertical={false} />
              <XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={brl} contentStyle={{ borderRadius: 14 }} />
              <Bar dataKey="v" name="Total" fill="#2f6db5" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Últimos lançamentos">
          <Tabela limite={8} linhas={linhas} colunas={[{ k: 'data', t: 'Data', f: dataBR }, { k: 'categoria', t: 'Categoria' }, { k: 'produto', t: 'Descrição' }, { k: 'valor_total', t: 'Valor', num: true, f: brl }]} />
        </Card>
      </div>
    </>
  );
}
