import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { DEMO, configured, supabase, carregarTudo, inserir, atualizar } from './lib/supabase.js';
import Dashboard from './pages/Dashboard.jsx';
import Vendas from './pages/Vendas.jsx';
import Estoque from './pages/Estoque.jsx';
import Custos from './pages/Custos.jsx';
import Cobranca from './pages/Cobranca.jsx';
import Fluxo from './pages/Fluxo.jsx';
import Clientes from './pages/Clientes.jsx';

const DataCtx = createContext(null);
export const useDados = () => useContext(DataCtx);

const ABAS = [
  ['/', 'Dashboard'], ['/vendas', 'Vendas'], ['/estoque', 'Estoque'], ['/custos', 'Custos'],
  ['/cobranca', 'Cobrança'], ['/fluxo', 'Fluxo de caixa'], ['/clientes', 'Clientes (CRM)'],
];

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  async function entrar(e) {
    e.preventDefault(); setBusy(true); setErro('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErro('E-mail ou senha inválidos.');
    setBusy(false);
  }
  return (
    <div className="login">
      <form className="card" onSubmit={entrar}>
        <img className="login-logo" src="./logo.png" alt="Eric Águas" width="120" height="120" />
        <h2>Entrar</h2>
        {!configured && <div className="notice">Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</div>}
        <input type="email" required autoComplete="username" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail" />
        <input type="password" required autoComplete="current-password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} aria-label="Senha" />
        {erro && <div className="error" role="alert">{erro}</div>}
        <button className="btn" disabled={busy || !configured}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}

export default function App() {
  const [sessao, setSessao] = useState(DEMO ? { demo: true } : null);
  const [pronto, setPronto] = useState(DEMO || !configured);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (DEMO || !configured) return;
    supabase.auth.getSession().then(({ data }) => { setSessao(data.session); setPronto(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const recarregar = useCallback(async () => {
    try { setErro(''); setDados(await carregarTudo()); }
    catch { setErro('Sem permissão ou falha ao carregar. Peça acesso à equipe.'); }
  }, []);

  useEffect(() => { if (sessao) recarregar(); else setDados(null); }, [sessao, recarregar]);

  const add = async (t, linha) => { await inserir(t, linha); await recarregar(); };
  const upd = async (t, id, campos) => { await atualizar(t, id, campos); await recarregar(); };

  if (!pronto) return null;
  if (!sessao) return <Login />;

  return (
    <DataCtx.Provider value={{ ...dados, add, upd, recarregar }}>
      <div className="app">
        <header className="topbar">
          <div className="brand"><img className="brand-logo" src="./logo-sm.png" alt="Eric Águas" width="44" height="44" /> Eric Águas</div>
          <nav className="tabs" aria-label="Seções">
            {ABAS.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>{t}</NavLink>)}
          </nav>
          {!DEMO && <button className="btn secondary small" onClick={() => supabase.auth.signOut()}>Sair</button>}
        </header>
        {DEMO && <div className="notice">Modo demonstração local com dados sintéticos.</div>}
        {erro && <div className="notice" role="alert">{erro}</div>}
        {!dados ? <div className="empty">Carregando…</div> : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/custos" element={<Custos />} />
            <Route path="/cobranca" element={<Cobranca />} />
            <Route path="/fluxo" element={<Fluxo />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </DataCtx.Provider>
  );
}
