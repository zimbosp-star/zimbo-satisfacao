import { supabase, supabaseAtivo } from './supabaseClient.js'

const SESSION_KEY = 'zimbo_admin_session'
const SENHA_UNICA = import.meta.env.VITE_ADMIN_PASSWORD || 'zimbo2026'

// Quando o Supabase está configurado, usamos login de verdade por
// e-mail/senha (Supabase Auth) — cada gerente pode ter sua própria conta,
// criada em Supabase → Authentication → Users → Add user.
//
// Sem Supabase configurado, caímos numa senha única fixa (modo demo),
// só para não travar o uso do site antes de você configurar o banco.

export async function isAdminLogado() {
  if (supabaseAtivo) {
    const { data } = await supabase.auth.getSession()
    return Boolean(data?.session)
  }
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export async function loginAdmin({ email, senha }) {
  if (supabaseAtivo) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return !error
  }
  if (senha === SENHA_UNICA) {
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  }
  return false
}

export async function logoutAdmin() {
  if (supabaseAtivo) {
    await supabase.auth.signOut()
    return
  }
  sessionStorage.removeItem(SESSION_KEY)
}
