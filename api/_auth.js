const { redis, PASSWORD_KEY } = require('./_redis');

async function checkAuth(req) {
  const senhaEnviada = req.headers['x-panel-password'];
  if (!senhaEnviada) return false;
  const senhaSalva = await redis.get(PASSWORD_KEY);
  if (!senhaSalva) return false;
  return senhaEnviada === senhaSalva;
}

module.exports = { checkAuth };
