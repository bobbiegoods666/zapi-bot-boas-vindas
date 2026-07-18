const { redis, CONFIG_KEY, PASSWORD_KEY, defaultConfig } = require('./_redis');
const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }

  if (req.method === 'GET') {
    const config = await redis.get(CONFIG_KEY);
    return res.status(200).json(config || defaultConfig());
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const config = {
      zapiInstance: String(body.zapiInstance || ''),
      zapiToken: String(body.zapiToken || ''),
      zapiClientToken: String(body.zapiClientToken || ''),
      texto1: String(body.texto1 || ''),
      texto2: String(body.texto2 || ''),
      videoUrl: String(body.videoUrl || ''),
      audioUrl: String(body.audioUrl || ''),
      delayInicial: Number(body.delayInicial) || 0,
      delayEntreMensagens: Number(body.delayEntreMensagens) || 0,
    };
    await redis.set(CONFIG_KEY, config);

    // troca de senha do painel (opcional, so aplica se o campo vier preenchido)
    if (body.novaSenha && String(body.novaSenha).length >= 4) {
      await redis.set(PASSWORD_KEY, String(body.novaSenha));
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'metodo nao permitido' });
};
