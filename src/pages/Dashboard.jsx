import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead } from '../components/ui.jsx';
import { agrupar, brl, mes, mesLabel, num, pct, soma } from '../lib/format.js';

const CORES = ['#0e2652', '#2f6db5', '#4a86c9', '#9dbfe6', '#1d4a8a', '#c7dcf2'];
const tip = { contentStyle: { borderRadius: 14, border: '1px solid #d9e3f0', fontFamily: 'inherit' }, formatter: (v) => brl(v) };

export default function Dashboard() {
  const { vendas, gastos } = useDados();
  const d = useMemo(() => {
    const meses = [...new Set(vendas.map((v) => mes(v.data)))].sort();
    const atual = meses.at(-1); const ant = meses.at(-2);
    const doMes = (m) => vendas.filter((v) => mes(v.data) === m);
    const rec = (m) => soma(doMes(m), (v) => v.valor);
    const serie = meses.map((m) => ({ mes: mesLabel(m), receita: rec(m), gastos: soma(gastos.filter((g) => mes(g.data) === m), (g) => g.valor_total) }));
    const vm = doMes(atual);
    const receita = rec(atual); const custo = soma(vm, (v) => v.valor_custo);
    const gmes = soma(gastos.filter((g) => mes(g.data) === atual), (g) => g.valor_total);
    const porProd = [...agrupar(vm, (v) => v.produto?.replace('ÁGUA DE 20 LITROS - ', '')).entries()].map(([n, a]) => ({ n, v: soma(a, (x) => x.valor) })).sort((a, b) => b.v - a.v).slice(0, 6);
    const porPag = [...agrupar(vm, (v) => v.forma_pagamento).entries()].map(([n, a]) => ({ n, v: a.length })).sort((a, b) => b.v - a.v);
    const porEnt = [...agrupar(vm, (v) => v.entregador).entries()].map(([n, a]) => ({ n, v: a.length })).sort((a, b) => b.v - a.v);
    return {
      atual, serie, receita, pedidos: vm.length, ticket: vm.length ? receita / vm.length : 0, areceber: soma(vendas, (v) => v.saldo_devedor),
      margem: receita - custo, margemPct: receita ? ((receita - custo) / receita) * 100 : 0, gmes, resultado: receita - custo - gmes,
      variacao: ant && rec(ant) ? ((receita - rec(ant)) / rec(ant)) * 100 : null, porProd, porPag, porEnt,
    };
  }, [vendas, gastos]);

  return (
    <>
      <PageHead titulo="Dashboard" sub={d.atual ? `Mês de referência: ${mesLabel(d.atual)}` : 'Sem vendas'} />
      <div className="grid kpis">
        <Kpi hero label="Receita do mês" value={brl(d.receita)} delta={d.variacao == null ? null : `${d.variacao >= 0 ? '▲' : '▼'} ${pct(Math.abs(d.variacao))} vs mês anterior`} hint={`${num(d.pedidos)} pedidos`} />
        <Kpi label="Ticket médio" value={brl(d.ticket)} hint="por pedido" />
        <Kpi label="Margem bruta" value={brl(d.margem)} hint={pct(d.margemPct) + ' da receita'} />
        <Kpi label="A receber" value={brl(d.areceber)} hint="saldo devedor total" />
      </div>
      <div className="grid kpis">
        <Kpi label="Gastos do mês" value={brl(d.gmes)} hint="funcionários, manutenção, etc." />
        <Kpi label="Resultado do mês" value={brl(d.resultado)} hint="margem − gastos" />
        <Kpi label="Pedidos no mês" value={num(d.pedidos)} />
        <Kpi label="Meses com dados" value={num(d.serie.length)} />
      </div>
      <div className="grid cols-2">
        <Card titulo="Receita × gastos por mês">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={d.serie}>
              <CartesianGrid stroke="#d9e3f0" vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#0e2652" fill="#9dbfe6" fillOpacity={0.5} strokeWidth={2} />
              <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#4a86c9" fill="#e3edf8" fillOpacity={0.7} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Formas de pagamento (pedidos)">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={d.porPag} dataKey="v" nameKey="n" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {d.porPag.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
              </Pie>
              <Tooltip contentStyle={tip.contentStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="toolbar">{d.porPag.map((p, i) => <span key={p.n} className="pill" style={{ borderLeft: `8px solid ${CORES[i % CORES.length]}` }}>{p.n} · {p.v}</span>)}</div>
        </Card>
      </div>
      <div className="grid cols-2">
        <Card titulo="Receita por produto (mês)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.porProd} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="#d9e3f0" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${Math.round(v)}`} />
              <YAxis type="category" dataKey="n" tickLine={false} axisLine={false} fontSize={12} width={90} />
              <Tooltip {...tip} />
              <Bar dataKey="v" name="Receita" fill="#2f6db5" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card titulo="Pedidos por entregador (mês)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.porEnt}>
              <CartesianGrid stroke="#d9e3f0" vertical={false} />
              <XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
              <Tooltip contentStyle={tip.contentStyle} />
              <Bar dataKey="v" name="Pedidos" fill="#0e2652" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
