import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Se as variáveis de ambiente não estiverem configuradas, o site continua
// funcionando com localStorage (modo de demonstração), sem quebrar.
export const supabaseAtivo = Boolean(url && key)

export const supabase = supabaseAtivo ? createClient(url, key) : null
