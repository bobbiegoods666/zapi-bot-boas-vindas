const { redis, CONFIG_KEY, defaultConfig } = require('./_redis');
const { runSequence } = require('./_sequence');

const SEEN_TTL_SECONDS = 60 * 60 * 24 * 30; // considera "novo lead" de novo depois de 30 dias

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'metodo nao permitido' });
  }

  const body = req.body || {};

  // ignora mensagens de grupo e mensagens enviadas pelo proprio numero
  if (body.isGroup || body.fromMe) {
    return res.status(200).json({ ignored: 'grupo-ou-fromMe' });
  }

  const phone = body.phone;
  if (!phone) {
    return res.status(200).json({ ignored: 'sem-telefone' });
  }

  const seenKey = `seen:${phone}`;
  const jaAtendido = await redis.get(seenKey);
  if (jaAtendido) {
    return res.status(200).json({ ignored: 'ja-atendido' });
  }

  // marca como atendido ANTES de enviar, pra evitar disparo duplicado
  // se o Z-API reenviar o mesmo evento por instabilidade de rede
  await redis.set(seenKey, true, { ex: SEEN_TTL_SECONDS });

  const config = (await redis.get(CONFIG_KEY)) || defaultConfig();
  if (!config.zapiInstance || !config.zapiToken || !config.zapiClientToken) {
    return res.status(200).json({ error: 'painel ainda nao configurado' });
  }

  const log = await runSequence(config, phone);

  return res.status(200).json({ ok: true, phone, log });
};
