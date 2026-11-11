import { useMemo } from 'react';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead, Tabela } from '../components/ui.jsx';
import { brl, num, soma } from '../lib/format.js';

export default function Estoque() {
  const { estoque_mov, vendas } = useDados();
  const saldo = useMemo(() => {
    const m = new Map();
    for (const e of estoque_mov) { const k = e.cod_produto; const r = m.get(k) ?? { id: k, produto: e.produto, entradas: 0, saidas: 0, custo: 0 }; r.entradas += Number(e.quantidade) || 0; r.custo += Number(e.valor_total) || 0; m.set(k, r); }
    for (const v of vendas) { const r = m.get(v.cod_produto); if (r) r.saidas += Number(v.qtde) || 0; }
    return [...m.values()].map((r) => ({ ...r, saldo: r.entradas - r.saidas, cobertura: r.saidas ? r.entradas - r.saidas : r.entradas })).sort((a, b) => a.saldo - b.saldo);
  }, [estoque_mov, vendas]);
  return (
    <>
      <PageHead titulo="Estoque" sub="Saldo = entradas registradas − vendas" />
      <div className="grid kpis">
        <Kpi hero label="Unidades em estoque" value={num(soma(saldo, (r) => Math.max(0, r.saldo)))} hint="soma dos saldos positivos" />
        <Kpi label="Entradas" value={num(soma(saldo, (r) => r.entradas))} />
        <Kpi label="Saídas (vendas)" value={num(soma(saldo, (r) => r.saidas))} />
        <Kpi label="Custo das entradas" value={brl(soma(saldo, (r) => r.custo))} />
      </div>
      <Card titulo="Saldo por produto">
        <Tabela limite={100} linhas={saldo} colunas={[
          { k: 'produto', t: 'Produto' }, { k: 'entradas', t: 'Entradas', num: true, f: num }, { k: 'saidas', t: 'Saídas', num: true, f: num },
          { k: 'saldo', t: 'Saldo', num: true, f: (v) => <span className={`pill ${v < 0 ? 'bad' : v < 20 ? 'warn' : 'ok'}`}>{num(v)}</span> },
        ]} />
      </Card>
    </>
  );
}
