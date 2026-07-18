const { redis, PASSWORD_KEY } = require('./_redis');

// ATENCAO: qualquer pessoa que acessar esta URL reseta a senha do painel para "admin123".
// Use uma unica vez para recuperar o acesso, depois DELETE este arquivo do projeto
// (e faca um novo commit + push) para fechar essa porta de novo.

module.exports = async (req, res) => {
  await redis.set(PASSWORD_KEY, 'admin123');
  return res.status(200).json({
    ok: true,
    message: 'Senha do painel resetada para: admin123. Agora apague este arquivo (api/reset-senha.js) do seu projeto e faca push de novo.',
  });
};
