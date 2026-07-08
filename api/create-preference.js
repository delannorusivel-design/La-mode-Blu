// api/create-preference.js
// Função serverless (roda na Vercel). Cria a "preferência" de pagamento no
// Mercado Pago e devolve o link de checkout (Pix, cartão, parcelamento e
// boleto ficam disponíveis automaticamente nessa tela do Mercado Pago).
//
// Precisa da variável de ambiente MERCADOPAGO_ACCESS_TOKEN configurada no
// painel da Vercel (Settings > Environment Variables). NUNCA coloque esse
// token direto no código.

const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'Loja ainda não configurada para receber pagamentos. Configure MERCADOPAGO_ACCESS_TOKEN.' });
    return;
  }

  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Sacola vazia' });
      return;
    }

    const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((i) => ({
          title: String(i.title).slice(0, 250),
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          currency_id: 'BRL'
        })),
        payment_methods: {
          installments: 12,        // permite parcelar em até 12x no cartão
          default_installments: 1
        },
        back_urls: {
          success: `${siteUrl}/sucesso.html`,
          failure: `${siteUrl}/falha.html`,
          pending: `${siteUrl}/pendente.html`
        },
        auto_return: 'approved'
      }
    });

    res.status(200).json({ init_point: result.init_point });
  } catch (err) {
    console.error('Erro ao criar preferência Mercado Pago:', err);
    res.status(500).json({ error: 'Erro ao criar o pagamento. Tente novamente.' });
  }
};
