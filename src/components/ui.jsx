import { useMemo, useState } from 'react';

export function Kpi({ label, value, hint, hero, delta }) {
  return (
    <div className={`card kpi${hero ? ' hero' : ''}`}>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {delta != null && <span className="delta">{delta}</span>}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Card({ titulo, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {titulo && <h2>{titulo}</h2>}
      {children}
    </section>
  );
}

export function PageHead({ titulo, sub, children }) {
  return (
    <div className="page-head">
      <div><h1>{titulo}</h1>{sub && <div className="sub">{sub}</div>}</div>
      <div className="toolbar" style={{ margin: 0 }}>{children}</div>
    </div>
  );
}

// colunas: [{ k, t, f?(valor,linha), num? }]
export function Tabela({ colunas, linhas, limite = 100, vazio = 'Sem registros' }) {
  const [todas, setTodas] = useState(false);
  const vis = useMemo(() => (todas ? linhas : linhas.slice(0, limite)), [linhas, todas, limite]);
  if (!linhas.length) return <div className="empty">{vazio}</div>;
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr>{colunas.map((c) => <th key={c.t} className={c.num ? 'num' : ''}>{c.t}</th>)}</tr></thead>
          <tbody>
            {vis.map((l, i) => (
              <tr key={l.id ?? i}>
                {colunas.map((c) => <td key={c.t} className={c.num ? 'num' : ''}>{c.f ? c.f(l[c.k], l) : l[c.k] ?? '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {linhas.length > limite && (
        <div className="toolbar" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <span className="sub">Mostrando {vis.length} de {linhas.length}</span>
          <button className="btn secondary small" onClick={() => setTodas(!todas)}>{todas ? 'Mostrar menos' : 'Mostrar todos'}</button>
        </div>
      )}
    </>
  );
}
