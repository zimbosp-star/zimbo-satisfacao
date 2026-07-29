import { Link } from 'react-router-dom'

export default function ThankYou() {
  return (
    <div className="page page--thanks">
      <div className="thanks-card">
        <div className="thanks-card__stamp">✓</div>
        <h1>Valeu demais!</h1>
        <p>Sua avaliação já chegou pra nossa equipe do Zimbo Supermercado.
        Isso ajuda a gente a cuidar melhor de cada detalhe da sua compra.</p>
        <div className="thanks-card__social">
          <a href="https://www.instagram.com/zimbosupermercados/" target="_blank" rel="noreferrer">
            Seguir no Instagram
          </a>
          <a href="https://www.facebook.com/zimbosupermercadosoficial/" target="_blank" rel="noreferrer">
            Seguir no Facebook
          </a>
        </div>
        <Link to="/" className="btn btn--ghost">Voltar ao início</Link>
      </div>
    </div>
  )
}
