const { redis, CONFIG_KEY, defaultConfig } = require('./_redis');
const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }

  const config = (await redis.get(CONFIG_KEY)) || defaultConfig();
  if (!config.zapiInstance || !config.zapiToken) {
    return res.status(400).json({ error: 'preencha e salve o Instance ID e o Token do Z-API primeiro' });
  }

  try {
    const url = `https://api.z-api.io/instances/${config.zapiInstance}/token/${config.zapiToken}/status`;
    const r = await fetch(url, {
      headers: { 'Client-Token': config.zapiClientToken || '' },
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'nao foi possivel consultar o status do Z-API' });
  }
};
