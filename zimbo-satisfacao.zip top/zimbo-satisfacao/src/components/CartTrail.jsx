export default function CartTrail({ step, total }) {
  const pct = ((step - 1) / (total - 1)) * 100
  return (
    <div className="cart-trail" aria-label={`Etapa ${step} de ${total}`}>
      <div className="cart-trail__rail">
        <div className="cart-trail__fill" style={{ width: `${pct}%` }} />
        <div className="cart-trail__cart" style={{ left: `${pct}%` }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
            <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="20" r="1.4" fill="currentColor"/>
            <circle cx="17" cy="20" r="1.4" fill="currentColor"/>
          </svg>
        </div>
      </div>
      <div className="cart-trail__stops">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`cart-trail__stop ${i < step ? 'is-done' : ''}`} />
        ))}
      </div>
      <p className="cart-trail__label">Passo {step} de {total}</p>
    </div>
  )
}
