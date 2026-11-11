// Dados SINTÉTICOS apenas para desenvolvimento local (VITE_DEMO=1). Não contém dados reais; removido do build de produção.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const iso = (d) => d.toISOString().slice(0, 10);

export function gerarDemo() {
  const produtos = [
    ['PROD014', 'ÁGUA DE 20 LITROS - NEBLINA', 9.9, 15], ['PROD002', 'ÁGUA DE 20 LITROS - INDAIÁ', 9.9, 16],
    ['PROD005', 'ÁGUA DE 20 LITROS - NATURÁGUA', 9.9, 15], ['PROD031', 'ÁGUA DE 20 LITROS - ACQUARELA', 9.9, 15],
    ['PROD028', 'ÁGUA DE 20 LITROS - VITÓRIA', 4, 8],
  ].map(([cod, d, c, v], i) => ({ id: i + 1, codigo_versao: cod + 'V1', cod_produto: cod, descricao: d, preco_compra: c, preco_venda: v }));
  const nomes = ['CLIENTE A', 'CLIENTE B', 'CLIENTE C', 'CLIENTE D', 'CLIENTE E', 'CLIENTE F', 'CLIENTE G', 'CLIENTE H', 'CLIENTE I', 'CLIENTE J'];
  const clientes = nomes.map((n, i) => ({ id: i + 1, cod_cliente: 1000000 + i, nome: n, data_cadastro: '2025-01-10', residencia: pick(['CASA', 'APTO']), endereco_completo: 'RUA EXEMPLO, ' + (100 + i), whatsapp: true, telefone: '(00) 00000-000' + i, forma_pagamento: pick(['PIX', 'DINHEIRO']), status: i % 7 === 0 ? 'INATIVO' : 'ATIVO', produto: pick(produtos).descricao }));
  const vendas = []; const hoje = new Date(); let pedido = 1;
  for (let d = 300; d >= 0; d--) {
    const dia = new Date(hoje - d * 864e5);
    const n = 4 + Math.floor(rnd() * 6);
    for (let k = 0; k < n; k++) {
      const p = pick(produtos); const q = 1 + Math.floor(rnd() * 3); const c = pick(clientes);
      const fiado = rnd() < 0.05; const valor = q * p.preco_venda;
      vendas.push({ id: pedido, pedido: pedido++, data: iso(dia), entregador: pick(['SHELTON', 'SHELTON', 'SHELTON', 'ERIC FEITOSA']), telefone: c.telefone, cliente_nome: c.nome, cod_produto: p.cod_produto, produto: p.descricao, qtde: q, valor_custo: q * p.preco_compra, valor_venda: valor, valor, desconto: false, forma_pagamento: fiado ? 'FIADO' : pick(['PIX', 'PIX', 'DINHEIRO']), instituicao: 'NUBANK', saldo_devedor: fiado ? valor : 0, garrafao_emprestado: 0, data_pagamento: fiado ? null : iso(dia) });
    }
  }
  const estoque_mov = []; const gastos = [];
  for (let m = 0; m < 10; m++) {
    for (const p of produtos) estoque_mov.push({ id: estoque_mov.length + 1, data: iso(new Date(hoje - (300 - m * 30) * 864e5)), cod_produto: p.cod_produto, produto: p.descricao, quantidade: 160, valor_custo: p.preco_compra, valor_total: 160 * p.preco_compra });
    for (const [cat, v] of [['FUNCIONÁRIO', 2400], ['MANUTENÇÃO', 300], ['CONTADOR', 250], ['UTILITÁRIOS', 180]]) gastos.push({ id: gastos.length + 1, data: iso(new Date(hoje - (300 - m * 30) * 864e5)), categoria: cat, produto: cat, quantidade: 1, valor_custo: v, valor_total: v });
  }
  const cobrancas = clientes.slice(0, 3).map((c, i) => ({ id: i + 1, data: iso(new Date(hoje - 20 * 864e5)), cliente: c.nome, descricao: produtos[0].descricao, qtde: 2, valor: 30, pago: false }));
  return { produtos, clientes, vendas, estoque_mov, gastos, cobrancas };
}
