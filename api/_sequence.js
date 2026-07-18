function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function zapiSend(config, endpoint, payload) {
  const url = `https://api.z-api.io/instances/${config.zapiInstance}/token/${config.zapiToken}/${endpoint}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': config.zapiClientToken,
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error(`Z-API ${endpoint} falhou:`, resp.status, errText);
    return { ok: false, status: resp.status, body: errText };
  }
  return { ok: true };
}

// Dispara a sequência completa: texto1 -> texto2 -> video -> audio, respeitando os delays.
// Retorna um log passo a passo, útil tanto pro teste manual quanto pra depurar o webhook real.
async function runSequence(config, phone) {
  const log = [];
  const delayInicial = Math.max(0, Number(config.delayInicial) || 0) * 1000;
  const delayEntre = Math.max(0, Number(config.delayEntreMensagens) || 0) * 1000;

  if (delayInicial) await sleep(delayInicial);

  if (config.texto1) {
    const r = await zapiSend(config, 'send-text', { phone, message: config.texto1 });
    log.push({ etapa: 'texto1', ...r });
    if (delayEntre) await sleep(delayEntre);
  }

  if (config.texto2) {
    const r = await zapiSend(config, 'send-text', { phone, message: config.texto2 });
    log.push({ etapa: 'texto2', ...r });
    if (delayEntre) await sleep(delayEntre);
  }

  if (config.videoUrl) {
    const r = await zapiSend(config, 'send-video', { phone, video: config.videoUrl });
    log.push({ etapa: 'video', ...r });
    if (delayEntre) await sleep(delayEntre);
  }

  if (config.audioUrl) {
    const r = await zapiSend(config, 'send-audio', { phone, audio: config.audioUrl });
    log.push({ etapa: 'audio', ...r });
  }

  return log;
}

module.exports = { runSequence };
