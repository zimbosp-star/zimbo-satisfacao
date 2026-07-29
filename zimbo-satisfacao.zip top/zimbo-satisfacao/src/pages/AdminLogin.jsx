import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../data/auth.js'
import { supabaseAtivo } from '../data/supabaseClient.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setEntrando(true)
    setErro(false)
    const ok = await loginAdmin({ email, senha })
    setEntrando(false)
    if (ok) {
      navigate('/admin/painel')
    } else {
      setErro(true)
    }
  }

  return (
    <div className="page page--admin-login">
      <form className="admin-login-card" onSubmit={entrar}>
        <h1>Painel Zimbo</h1>
        <p>Área restrita à equipe do supermercado.</p>

        {supabaseAtivo && (
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErro(false) }}
            autoFocus
            required
          />
        )}
        <input
          type="password"
          placeholder="Senha de acesso"
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(false) }}
          autoFocus={!supabaseAtivo}
        />
        {erro && <p className="admin-login-card__erro">Não foi possível entrar. Confira os dados e tente de novo.</p>}
        <button type="submit" className="btn btn--primary" disabled={entrando}>
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>

        {supabaseAtivo ? (
          <p className="admin-login-card__dica">
            Peça ao responsável pelo Supabase para criar seu login em
            Authentication → Users.
          </p>
        ) : (
          <p className="admin-login-card__dica">Senha de demonstração: <strong>zimbo2026</strong></p>
        )}
      </form>
    </div>
  )
}
