const { handleUpload } = require('@vercel/blob/client');
const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'metodo nao permitido' });
  }
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'senha invalida' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'video/mp4',
          'video/quicktime',
          'video/webm',
          'audio/mpeg',
          'audio/mp4',
          'audio/ogg',
          'audio/wav',
          'audio/webm',
        ],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: String(error && error.message ? error.message : error) });
  }
};
