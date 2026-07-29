# Zimbo Supermercado · Site de Avaliação de Satisfação

Site em React + Vite para coletar avaliações de satisfação dos clientes do
**Zimbo Supermercado** (Nova Serrana, MG) e acompanhar os resultados em um
painel administrativo.

## O que tem no site

- **Página inicial** — apresentação e chamada para avaliar a compra
- **Pesquisa em etapas** (`/avaliar`) — loja visitada, nota geral, notas por
  categoria (atendimento, limpeza, variedade, preço, agilidade no caixa),
  pergunta estilo NPS ("recomendaria a um amigo?") e comentário opcional
- **Página de agradecimento** (`/obrigado`)
- **Painel administrativo** (`/admin`) com nota média, NPS, gráfico por
  categoria, gráfico de evolução da nota ao longo do tempo, lista de
  avaliações e destaque automático para notas baixas
- **Exportar CSV** — baixe todas as avaliações (ou só de uma loja) para
  abrir no Excel/Google Sheets
- **QR Code** (`/admin/qrcode`, dentro do painel) pronto para baixar ou
  imprimir e colar perto do caixa
- **Alerta automático de nota baixa** — dispara um webhook (opcional) toda
  vez que chega uma avaliação de 1 ou 2 estrelas
- **Proteção contra spam** — campo-isca invisível, tempo mínimo de
  preenchimento e limite de 1 envio a cada 3 minutos por aparelho
- **Login de verdade por pessoa** (quando o Supabase está configurado) —
  cada gerente entra com seu próprio e-mail e senha

## Dois modos de funcionamento

### 1. Modo demonstração (padrão, sem configurar nada)
As respostas ficam salvas só no `localStorage` do navegador de quem
respondeu. Ótimo para testar e mostrar o site, mas **cada pessoa só vê as
respostas do próprio aparelho** — não serve para uso real com clientes.

### 2. Modo produção (recomendado, com Supabase conectado)
Todas as respostas ficam num banco de dados real, e a equipe vê tudo, de
qualquer aparelho, em tempo real. Veja como ativar abaixo.

## Como ativar o banco de dados real (Supabase)

1. Crie uma conta gratuita em **https://supabase.com** e um novo projeto
2. No painel do Supabase, vá em **SQL Editor → New query**, cole o conteúdo
   do arquivo `supabase/schema.sql` deste projeto e clique em **RUN**
   (isso cria a tabela `respostas` com as permissões corretas)
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**
4. Copie o arquivo `.env.example` para `.env` e preencha:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxx
   ```
5. Rode `npm run dev` novamente — o painel vai mostrar
   "● Conectado ao banco de dados" no lugar de "Modo demonstração"

Quando publicar o site (Vercel/Netlify), configure essas mesmas variáveis
de ambiente lá nas configurações do projeto — **nunca** coloque a chave
direto no código.

## Como ativar o alerta automático de nota baixa

O site já dispara automaticamente uma chamada (webhook) toda vez que chega
uma avaliação com nota geral 1 ou 2, com os dados da avaliação. Para
transformar isso em um e-mail ou mensagem de WhatsApp para a equipe, sem
precisar programar:

1. Crie uma conta gratuita em **Zapier**, **Make** ou **n8n**
2. Crie um "Zap"/cenário que comece com um gatilho do tipo **Webhook**
3. Copie a URL gerada por eles
4. Cole no `.env`:
   ```
   VITE_ALERT_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxx/xxxx
   ```
5. Configure a ação seguinte no Zapier/Make para enviar um e-mail ou
   mensagem de WhatsApp com os dados recebidos (`texto`, `loja`, `nota`,
   `comentario`, `nome`, `contato`)

Deixe essa variável vazia se não quiser usar esse recurso agora — o site
funciona normalmente sem ela.

## Como criar logins individuais para a equipe (Supabase Auth)

Sem Supabase configurado, o acesso ao painel usa uma senha única
(`VITE_ADMIN_PASSWORD`, padrão `zimbo2026`) — simples, mas não ideal para
uso real, já que todo mundo compartilha a mesma senha.

Com o Supabase configurado (veja seção acima), o login passa a pedir
e-mail e senha de verdade. Para criar o acesso de cada gerente:

1. No painel do Supabase, vá em **Authentication → Users → Add user**
2. Preencha e-mail e senha da pessoa e clique em criar
3. Repita para cada gerente/loja que precisar acessar o painel

Assim cada pessoa tem seu próprio login, e dá pra revogar o acesso de
alguém a qualquer momento sem afetar os demais.

## Como usar o QR Code

Depois de logar no painel (`/admin`), clique em **QR Code**. Lá dá para
baixar a imagem em PNG ou imprimir direto, já apontando para o link
`/avaliar` do seu site publicado. Cole perto do caixa ou no cupom fiscal.

## Como adicionar o logotipo oficial

Coloque o arquivo do logo em `public/logo.png`. O site carrega ele
automaticamente no topo da página inicial (se o arquivo não existir, mostra
um texto no lugar, sem quebrar nada). Depois é só apagar o arquivo
`public/LOGO_AQUI.txt`.

Para ajustar as cores exatas do logo, edite as variáveis no topo do
arquivo `src/index.css` (`--vermelho`, `--laranja`, `--verde`, `--bg`).

## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Como gerar a versão de produção

```bash
npm run build
npm run preview
```

Os arquivos finais ficam na pasta `dist/`, prontos para publicar em
qualquer serviço de hospedagem estática (Vercel, Netlify, Cloudflare Pages,
GitHub Pages etc.). Lembre-se de configurar as variáveis de ambiente do
`.env` também na plataforma de hospedagem.

## Outras personalizações

- **Senha do painel**: variável `VITE_ADMIN_PASSWORD` no `.env` (padrão:
  `zimbo2026`). Hoje é uma senha única para toda a equipe — para um login
  individual e mais seguro por pessoa, o próximo passo é usar o
  **Supabase Auth**.
- **Textos e lojas**: `src/pages/Home.jsx` e `src/pages/Survey.jsx`
- **Categorias avaliadas**: array `categorias` em `src/pages/Survey.jsx` e
  `src/pages/AdminDashboard.jsx`

## Estrutura de pastas

```
src/
  components/    → CartTrail (barra de progresso) e StarRating (estrelas)
  data/          → storage.js (Supabase ou localStorage) e supabaseClient.js
  pages/         → Home, Survey, ThankYou, AdminLogin, AdminDashboard, AdminQrCode
  App.jsx        → rotas
  index.css      → design system (cores, tipografia, componentes)
supabase/
  schema.sql     → script para criar a tabela no Supabase
public/
  logo.png       → coloque aqui o logotipo oficial (veja instruções acima)
```

## Próximos passos sugeridos (por ordem de prioridade)

1. ✅ Banco de dados real (Supabase) — pronto, falta só configurar
2. ✅ QR Code — pronto
3. ✅ Alerta de nota baixa — pronto, falta só conectar o webhook
4. ✅ Exportar CSV — pronto
5. ✅ Gráfico de evolução no tempo — pronto
6. ✅ Proteção básica contra spam — pronto
7. ✅ Login individual por pessoa (Supabase Auth) — pronto, falta só criar os usuários
8. ⏳ Logotipo e cores exatas da marca — falta o arquivo do logo
9. Login separado por loja (cada gerente vê só a loja dele)
10. Pergunta sobre qual caixa/operador atendeu
11. Domínio próprio publicado
