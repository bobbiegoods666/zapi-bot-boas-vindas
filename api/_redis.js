const { Redis } = require('@upstash/redis');

// Aceita tanto o nome "classico" (UPSTASH_REDIS_REST_URL) quanto o nome que a Vercel
// usa quando voce conecta um banco Upstash pelo Storage Marketplace (KV_REST_API_URL).
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = new Redis({ url, token });

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
