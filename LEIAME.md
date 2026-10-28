# Urna Eletrônica – Primaz da IEAB

## Publicar no GitHub Pages
1. Crie um repositório e envie todos estes arquivos.
2. Settings → Pages → Branch `main` / pasta `/ (root)`.
3. Site: `https://SEU-USUARIO.github.io/SEU-REPO/` · Admin: `.../admin.html`

## Fotos
Coloque as fotos dos candidatos em `fotos/` com os nomes `11.jpg` ... `19.jpg` (ou troque pelo painel admin, colando um link ou enviando o arquivo). Sem foto, aparecem as iniciais.

## Onde os votos ficam salvos
- **Modo local** (`BACKEND_URL` vazio): só no navegador de quem votou. Serve para testar.
- **Modo Google Planilhas (necessário para valer):**
  1. Crie uma Planilha Google → Extensões → Apps Script.
  2. Cole o conteúdo de `apps-script.gs` e troque `SENHA_ADMIN`.
  3. Implantar → Nova implantação → Tipo "App da Web" → Executar como: **Eu** → Quem tem acesso: **Qualquer pessoa**.
  4. Copie a URL gerada (termina em `/exec`) e cole em `BACKEND_URL` no `config.js`.
  5. Pronto: cada voto vira uma linha na planilha, e o admin.html mostra a apuração em tempo real.

## Painel admin (admin.html)
Apuração (geral e por diocese), exportar CSV, zerar votação, editar candidatos (número, nome, cargo, foto), dioceses (número, nome) e título.
