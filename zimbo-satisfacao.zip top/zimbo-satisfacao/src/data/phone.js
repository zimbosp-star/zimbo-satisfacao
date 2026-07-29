// Formatação e validação de número de WhatsApp/telefone brasileiro.
// Aceita celular (11 dígitos, com o 9) e fixo (10 dígitos).

export function formatarWhatsapp(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  const ddd = digitos.slice(0, 2)
  const resto = digitos.slice(2)

  if (digitos.length === 0) return ''
  if (digitos.length <= 2) return `(${ddd}`

  if (resto.length <= 4) {
    return `(${ddd}) ${resto}`
  }
  if (digitos.length <= 10) {
    // fixo: (99) 9999-9999
    return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`
  }
  // celular: (99) 99999-9999
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
}

export function whatsappValido(valor) {
  const digitos = valor.replace(/\D/g, '')
  if (digitos.length === 0) return true // campo é opcional
  if (digitos.length !== 10 && digitos.length !== 11) return false
  const ddd = Number(digitos.slice(0, 2))
  return ddd >= 11 && ddd <= 99
}
