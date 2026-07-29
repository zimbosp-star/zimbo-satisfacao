function escapar(valor) {
  const texto = String(valor ?? '')
  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

export function exportarCsv(respostas, nomeArquivo = 'zimbo-avaliacoes.csv') {
  const colunas = [
    'data', 'loja', 'geral', 'atendimento', 'limpeza', 'variedade',
    'preco', 'agilidade', 'recomendaria', 'caixa', 'operador', 'comentario', 'nome', 'contato',
  ]

  const linhas = respostas.map((r) => [
    new Date(r.criadoEm).toLocaleString('pt-BR'),
    r.loja,
    r.geral,
    r.atendimento,
    r.limpeza,
    r.variedade,
    r.preco,
    r.agilidade,
    r.nps,
    r.caixa,
    r.operador,
    r.comentario,
    r.nome,
    r.contato,
  ].map(escapar).join(';'))

  const conteudo = [colunas.join(';'), ...linhas].join('\n')
  // BOM no início para o Excel reconhecer acentuação corretamente
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}
