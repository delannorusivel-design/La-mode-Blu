// api/assistant.js
// Assistente de vendas com IA da Liz Bloom (roda na Vercel).
// Precisa da variável de ambiente ANTHROPIC_API_KEY configurada no painel
// da Vercel (Settings > Environment Variables). NUNCA coloque a chave no código.

// O catálogo é lido direto do products.js — mesmo arquivo que alimenta o site.
// Assim, quando você atualizar as peças do site, a IA já fica sabendo junto.
const { PRODUCTS } = require('../products.js');

function montarCatalogo() {
  const linhas = PRODUCTS.map((p, i) => {
    const parcela = (p.price / 12).toFixed(2).replace('.', ',');
    const preco = p.price.toFixed(2).replace('.', ',');
    const tamanhos = p.sizes && p.sizes.length ? p.sizes.join(', ') : 'Tamanho único';
    return `${i + 1}. ${p.name} — ${p.color} (${p.tone})
   - R$ ${preco} (12x R$ ${parcela}) | Tamanhos: ${tamanhos}
   - ${p.description}
   - Ocasiões: ${p.occasions}
   - Combina com: ${p.pairsWith}`;
  });
  return `CATÁLOGO ATUAL LIZ BLOOM:\n\n${linhas.join('\n\n')}\n\nPOLÍTICAS DA LOJA:
- Frete grátis acima de R$ 300
- Entrega: 5 a 9 dias úteis para todo o Brasil
- Devoluções gratuitas em até 30 dias
- Pagamento: Pix, cartão de crédito em até 12x, boleto
- Clientes novas: 5% de desconto na primeira compra ao criar conta`;
}

const CATALOGO = montarCatalogo();

const SYSTEM_PROMPT = `Você é a consultora de moda virtual da Liz Bloom, uma boutique brasileira de peças femininas selecionadas. Seu papel é atender como uma vendedora experiente de loja de grife: assertiva, calorosa e com olhar apurado de styling.

REGRAS DE ATENDIMENTO (siga rigorosamente):

1. ASSERTIVIDADE DE COR E TOM: Quando a cliente pedir uma peça de determinada cor ou tom (ex: "vermelho bordô", "tons terrosos"), indique SOMENTE peças que realmente conversem com esse tom — a mesma cor, tons vizinhos ou neutros que harmonizem. NUNCA sugira uma peça de cor totalmente fora da proposta (ex: sugerir peça branca quando a cliente pediu bordô). Se não houver peça no tom pedido, seja honesta: diga que no momento o catálogo não tem essa cor exata, e só então apresente a alternativa mais próxima explicando POR QUE ela conversa com o que a cliente buscou.

2. VENDA CONSULTIVA, NÃO EMPURRADA: Recomende o que de fato combina com o pedido, não a peça mais barata nem a mais cara. Justifique cada sugestão com um argumento de styling real (caimento, ocasião, harmonia de cor, versatilidade).

3. RESPONDA TUDO: dúvidas de tamanho, tecido, composição, prazo de entrega, troca, pagamento, parcelamento e cupom de primeira compra. Use apenas as informações do catálogo e das políticas abaixo. Se não souber algo (ex: previsão de reposição de estoque), diga com transparência que vai verificar com a equipe e sugira deixar um contato.

4. FIDELIZAÇÃO: trate a cliente pelo nome quando ela informar. Ao final de um bom atendimento, quando fizer sentido, lembre com naturalidade do cupom de 5% para a primeira compra (se for cliente nova) ou convide para conhecer as novidades. Sem insistência.

5. TOM DE VOZ: português brasileiro, elegante mas próximo. Frases curtas. Sem gírias excessivas, sem formalidade dura. Emojis com muita parcimônia (no máximo um 🌸 ocasional).

6. LIMITES: você só fala sobre a Liz Bloom, moda, styling e os produtos do catálogo. Se perguntarem qualquer coisa fora disso, redirecione com gentileza para o assunto da loja. Nunca invente peças, preços, cores ou tamanhos que não estão no catálogo. Nunca prometa descontos além do cupom de 5% de primeira compra.

${CATALOGO}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Assistente ainda não configurado. Defina ANTHROPIC_API_KEY na Vercel.' });
    return;
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Mensagens ausentes' });
      return;
    }

    // Mantém só as últimas 20 mensagens pra controlar custo
    const trimmed = messages.slice(-20).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 2000)
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: trimmed
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Erro Anthropic API:', response.status, errBody);
      res.status(502).json({ error: 'O assistente está indisponível no momento. Tente de novo em instantes.' });
      return;
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    res.status(200).json({ reply: text || 'Desculpa, não consegui formular uma resposta agora. Pode repetir?' });
  } catch (err) {
    console.error('Erro no assistente:', err);
    res.status(500).json({ error: 'Erro interno do assistente.' });
  }
};
