const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CONFIG_KEY = 'bot:config';
const PASSWORD_KEY = 'bot:panelPassword';
const SEEN_PREFIX = 'seen:';

function defaultConfig() {
  return {
    zapiInstance: '',
    zapiToken: '',
    zapiClientToken: '',
    texto1: '',
    texto2: '',
    videoUrl: '',
    audioUrl: '',
    delayInicial: 2,
    delayEntreMensagens: 4,
  };
}

module.exports = { redis, CONFIG_KEY, PASSWORD_KEY, SEEN_PREFIX, defaultConfig };
