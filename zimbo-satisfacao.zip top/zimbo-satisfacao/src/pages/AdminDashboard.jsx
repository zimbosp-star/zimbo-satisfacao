import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getRespostas } from '../data/storage.js'
import { isAdminLogado, logoutAdmin } from '../data/auth.js'
import { supabaseAtivo } from '../data/supabaseClient.js'
import { exportarCsv } from '../data/exportCsv.js'

const categorias = [
  { chave: 'atendimento', rotulo: 'Atendimento' },
  { chave: 'limpeza', rotulo: 'Limpeza' },
  { chave: 'variedade', rotulo: 'Variedade' },
  { chave: 'preco', rotulo: 'Preço' },
  { chave: 'agilidade', rotulo: 'Agilidade' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [respostas, setRespostas] = useState([])
  const [filtroLoja, setFiltroLoja] = useState('todas')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)
    const dados = await getRespostas()
    setRespostas(dados)
    setCarregando(false)
  }

  useEffect(() => {
    (async () => {
      if (!(await isAdminLogado())) {
        navigate('/admin')
        return
      }
      carregar()
    })()
    // Atualiza sozinho a cada 30s para pegar novas avaliações de outros dispositivos
    const intervalo = setInterval(carregar, 30000)
    return () => clearInterval(intervalo)
  }, [navigate])

  const filtradas = useMemo(() => {
    if (filtroLoja === 'todas') return respostas
    return respostas.filter((r) => r.loja === filtroLoja)
  }, [respostas, filtroLoja])

  const mediaGeral = useMemo(() => {
    if (!filtradas.length) return 0
    return (filtradas.reduce((s, r) => s + r.geral, 0) / filtradas.length).toFixed(1)
  }, [filtradas])

  const nps = useMemo(() => {
    if (!filtradas.length) return 0
    const promotores = filtradas.filter((r) => r.nps === 'sim').length
    const detratores = filtradas.filter((r) => r.nps === 'nao').length
    return Math.round(((promotores - detratores) / filtradas.length) * 100)
  }, [filtradas])

  const dadosGrafico = useMemo(() => {
    return categorias.map((cat) => {
      const soma = filtradas.reduce((s, r) => s + (r[cat.chave] || 0), 0)
      const media = filtradas.length ? soma / filtradas.length : 0
      return { rotulo: cat.rotulo, media: Number(media.toFixed(2)) }
    })
  }, [filtradas])

  const baixasNotas = useMemo(
    () => filtradas.filter((r) => r.geral <= 2).sort((a, b) => b.criadoEm - a.criadoEm),
    [filtradas]
  )

  const evolucao = useMemo(() => {
    if (!filtradas.length) return []
    const porDia = {}
    filtradas.forEach((r) => {
      const chave = new Date(r.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (!porDia[chave]) porDia[chave] = { soma: 0, qtd: 0, ts: r.criadoEm }
      porDia[chave].soma += r.geral
      porDia[chave].qtd += 1
    })
    return Object.entries(porDia)
      .map(([dia, v]) => ({ dia, media: Number((v.soma / v.qtd).toFixed(2)), ts: v.ts }))
      .sort((a, b) => a.ts - b.ts)
      .slice(-14) // últimos 14 dias com dados
  }, [filtradas])

  function exportar() {
    exportarCsv(filtradas, `zimbo-avaliacoes-${filtroLoja === 'todas' ? 'geral' : filtroLoja}.csv`)
  }

  async function sair() {
    await logoutAdmin()
    navigate('/admin')
  }

  return (
    <div className="page page--dashboard">
      <header className="dash-header">
        <div>
          <h1>Painel de Satisfação</h1>
          <p>Zimbo Supermercado · visão geral das avaliações</p>
          <span className={`status-badge ${supabaseAtivo ? 'is-live' : 'is-demo'}`}>
            {supabaseAtivo ? '● Conectado ao banco de dados' : '● Modo demonstração (dados só neste navegador)'}
          </span>
        </div>
        <div className="dash-header__actions">
          <select value={filtroLoja} onChange={(e) => setFiltroLoja(e.target.value)}>
            <option value="todas">Todas as lojas</option>
            <option value="Bela Vista">Bela Vista</option>
            <option value="Vila Operária">Vila Operária</option>
          </select>
          <button className="btn btn--ghost" onClick={carregar} disabled={carregando}>
            {carregando ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link to="/admin/qrcode" className="btn btn--ghost">QR Code</Link>
          <button className="btn btn--ghost" onClick={exportar} disabled={!filtradas.length}>Exportar CSV</button>
          <button className="btn btn--ghost" onClick={sair}>Sair</button>
        </div>
      </header>

      {baixasNotas.length > 0 && (
        <div className="dash-alerta">
          ⚠️ Você tem <strong>{baixasNotas.length}</strong> avaliação(ões) com nota baixa aguardando atenção — veja a lista prioritária abaixo.
        </div>
      )}

      <section className="dash-cards">
        <div className="dash-card">
          <span className="dash-card__label">Nota média geral</span>
          <span className="dash-card__value">{mediaGeral} <small>/5</small></span>
        </div>
        <div className="dash-card">
          <span className="dash-card__label">NPS</span>
          <span className={`dash-card__value ${nps >= 50 ? 'is-good' : nps < 0 ? 'is-bad' : ''}`}>{nps}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card__label">Respostas</span>
          <span className="dash-card__value">{filtradas.length}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card__label">Notas baixas (1-2)</span>
          <span className="dash-card__value is-bad">{baixasNotas.length}</span>
        </div>
      </section>

      <section className="dash-chart">
        <h2>Média por categoria</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dadosGrafico} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--linha)" vertical={false} />
            <XAxis dataKey="rotulo" stroke="var(--ink-soft)" fontSize={13} />
            <YAxis domain={[0, 5]} stroke="var(--ink-soft)" fontSize={13} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--linha)' }} />
            <Bar dataKey="media" fill="var(--vermelho)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="dash-chart">
        <h2>Evolução da nota média (últimos dias)</h2>
        {evolucao.length < 2 ? (
          <p className="dash-list__vazio">Ainda não há dados suficientes de vários dias para mostrar a evolução.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={evolucao} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--linha)" vertical={false} />
              <XAxis dataKey="dia" stroke="var(--ink-soft)" fontSize={13} />
              <YAxis domain={[0, 5]} stroke="var(--ink-soft)" fontSize={13} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--linha)' }} />
              <Line type="monotone" dataKey="media" stroke="var(--vermelho)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="dash-list">
        <h2>Avaliações com nota baixa (prioridade)</h2>
        {baixasNotas.length === 0 && <p className="dash-list__vazio">Nenhuma avaliação baixa por aqui. 🎉</p>}
        <ul>
          {baixasNotas.map((r) => (
            <li key={r.id} className="dash-list__item is-bad">
              <div className="dash-list__topo">
                <strong>{r.loja}</strong>
                <span>{'★'.repeat(r.geral)}{'☆'.repeat(5 - r.geral)}</span>
              </div>
              {r.comentario && <p>{r.comentario}</p>}
              {(r.caixa || r.operador) && (
                <p className="dash-list__caixa">🧾 {[r.caixa, r.operador].filter(Boolean).join(' · ')}</p>
              )}
              {r.contato && <p className="dash-list__contato">Contato: {r.nome || 'sem nome'} · {r.contato}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-list">
        <h2>Todas as avaliações recentes</h2>
        <ul>
          {filtradas
            .slice()
            .sort((a, b) => b.criadoEm - a.criadoEm)
            .slice(0, 20)
            .map((r) => (
              <li key={r.id} className={`dash-list__item ${r.geral <= 2 ? 'is-bad' : r.geral === 5 ? 'is-good' : ''}`}>
                <div className="dash-list__topo">
                  <strong>{r.loja}</strong>
                  <span>{'★'.repeat(r.geral)}{'☆'.repeat(5 - r.geral)}</span>
                </div>
                {r.comentario && <p>{r.comentario}</p>}
                {(r.caixa || r.operador) && (
                  <p className="dash-list__caixa">🧾 {[r.caixa, r.operador].filter(Boolean).join(' · ')}</p>
                )}
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}
