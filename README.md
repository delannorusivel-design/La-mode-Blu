# Loja Lb — site + pagamento online

Site pronto pra vender roupas com Pix, cartão de crédito e parcelamento.
A vitrine é um site estático (HTML/CSS/JS) e o pagamento é processado pelo
**Mercado Pago** — é a opção mais simples e mais usada no Brasil, porque numa
única tela de checkout hospedada por eles já vem Pix, cartão (com parcelamento)
e boleto, sem você precisar lidar com dados de cartão no seu próprio site
(o que exigiria certificação de segurança PCI).

## O que tem em cada arquivo

- `index.html` — a página da loja (vitrine, busca, sacola)
- `products.js` — **é aqui que você cadastra as peças.** Edite este arquivo
  sempre que quiser adicionar, remover ou mudar preço/estoque de um produto.
- `style.css` — visual da loja (cores, fontes)
- `store.js` — lógica da sacola de compras e da vitrine
- `images/` — coloque as fotos das peças aqui, com o mesmo nome usado em
  `products.js`
- `api/create-preference.js` — a função que fala com o Mercado Pago e gera o
  link de pagamento (roda no servidor da Vercel, não no navegador)
- `sucesso.html`, `pendente.html`, `falha.html` — páginas que o cliente vê
  depois de pagar

## Passo a passo pra publicar

### 1. Criar conta no Mercado Pago
Crie uma conta de vendedor em mercadopago.com.br (se ainda não tiver) e pegue
o **Access Token de produção** em: Seu painel → Configurações → Credenciais.
Guarde esse token, ele é secreto — nunca cole ele dentro do código.

### 2. Subir o projeto pro GitHub
Crie um repositório novo e suba esta pasta inteira.

### 3. Criar o projeto na Vercel
- Entre em vercel.com, conecte sua conta do GitHub e importe o repositório.
- Em **Settings → Environment Variables**, adicione:
  - `MERCADOPAGO_ACCESS_TOKEN` = seu token de produção
  - `SITE_URL` = a URL final do site (ex: `https://sualoja.com.br`) — pode
    colocar a URL temporária da Vercel primeiro e trocar depois quando o
    domínio próprio estiver ativo
- Clique em Deploy.

### 4. Ligar seu domínio próprio
Depois de comprar o domínio, vá em **Settings → Domains** no projeto da
Vercel e siga as instruções pra apontar o domínio (é só configurar os
registros DNS que eles mostram lá — leva de alguns minutos a algumas horas
pra propagar).

### 5. Testar antes de vender de verdade
O Mercado Pago tem um modo de teste (sandbox) com cartões fictícios — vale a
pena simular uma compra completa antes de divulgar o site, pra confirmar que
o pagamento aprova e o cliente cai na página de sucesso certa.

## Como atualizar as peças no dia a dia

Abra `products.js`, copie um bloco de produto e ajuste nome, preço, tamanhos
e foto. Depois de salvar, é só subir a alteração pro GitHub — a Vercel
publica automaticamente a versão nova em poucos segundos.

## Sobre parcelamento

O número de parcelas (hoje configurado até 12x) é definido em
`api/create-preference.js`, na linha `installments: 12`. O Mercado Pago
decide, na hora da compra, se vai cobrar juros nas parcelas — isso depende
das taxas configuradas na sua conta MP, não do código do site.

## O que ainda vale considerar

- **Frete**: este site ainda não calcula frete automaticamente. Pra começar,
  uma opção simples é combinar o frete por WhatsApp depois da compra, ou
  cadastrar um valor fixo de frete como mais um "item" no carrinho.
- **Controle de estoque**: hoje o site não desconta automaticamente do seu
  painel de estoque quando alguém compra. Se quiser, dá pra conectar os dois
  depois (o site avisando o painel a cada venda).
- **E-mail de confirmação automático**: hoje quem confirma a venda pro
  cliente é você, olhando o painel do Mercado Pago. Dá pra automatizar isso
  depois também.

## Assistente de vendas com IA

O site tem uma consultora virtual (botão flutuante no canto inferior direito)
que responde com IA de verdade — indica peças pelo tom/cor pedido, tira
dúvidas de tamanho, tecido, entrega e pagamento, sem sugerir peça fora da
proposta da cliente.

Para ativar:
1. Crie uma conta em https://console.anthropic.com e gere uma API key
   (menu API Keys). Essa conta é separada do aplicativo Claude.
2. Na Vercel, em Settings → Environment Variables, adicione:
   - `ANTHROPIC_API_KEY` = sua chave
3. Pronto — o widget do site chama `api/assistant.js`, que conversa com a IA.

O "cérebro" do assistente (personalidade, regras de atendimento e catálogo)
fica no arquivo `api/assistant.js`, na constante SYSTEM_PROMPT. Quando você
adicionar ou mudar peças no site, atualize também o CATALOGO nesse arquivo
para o assistente indicar as peças certas.

Custo: cada resposta consome créditos da API (modelo Haiku, o mais barato).
Uma conversa típica custa centavos. Dá pra acompanhar o consumo no painel
da console.anthropic.com.

Observação: o assistente precisa da Vercel (ou hospedagem equivalente) porque
a função roda no servidor — no GitHub Pages ele não funciona (o site cai no
modo de respostas básicas de fallback).
