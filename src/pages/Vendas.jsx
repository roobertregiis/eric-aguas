import { useMemo, useState } from 'react';
import { useDados } from '../App.jsx';
import { Card, PageHead, Tabela } from '../components/ui.jsx';
import { brl, dataBR, hojeISO, mes, mesLabel, num, soma } from '../lib/format.js';

const PAGAMENTOS = ['PIX', 'DINHEIRO', 'FIADO', 'CARTÃO DE CRÉDITO', 'CARTÃO DE DÉBITO', 'BRINDE', 'ACERTOS', 'PARCIAL'];

export default function Vendas() {
  const { vendas, produtos, add } = useDados();
  const meses = useMemo(() => [...new Set(vendas.map((v) => mes(v.data)))].sort().reverse(), [vendas]);
  const [m, setM] = useState('');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ data: hojeISO(), cliente_nome: '', telefone: '', cod_produto: '', qtde: 1, forma_pagamento: 'PIX', entregador: '' });
  const [msg, setMsg] = useState('');

  const linhas = useMemo(() => vendas
    .filter((v) => (!m || mes(v.data) === m) && (!q || `${v.cliente_nome} ${v.produto} ${v.entregador}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.data + String(b.pedido).padStart(8, '0')).localeCompare(a.data + String(a.pedido).padStart(8, '0'))), [vendas, m, q]);

  const prods = useMemo(() => [...new Map(produtos.filter((p) => !p.fim_vigencia || p.fim_vigencia >= hojeISO()).map((p) => [p.cod_produto, p])).values()], [produtos]);

  async function salvar(e) {
    e.preventDefault(); setMsg('');
    const p = prods.find((x) => x.cod_produto === f.cod_produto);
    if (!p) return setMsg('Escolha um produto.');
    const qtde = Math.max(1, Number(f.qtde) || 1);
    const valor = qtde * Number(p.preco_venda || 0); const fiado = f.forma_pagamento === 'FIADO';
    try {
      await add('vendas', { data: f.data, cliente_nome: f.cliente_nome.trim(), telefone: f.telefone.trim() || null, cod_produto: p.cod_produto, produto: p.descricao, qtde, valor_custo: qtde * Number(p.preco_compra || 0), valor_venda: valor, valor, desconto: false, forma_pagamento: f.forma_pagamento, saldo_devedor: fiado ? valor : 0, data_pagamento: fiado ? null : f.data, entregador: f.entregador.trim() || null });
      setMsg('Venda registrada.'); setF({ ...f, cliente_nome: '', telefone: '', qtde: 1 });
    } catch { setMsg('Não foi possível salvar (verifique permissão).'); }
  }

  return (
    <>
      <PageHead titulo="Vendas" sub={`${num(linhas.length)} pedidos · ${brl(soma(linhas, (v) => v.valor))}`} />
      <Card titulo="Registrar pedido (telefone / WhatsApp)">
        <form className="form" onSubmit={salvar}>
          <label>Data<input type="date" required value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></label>
          <label>Cliente<input required maxLength={120} value={f.cliente_nome} onChange={(e) => setF({ ...f, cliente_nome: e.target.value })} /></label>
          <label>Telefone<input maxLength={30} value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} /></label>
          <label>Produto<select required value={f.cod_produto} onChange={(e) => setF({ ...f, cod_produto: e.target.value })}><option value="">Selecione</option>{prods.map((p) => <option key={p.cod_produto} value={p.cod_produto}>{p.descricao.replace('ÁGUA DE 20 LITROS - ', '')} · {brl(p.preco_venda)}</option>)}</select></label>
          <label>Qtde<input type="number" min="1" max="500" value={f.qtde} onChange={(e) => setF({ ...f, qtde: e.target.value })} /></label>
          <label>Pagamento<select value={f.forma_pagamento} onChange={(e) => setF({ ...f, forma_pagamento: e.target.value })}>{PAGAMENTOS.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label>Entregador<input maxLength={60} value={f.entregador} onChange={(e) => setF({ ...f, entregador: e.target.value })} /></label>
          <button className="btn">Salvar pedido</button>
        </form>
        {msg && <div className="sub" role="status" style={{ marginTop: 10 }}>{msg}</div>}
      </Card>
      <div style={{ height: 'var(--gap)' }} />
      <Card>
        <div className="toolbar">
          <input type="search" placeholder="Buscar cliente, produto ou entregador" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
          <select value={m} onChange={(e) => setM(e.target.value)} aria-label="Mês"><option value="">Todos os meses</option>{meses.map((x) => <option key={x} value={x}>{mesLabel(x)}</option>)}</select>
        </div>
        <Tabela limite={50} linhas={linhas} colunas={[
          { k: 'pedido', t: 'Pedido' }, { k: 'data', t: 'Data', f: dataBR }, { k: 'cliente_nome', t: 'Cliente' },
          { k: 'produto', t: 'Produto', f: (v) => v?.replace('ÁGUA DE 20 LITROS - ', '') }, { k: 'qtde', t: 'Qtde', num: true },
          { k: 'valor', t: 'Valor', num: true, f: brl }, { k: 'forma_pagamento', t: 'Pagamento', f: (v) => <span className="pill">{v}</span> },
          { k: 'entregador', t: 'Entregador' }, { k: 'saldo_devedor', t: 'Saldo devedor', num: true, f: (v) => (Number(v) > 0 ? <span className="pill warn">{brl(v)}</span> : '—') },
        ]} />
      </Card>
    </>
  );
}
