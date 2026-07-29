export default function StarRating({ value, onChange, size = 40 }) {
  return (
    <div className="star-rating" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} de 5 estrelas`}
          className={`star-rating__btn ${n <= value ? 'is-filled' : ''}`}
          onClick={() => onChange(n)}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 24 24" width="100%" height="100%">
            <path d="M12 2.5l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.6 5.9 20.7l1.5-6.7-5.1-4.6 6.8-.7z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
