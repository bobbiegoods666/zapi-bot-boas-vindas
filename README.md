# Bot de boas-vindas — WhatsApp (Z-API)

Quando um lead do Meta Ads clica no anúncio e manda a mensagem pré-pronta no WhatsApp, este bot detecta que é a primeira mensagem dele e dispara automaticamente: **texto 1 → texto 2 → vídeo → áudio**, com delay configurável entre cada envio.

Tudo é configurado por um painel visual — inclusive a senha do painel e as credenciais do Z-API. A única coisa que precisa ser feita fora da interface é ligar o banco de dados gratuito (2 variáveis), porque sem isso o painel não teria onde guardar nada.

## Como fica organizado

- `public/index.html` — o painel (senha própria, criada no primeiro acesso)
- `public/media/` — pasta pra colocar seu vídeo/áudio
- `api/setup.js` — cria a senha do painel na primeira vez que você acessa
- `api/config.js` — lê/salva a configuração (credenciais Z-API, textos, mídia, delay, e troca de senha)
- `api/status.js` — verifica se o WhatsApp está conectado no Z-API
- `api/test.js` — dispara a sequência pra um número de teste, sem afetar o funcionamento real
- `api/reset-contatos.js` — limpa a lista de números já atendidos
- `api/webhook.js` — recebe o aviso do Z-API quando chega mensagem de um lead e dispara a sequência real
- `api/_sequence.js`, `api/_redis.js`, `api/_auth.js` — lógica interna compartilhada

## Passo 1 — Conta no Z-API

1. Crie conta em [z-api.io](https://z-api.io) (tem 2 dias de teste grátis, depois é pago).
2. Crie uma instância, escaneie o QR code com o WhatsApp que vai atender os leads (recomendo um número separado do seu principal).
3. Anote: **Instance ID**, **Token** e o **Client-Token** (fica em Segurança → Client-Token, dentro do painel da instância). Você vai colar isso dentro do PAINEL, não aqui.

## Passo 2 — Banco de dados grátis (Upstash) — única configuração fora do painel

1. Vá em [upstash.com](https://upstash.com) → crie uma conta grátis → **Create Database** (Redis).
2. Na aba **REST API** da database, copie a `UPSTASH_REDIS_REST_URL` e a `UPSTASH_REDIS_REST_TOKEN`.

(Alternativa: dentro da própria Vercel, em Storage → Marketplace Database Providers → Upstash, você cria e conecta direto, sem sair da Vercel.)

## Passo 2.5 — Vercel Blob (para os botões de upload de vídeo/áudio funcionarem)

1. No projeto na Vercel, vá na aba **Storage** → **Create Database** (ou Browse Marketplace) → escolha **Blob**.
2. Dê um nome (ex: `zapi-bot-media`) e crie.
3. Confirme que está conectado ao projeto (se pedir, clique em **Connect Project**).

Isso injeta automaticamente a variável `BLOB_READ_WRITE_TOKEN`, que é o que os botões "Enviar vídeo" e "Enviar áudio" do painel usam para subir o arquivo direto pro armazenamento, sem precisar mexer em URL manualmente.

## Passo 3 — Vídeo e áudio

Dentro do painel, nas seções **"3. Vídeo"** e **"4. Áudio"**, escolha o arquivo e clique em **"Enviar vídeo"** / **"Enviar áudio"**. O upload vai direto do seu navegador pro Vercel Blob (não passa pelo limite de tamanho da função), e a URL gerada já preenche o campo automaticamente — só falta clicar em **"Salvar vídeo"** / **"Salvar áudio"** pra confirmar.

Se preferir, também dá pra colar manualmente uma URL pública já existente (de outro lugar) no mesmo campo, sem precisar usar o botão de upload.

## Passo 4 — Subir no GitHub

```bash
cd zapi-bot
git init
git add .
git commit -m "Bot de boas-vindas WhatsApp"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/zapi-bot-boas-vindas.git
git push -u origin main
```

## Passo 5 — Publicar na Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → selecione o repositório.
2. Framework preset: **Other**. Não precisa build command.
3. Antes de clicar em Deploy, adicione as **Environment Variables**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy.

Você recebe uma URL tipo `zapi-bot-boas-vindas.vercel.app`.

## Passo 6 — Tudo o mais é dentro do painel

1. Acesse `https://SEU-PROJETO.vercel.app`.
2. **Primeiro acesso**: o painel vai te pedir pra criar uma senha (só acontece essa uma vez). Escolha uma senha forte e guarde bem.
3. Preencha: Instance ID, Token, Client-Token do Z-API, os 2 textos, a URL do vídeo, a URL do áudio, e os delays.
4. Clique em **"Verificar conexão do WhatsApp"** pra confirmar que a instância está conectada.
5. Salvar.
6. Copie a URL do webhook que aparece no topo do painel (`.../api/webhook`).

## Passo 7 — Conectar no Z-API

No painel do Z-API, dentro da sua instância → **Webhooks** → campo **"Ao receber"** (on-message-received) → cole a URL do webhook copiada no painel → salvar.

## Passo 8 — Testar

Use o card **"Testar a sequência"** dentro do painel: digite um número seu (ex: `5516999999999`) e clique em **Enviar teste agora**. Ele mostra um log de cada etapa (texto1, texto2, video, audio) dizendo se cada envio deu certo ou falhou. Pode repetir quantas vezes quiser sem afetar o funcionamento real.

Depois, rode uma campanha de teste no Meta Ads (clique-para-WhatsApp), clique no anúncio, envie a mensagem pré-pronta, e veja a sequência real disparar.

## Outras funções do painel

- **Um botão de salvar por seção** — credenciais Z-API, mensagens, vídeo, áudio, delays e senha são salvos separadamente, sem risco de uma seção sobrescrever a outra.
- **Status da conexão Z-API sempre visível** — aparece um selo (Conectado / Desconectado) ao lado do título da seção de credenciais, atualizado automaticamente ao entrar no painel e sempre que você clica em "Verificar conexão do WhatsApp".
- **Upload de vídeo e áudio direto do painel** — usa o Vercel Blob por trás; não precisa mais subir arquivo manualmente no GitHub.
- **Trocar senha do painel** — direto no card de configuração, sem precisar mexer em nada na Vercel.
- **Limpar lista de contatos atendidos** — cada número só recebe a sequência uma vez a cada 30 dias; use esse botão se quiser testar de novo com um número que já recebeu.

## Custos reais

- **Z-API**: pago após os 2 dias de teste (esse é o único custo recorrente real).
- **Vercel**: plano Hobby gratuito é suficiente.
- **Upstash**: plano gratuito é suficiente para o volume de uma campanha pequena/média.

## Cuidados

- A senha do painel é uma proteção simples (fica guardada no banco, sem criptografia extra) — não compartilhe a URL do painel publicamente nem reutilize uma senha importante.
- Como o Z-API não é a API oficial da Meta, existe risco de bloqueio do número em caso de muitas denúncias/spam. Prefira um número separado do seu principal e evite enviar para quem não iniciou a conversa.
- Se o Z-API reenviar o mesmo evento de mensagem (instabilidade de rede), o bot já ignora automaticamente — cada número só recebe a sequência uma vez a cada 30 dias.
