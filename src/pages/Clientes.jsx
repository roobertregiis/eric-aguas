import { useMemo, useState } from 'react';
import { useDados } from '../App.jsx';
import { Card, Kpi, PageHead, Tabela } from '../components/ui.jsx';
import { agrupar, brl, dataBR, hojeISO, num, soma } from '../lib/format.js';

const dias = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

export default function Clientes() {
  const { clientes, vendas } = useDados();
  const [q, setQ] = useState('');
  const [f, setF] = useState('');
  const linhas = useMemo(() => {
    const por = agrupar(vendas, (v) => (v.cliente_nome || '').trim().toUpperCase());
    const ref = vendas.map((v) => v.data).sort().at(-1) || hojeISO();
    return clientes.map((c) => {
      const a = por.get(c.nome.trim().toUpperCase()) ?? [];
      const ultima = a.map((x) => x.data).sort().at(-1);
      const sem = ultima ? dias(ultima, ref) : null;
      const seg = !a.length ? 'Sem compras' : sem > 45 ? 'Em risco' : sem > 25 ? 'Atenção' : 'Ativo';
      return { id: c.id, nome: c.nome, telefone: c.telefone, pedidos: a.length, total: soma(a, (x) => x.valor), ultima, sem, seg, pagamento: c.forma_pagamento };
    });
  }, [clientes, vendas]);
  const vis = linhas.filter((l) => (!f || l.seg === f) && (!q || l.nome.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.total - a.total);
  const cont = (s) => linhas.filter((l) => l.seg === s).length;
  const cls = { Ativo: 'ok', Atenção: 'warn', 'Em risco': 'bad', 'Sem compras': '' };
  return (
    <>
      <PageHead titulo="Clientes (CRM)" sub="Segmentação por tempo desde a última compra" />
      <div className="grid kpis">
        <Kpi hero label="Clientes cadastrados" value={num(clientes.length)} />
        <Kpi label="Ativos (até 25 dias)" value={num(cont('Ativo'))} />
        <Kpi label="Atenção (26–45 dias)" value={num(cont('Atenção'))} />
        <Kpi label="Em risco (+45 dias)" value={num(cont('Em risco'))} hint="oportunidade de reativação" />
      </div>
      <Card>
        <div className="toolbar">
          <input type="search" placeholder="Buscar cliente" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar cliente" />
          <select value={f} onChange={(e) => setF(e.target.value)} aria-label="Segmento"><option value="">Todos</option>{Object.keys(cls).map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <Tabela limite={50} linhas={vis} colunas={[
          { k: 'nome', t: 'Cliente' }, { k: 'seg', t: 'Segmento', f: (v) => <span className={`pill ${cls[v]}`}>{v}</span> },
          { k: 'pedidos', t: 'Pedidos', num: true }, { k: 'total', t: 'Total', num: true, f: brl }, { k: 'ultima', t: 'Última compra', f: dataBR },
          { k: 'telefone', t: 'WhatsApp', f: (v) => { const d = (v || '').replace(/\D/g, ''); return d.length >= 10 ? <a href={`https://wa.me/55${d}`} target="_blank" rel="noopener noreferrer">Chamar</a> : '—'; } },
        ]} />
      </Card>
    </>
  );
}
