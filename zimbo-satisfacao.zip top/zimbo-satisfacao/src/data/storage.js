import { supabase, supabaseAtivo } from './supabaseClient.js'

const KEY = 'zimbo_respostas_v1'

// Webhook opcional (Zapier / Make / n8n / etc.) chamado a cada avaliação
// com nota geral 1 ou 2, para disparar e-mail, WhatsApp ou notificação
// para a equipe. Deixe VITE_ALERT_WEBHOOK_URL vazio para desativar.
const ALERT_WEBHOOK_URL = import.meta.env.VITE_ALERT_WEBHOOK_URL || ''

const lojas = ['Bela Vista', 'Vila Operária']
const comentariosPositivos = [
  'Atendimento muito rápido, adorei!',
  'Loja sempre limpa e organizada.',
  'Preço bom, voltarei sempre.',
  'Padaria maravilhosa, pão quentinho!',
  'Equipe muito educada no caixa.',
]
const comentariosNegativos = [
  'Fila do caixa demorou muito hoje.',
  'Faltou opção de troco em algumas notas.',
  'Poucos funcionários no setor de hortifrúti.',
  'Gostaria de mais variedade de produtos importados.',
]

function clamp(n) { return Math.min(5, Math.max(1, n)) }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function seedIfEmpty() {
  const existing = localStorage.getItem(KEY)
  if (existing) return
  const seed = []
  const now = Date.now()
  for (let i = 0; i < 24; i++) {
    const geral = Math.random() < 0.75 ? (Math.random() < 0.5 ? 5 : 4) : Math.floor(Math.random() * 3) + 1
    const isGood = geral >= 4
    seed.push({
      id: `seed-${i}`,
      loja: lojas[i % 2],
      geral,
      atendimento: clamp(geral + rand(-1, 1)),
      limpeza: clamp(geral + rand(-1, 1)),
      variedade: clamp(geral + rand(-1, 1)),
      preco: clamp(geral + rand(-1, 1)),
      agilidade: clamp(geral + rand(-1, 1)),
      nps: isGood ? (Math.random() < 0.8 ? 'sim' : 'talvez') : (Math.random() < 0.6 ? 'nao' : 'talvez'),
      caixa: Math.random() < 0.4 ? `Caixa ${rand(1, 5)}` : '',
      operador: '',
      comentario: Math.random() < 0.55
        ? (isGood ? pick(comentariosPositivos) : pick(comentariosNegativos))
        : '',
      nome: '',
      contato: '',
      criadoEm: now - i * 1000 * 60 * 60 * (3 + Math.random() * 9),
    })
  }
  localStorage.setItem(KEY, JSON.stringify(seed))
}

// ---------- Modo localStorage (demonstração, sem Supabase configurado) ----------

function getRespostasLocal() {
  seedIfEmpty()
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

function salvarRespostaLocal(resposta) {
  const atuais = getRespostasLocal()
  const nova = { ...resposta, id: `r-${Date.now()}`, criadoEm: Date.now() }
  localStorage.setItem(KEY, JSON.stringify([nova, ...atuais]))
  return nova
}

// ---------- Modo Supabase (produção, várias lojas/dispositivos veem tudo) ----------

function linhaParaResposta(row) {
  return {
    id: row.id,
    loja: row.loja,
    geral: row.geral,
    atendimento: row.atendimento,
    limpeza: row.limpeza,
    variedade: row.variedade,
    preco: row.preco,
    agilidade: row.agilidade,
    nps: row.nps,
    caixa: row.caixa || '',
    operador: row.operador || '',
    comentario: row.comentario || '',
    nome: row.nome || '',
    contato: row.contato || '',
    criadoEm: new Date(row.criado_em).getTime(),
  }
}

async function getRespostasSupabase() {
  const { data, error } = await supabase
    .from('respostas')
    .select('*')
    .order('criado_em', { ascending: false })
  if (error) {
    console.error('Erro ao buscar respostas no Supabase:', error)
    return []
  }
  return data.map(linhaParaResposta)
}

async function salvarRespostaSupabase(resposta) {
  const { data, error } = await supabase
    .from('respostas')
    .insert({
      loja: resposta.loja,
      geral: resposta.geral,
      atendimento: resposta.atendimento,
      limpeza: resposta.limpeza,
      variedade: resposta.variedade,
      preco: resposta.preco,
      agilidade: resposta.agilidade,
      nps: resposta.nps,
      caixa: resposta.caixa || null,
      operador: resposta.operador || null,
      comentario: resposta.comentario || null,
      nome: resposta.nome || null,
      contato: resposta.contato || null,
    })
    .select()
    .single()
  if (error) {
    console.error('Erro ao salvar resposta no Supabase:', error)
    throw error
  }
  return linhaParaResposta(data)
}

// ---------- API pública usada pelas páginas ----------

export async function getRespostas() {
  if (supabaseAtivo) return getRespostasSupabase()
  return getRespostasLocal()
}

export async function salvarResposta(resposta) {
  const nova = supabaseAtivo
    ? await salvarRespostaSupabase(resposta)
    : salvarRespostaLocal(resposta)

  if (nova.geral <= 2) {
    dispararAlertaNotaBaixa(nova)
  }
  return nova
}

function dispararAlertaNotaBaixa(resposta) {
  if (!ALERT_WEBHOOK_URL) return
  fetch(ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texto: `⚠️ Avaliação baixa no Zimbo (${resposta.loja}): ${resposta.geral}/5 estrelas. ${resposta.comentario || 'Sem comentário.'}`,
      loja: resposta.loja,
      nota: resposta.geral,
      comentario: resposta.comentario,
      contato: resposta.contato,
      nome: resposta.nome,
    }),
  }).catch((err) => console.error('Falha ao chamar webhook de alerta:', err))
}

export function limparRespostas() {
  localStorage.removeItem(KEY)
}
