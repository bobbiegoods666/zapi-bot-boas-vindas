const { redis, CONFIG_KEY, PASSWORD_KEY, defaultConfig } = require('./_redis');
const { checkAuth } = require('./_auth');

const CAMPOS_TEXTO = ['zapiInstance', 'zapiToken', 'zapiClientToken', 'texto1', 'texto2', 'videoUrl', 'audioUrl'];
const CAMPOS_NUMERO = ['delayInicial', 'delayEntreMensagens'];

module.exports = async (req, res) => {
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }

  if (req.method === 'GET') {
    const config = await redis.get(CONFIG_KEY);
    return res.status(200).json(config || defaultConfig());
  }

  if (req.method === 'POST') {
    const atual = (await redis.get(CONFIG_KEY)) || defaultConfig();
    const body = req.body || {};
    const novo = { ...atual };

    // so atualiza os campos que vieram no corpo da requisicao -- assim cada
    // botao de "salvar" de cada secao do painel nao apaga as outras secoes
    for (const campo of CAMPOS_TEXTO) {
      if (Object.prototype.hasOwnProperty.call(body, campo)) {
        novo[campo] = String(body[campo] ?? '');
      }
    }
    for (const campo of CAMPOS_NUMERO) {
      if (Object.prototype.hasOwnProperty.call(body, campo)) {
        novo[campo] = Number(body[campo]) || 0;
      }
    }

    await redis.set(CONFIG_KEY, novo);

    if (body.novaSenha && String(body.novaSenha).length >= 4) {
      await redis.set(PASSWORD_KEY, String(body.novaSenha));
    }

    return res.status(200).json({ ok: true, config: novo });
  }

  return res.status(405).json({ error: 'metodo nao permitido' });
};
