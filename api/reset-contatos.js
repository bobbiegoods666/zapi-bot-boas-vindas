const { redis, SEEN_PREFIX } = require('./_redis');
const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'metodo nao permitido' });
  }

  const keys = await redis.keys(`${SEEN_PREFIX}*`);
  if (keys.length) {
    await redis.del(...keys);
  }

  return res.status(200).json({ ok: true, removidos: keys.length });
};
