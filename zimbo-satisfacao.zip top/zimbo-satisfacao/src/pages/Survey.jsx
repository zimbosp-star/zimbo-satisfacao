import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CartTrail from '../components/CartTrail.jsx'
import StarRating from '../components/StarRating.jsx'
import { salvarResposta } from '../data/storage.js'
import { formatarWhatsapp, whatsappValido } from '../data/phone.js'

const TOTAL_PASSOS = 6

const categorias = [
  { chave: 'atendimento', rotulo: 'Atendimento da equipe' },
  { chave: 'limpeza', rotulo: 'Limpeza e organização da loja' },
  { chave: 'variedade', rotulo: 'Variedade de produtos' },
  { chave: 'preco', rotulo: 'Preço' },
  { chave: 'agilidade', rotulo: 'Agilidade no caixa' },
]

export default function Survey() {
  const navigate = useNavigate()
  const [passo, setPasso] = useState(1)
  const [horaInicio] = useState(() => Date.now())
  const [isca, setIsca] = useState('') // campo-isca (honeypot): humano nunca preenche isso
  const [dados, setDados] = useState({
    loja: '',
    geral: 0,
    atendimento: 0,
    limpeza: 0,
    variedade: 0,
    preco: 0,
    agilidade: 0,
    nps: '',
    caixa: '',
    operador: '',
    comentario: '',
    nome: '',
    contato: '',
  })

  function atualizar(campo, valor) {
    setDados((d) => ({ ...d, [campo]: valor }))
  }

  function proximo() {
    if (passo < TOTAL_PASSOS) setPasso(passo + 1)
    else finalizar()
  }

  function voltar() {
    if (passo > 1) setPasso(passo - 1)
  }

  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState(false)

  async function finalizar() {
    // Proteção 1: campo-isca preenchido = provavelmente um robô
    if (isca) {
      navigate('/obrigado')
      return
    }
    // Proteção 2: respondeu tudo rápido demais para ser humano
    if (Date.now() - horaInicio < 2500) {
      setErroEnvio(true)
      return
    }
    // Proteção 3: limite de 1 envio a cada 3 minutos por aparelho
    const ultimoEnvio = Number(localStorage.getItem('zimbo_ultimo_envio') || 0)
    if (Date.now() - ultimoEnvio < 3 * 60 * 1000) {
      setErroEnvio(true)
      return
    }

    setEnviando(true)
    setErroEnvio(false)
    try {
      await salvarResposta(dados)
      localStorage.setItem('zimbo_ultimo_envio', String(Date.now()))
      navigate('/obrigado')
    } catch (err) {
      console.error(err)
      setErroEnvio(true)
    } finally {
      setEnviando(false)
    }
  }

  const podeAvancar = () => {
    if (passo === 1) return !!dados.loja
    if (passo === 2) return dados.geral > 0
    if (passo === 3) return categorias.every((c) => dados[c.chave] > 0)
    if (passo === 4) return !!dados.nps
    if (passo === 6) return whatsappValido(dados.contato)
    return true
  }

  return (
    <div className="page page--survey">
      <div className="survey-shell">
        {/* Campo-isca: invisível para pessoas, mas robôs de spam costumam preencher.
            Se vier preenchido, a resposta é descartada silenciosamente. */}
        <input
          type="text"
          name="website"
          value={isca}
          onChange={(e) => setIsca(e.target.value)}
          className="survey-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <CartTrail step={passo} total={TOTAL_PASSOS} />

        {passo === 1 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">Qual loja você visitou?</legend>
            <div className="loja-picker">
              {['Bela Vista', 'Vila Operária'].map((loja) => (
                <button
                  type="button"
                  key={loja}
                  className={`loja-picker__opt ${dados.loja === loja ? 'is-active' : ''}`}
                  onClick={() => atualizar('loja', loja)}
                >
                  <span className="loja-picker__icon">🏪</span>
                  {loja}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {passo === 2 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">De um jeito geral, como foi sua experiência?</legend>
            <div className="survey-step__stars">
              <StarRating value={dados.geral} onChange={(v) => atualizar('geral', v)} size={52} />
            </div>
            <p className="survey-step__hint">
              {dados.geral === 0 && 'Toque nas estrelas para avaliar'}
              {dados.geral === 5 && 'Show! Fico feliz em saber 🎉'}
              {dados.geral > 0 && dados.geral < 3 && 'Poxa, sentimos muito. Conte mais no final.'}
            </p>
          </fieldset>
        )}

        {passo === 3 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">Agora, avalie cada ponto da loja</legend>
            <div className="survey-categorias">
              {categorias.map((cat) => (
                <div className="survey-categorias__item" key={cat.chave}>
                  <span>{cat.rotulo}</span>
                  <StarRating value={dados[cat.chave]} onChange={(v) => atualizar(cat.chave, v)} size={28} />
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {passo === 4 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">Você recomendaria o Zimbo para um amigo?</legend>
            <div className="nps-picker">
              {[
                { v: 'sim', r: 'Sim', e: '😄' },
                { v: 'talvez', r: 'Talvez', e: '😐' },
                { v: 'nao', r: 'Não', e: '😕' },
              ].map((op) => (
                <button
                  type="button"
                  key={op.v}
                  className={`nps-picker__opt ${dados.nps === op.v ? 'is-active' : ''}`}
                  onClick={() => atualizar('nps', op.v)}
                >
                  <span aria-hidden="true">{op.e}</span>
                  {op.r}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {passo === 5 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">Lembra qual caixa ou quem te atendeu?</legend>
            <p className="survey-step__hint">Opcional — só ajuda a gente a reconhecer quem está indo bem.</p>
            <div className="survey-contato">
              <input
                type="text"
                placeholder="Número do caixa (ex: Caixa 3)"
                value={dados.caixa}
                onChange={(e) => atualizar('caixa', e.target.value)}
              />
              <input
                type="text"
                placeholder="Nome do operador (se souber)"
                value={dados.operador}
                onChange={(e) => atualizar('operador', e.target.value)}
              />
            </div>
          </fieldset>
        )}

        {passo === 6 && (
          <fieldset className="survey-step">
            <legend className="survey-step__title">Quer deixar um comentário?</legend>
            <textarea
              className="survey-textarea"
              placeholder="Elogio, sugestão ou reclamação (opcional)"
              rows={4}
              value={dados.comentario}
              onChange={(e) => atualizar('comentario', e.target.value)}
            />
            <div className="survey-contato">
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                value={dados.nome}
                onChange={(e) => atualizar('nome', e.target.value)}
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="WhatsApp (opcional) — (99) 99999-9999"
                value={dados.contato}
                onChange={(e) => atualizar('contato', formatarWhatsapp(e.target.value))}
              />
            </div>
            {!whatsappValido(dados.contato) ? (
              <p className="survey-erro">Número incompleto — confira o DDD e os dígitos, ou deixe em branco.</p>
            ) : (
              <p className="survey-step__hint">Preencha só se quiser que a gente entre em contato.</p>
            )}
          </fieldset>
        )}

        {erroEnvio && (
          <p className="survey-erro">Não deu pra enviar agora. Se você já respondeu recentemente, aguarde alguns minutos e tente de novo.</p>
        )}

        <div className="survey-nav">
          <button type="button" className="btn btn--ghost" onClick={voltar} disabled={passo === 1 || enviando}>
            Voltar
          </button>
          <button type="button" className="btn btn--primary" onClick={proximo} disabled={!podeAvancar() || enviando}>
            {enviando ? 'Enviando...' : passo === TOTAL_PASSOS ? 'Enviar avaliação' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
