const { redis, PASSWORD_KEY } = require('./_redis');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const senhaSalva = await redis.get(PASSWORD_KEY);
    return res.status(200).json({ needsSetup: !senhaSalva });
  }

  if (req.method === 'POST') {
    const senhaSalva = await redis.get(PASSWORD_KEY);
    if (senhaSalva) {
      return res.status(403).json({ error: 'o painel ja tem uma senha configurada' });
    }
    const novaSenha = (req.body || {}).senha;
    if (!novaSenha || String(novaSenha).length < 4) {
      return res.status(400).json({ error: 'escolha uma senha com pelo menos 4 caracteres' });
    }
    await redis.set(PASSWORD_KEY, String(novaSenha));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'metodo nao permitido' });
};
