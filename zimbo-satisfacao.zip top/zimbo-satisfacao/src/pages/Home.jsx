import { Link } from 'react-router-dom'
import { useState } from 'react'

const itens = [
  { rotulo: 'Hortifrúti', emoji: '🥬' },
  { rotulo: 'Açougue', emoji: '🥩' },
  { rotulo: 'Padaria', emoji: '🥖' },
  { rotulo: 'Laticínios', emoji: '🧀' },
  { rotulo: 'Bebidas', emoji: '🧃' },
  { rotulo: 'Limpeza', emoji: '🧽' },
]

export default function Home() {
  const [logoOk, setLogoOk] = useState(true)
  return (
    <div className="page page--home">
      <header className="home-hero">
        {logoOk ? (
          <img
            src="/logo.png"
            alt="Zimbo Supermercado"
            className="home-hero__logo"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <div className="home-hero__badge">Zimbo Supermercado</div>
        )}
        <h1 className="home-hero__title">
          Como foi sua <span>compra</span> hoje?
        </h1>
        <p className="home-hero__subtitle">
          Leva menos de 2 minutos. Sua nota ajuda a gente a manter a economia
          e o carinho de sempre, todos os dias, aqui em Nova Serrana.
        </p>
        <Link to="/avaliar" className="btn btn--primary btn--lg">
          Avaliar minha compra
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <p className="home-hero__note">Leva menos de 2 minutos · não precisa cadastro</p>
      </header>

      <section className="home-belt" aria-label="Setores do Zimbo">
        <div className="home-belt__track">
          {[...itens, ...itens].map((item, i) => (
            <div className="home-belt__item" key={i}>
              <span aria-hidden="true">{item.emoji}</span>
              {item.rotulo}
            </div>
          ))}
        </div>
      </section>

      <section className="home-info">
        <div className="home-info__card">
          <h2>Bela Vista</h2>
          <p>Rua Antônio Martins, 1171</p>
          <p className="home-info__hours">Seg–Sáb 07h–21h · Dom 07h–20h</p>
        </div>
        <div className="home-info__card">
          <h2>Vila Operária</h2>
          <p>Rua José Ferreira do Amaral, 190</p>
          <p className="home-info__hours">Seg–Sáb 07h–21h · Dom 07h–20h</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>Zimbo Supermercado · economia todos os dias</p>
        <Link to="/admin" className="home-footer__admin">Acesso da equipe</Link>
      </footer>
    </div>
  )
}
