// Uso: node scripts/gerar-seed.mjs <pasta-com-csvs>
// Converte os CSVs exportados da planilha em SQL (supabase/seed/*.sql). Saída contém dados pessoais: NÃO versionar.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('Informe a pasta dos CSVs'); process.exit(1); }
const out = path.resolve('supabase/seed');
fs.mkdirSync(out, { recursive: true });

function parse(file, skip) {
  const txt = fs.readFileSync(path.join(dir, file), 'utf8').replace(/^﻿/, '');
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ';') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.slice(skip).filter(r => r.some(x => x.trim()));
}
const s = v => { v = (v ?? '').trim(); return v === '' ? 'null' : "'" + v.replace(/'/g, "''") + "'"; };
const n = v => { v = (v ?? '').replace(/[^\d,\-]/g, '').replace(',', '.'); return v === '' || isNaN(+v) ? 'null' : v; };
const d = v => { const m = /^(\d\d)\/(\d\d)\/(\d{4})$/.exec((v ?? '').trim()); return m ? `'${m[3]}-${m[2]}-${m[1]}'` : 'null'; };
const b = v => { v = (v ?? '').trim().toUpperCase(); return v === 'SIM' ? 'true' : v === 'NÃO' || v === 'NAO' ? 'false' : 'null'; };

function emit(name, table, cols, rows, map) {
  const vals = rows.map(map).filter(Boolean);
  const CH = 300; let part = 0;
  for (let i = 0; i < vals.length; i += CH) {
    const sql = `insert into public.${table} (${cols}) values\n${vals.slice(i, i + CH).join(',\n')};\n`;
    fs.writeFileSync(path.join(out, `${name}_${String(++part).padStart(2, '0')}.sql`), sql);
  }
  console.log(name, vals.length, 'linhas em', part, 'arquivo(s)');
}

emit('01_produtos', 'produtos', 'codigo_versao,cod_produto,descricao,preco_compra,preco_venda,inicio_vigencia,fim_vigencia',
  parse('tblProdutos.csv', 6), r => `(${s(r[0])},${s(r[1])},${s(r[2])},${n(r[3])},${n(r[4])},${d(r[5])},${d(r[6])})`);

emit('02_clientes', 'clientes', 'cod_cliente,nome,data_cadastro,residencia,endereco_completo,whatsapp,telefone,forma_pagamento,banco,desconto,status,cod_produto,produto',
  parse('tblClientes.csv', 6), r => r[1]?.trim() && `(${n(r[2])},${s(r[1])},${d(r[0])},${s(r[3])},${s(r[8])},${b(r[10])},${s(r[11])},${s(r[13])},${s(r[14])},${b(r[15])},${s(r[16])},${s(r[17])},${s(r[18])})`);

emit('03_vendas', 'vendas', 'pedido,data,entregador,telefone,cliente_nome,cod_produto,produto,qtde,valor_custo,valor_venda,valor,desconto,forma_pagamento,instituicao,saldo_devedor,garrafao_emprestado,data_pagamento',
  parse('tblVendas.csv', 1), r => r[0]?.trim() && `(${n(r[0])},${d(r[1])},${s(r[3])},${s(r[4])},${s(r[5])},${s(r[6])},${s(r[7])},${n(r[8])},${n(r[9])},${n(r[10])},${n(r[11])},${b(r[12])},${s(r[13])},${s(r[14])},${n(r[15]) === 'null' ? 0 : n(r[15])},${n(r[16]) === 'null' ? 0 : Math.trunc(+n(r[16]))},${d(r[18])})`);

emit('04_estoque', 'estoque_mov', 'data,cod_produto,produto,quantidade,valor_custo,valor_total',
  parse('tblEstoque.csv', 6), r => d(r[0]) !== 'null' && `(${d(r[0])},${s(r[2])},${s(r[3])},${n(r[4])},${n(r[5])},${n(r[6])})`);

emit('05_gastos', 'gastos', 'data,categoria,produto,quantidade,valor_custo,valor_total',
  parse('tblGastos.csv', 6), r => d(r[0]) !== 'null' && `(${d(r[0])},${s(r[2])},${s(r[3])},${n(r[4])},${n(r[5])},${n(r[6])})`);

emit('06_cobrancas', 'cobrancas', 'data,cliente,descricao,qtde,valor',
  parse('SUPORTE-COBRANCA.csv', 4), r => r[1]?.trim() && n(r[4]) !== 'null' && `(${d(r[0])},${s(r[1])},${s(r[2])},${n(r[3])},${n(r[4])})`);
