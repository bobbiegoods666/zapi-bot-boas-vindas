const { redis, CONFIG_KEY, defaultConfig } = require('./_redis');
const { checkAuth } = require('./_auth');
const { runSequence } = require('./_sequence');

module.exports = async (req, res) => {
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'metodo nao permitido' });
  }

  const phone = (req.body || {}).phone;
  if (!phone) {
    return res.status(400).json({ error: 'informe um telefone, ex: 5516999999999' });
  }

  const config = (await redis.get(CONFIG_KEY)) || defaultConfig();
  if (!config.zapiInstance || !config.zapiToken || !config.zapiClientToken) {
    return res.status(400).json({ error: 'configure e salve as credenciais do Z-API primeiro' });
  }

  // teste manual nao marca o numero como "atendido" -- pode repetir o teste quantas vezes quiser
  const log = await runSequence(config, phone);

  return res.status(200).json({ ok: true, phone, log });
};
