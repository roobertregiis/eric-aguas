import { useMemo } from 'react';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead, Tabela } from '../components/ui.jsx';
import { agrupar, brl, dataBR, soma } from '../lib/format.js';

export default function Cobranca() {
  const { vendas, cobrancas, upd } = useDados();
  const devedores = useMemo(() => [...agrupar(vendas.filter((v) => Number(v.saldo_devedor) > 0), (v) => v.cliente_nome).entries()]
    .map(([n, a]) => ({ id: n, cliente: n, pedidos: a.length, saldo: soma(a, (x) => x.saldo_devedor), ultima: a.map((x) => x.data).sort().at(-1) }))
    .sort((a, b) => b.saldo - a.saldo), [vendas]);
  const abertas = cobrancas.filter((c) => !c.pago);
  return (
    <>
      <PageHead titulo="Cobrança" sub="Saldos devedores e cobranças em aberto" />
      <div className="grid kpis">
        <Kpi hero label="Total a receber" value={brl(soma(devedores, (d) => d.saldo))} hint={`${devedores.length} clientes`} />
        <Kpi label="Cobranças abertas" value={brl(soma(abertas, (c) => c.valor))} hint={`${abertas.length} lançamentos`} />
      </div>
      <div className="grid cols-2">
        <Card titulo="Clientes com saldo devedor">
          <Tabela limite={15} linhas={devedores} colunas={[{ k: 'cliente', t: 'Cliente' }, { k: 'pedidos', t: 'Pedidos', num: true }, { k: 'ultima', t: 'Última compra', f: dataBR }, { k: 'saldo', t: 'Saldo', num: true, f: (v) => <span className="pill warn">{brl(v)}</span> }]} />
        </Card>
        <Card titulo="Cobranças">
          <Tabela limite={15} linhas={cobrancas} colunas={[
            { k: 'data', t: 'Data', f: dataBR }, { k: 'cliente', t: 'Cliente' }, { k: 'valor', t: 'Valor', num: true, f: brl },
            { k: 'pago', t: 'Situação', f: (v, l) => v ? <span className="pill ok">Pago</span> : <button className="btn small" onClick={() => upd('cobrancas', l.id, { pago: true })}>Marcar pago</button> },
          ]} />
        </Card>
      </div>
    </>
  );
}
