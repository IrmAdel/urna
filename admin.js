const $ = id => document.getElementById(id);
let pw = "", cfg, votes = [], tab = "apuracao";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
$("modo").textContent = Store.remote ? "Modo: Google Planilhas (votos centralizados)" : "Modo: LOCAL (votos só neste navegador – apenas teste)";
$("entrar").onclick = async () => {
  pw = $("pw").value;
  try { await Store.login(pw); cfg = await Store.getConfig(); votes = await Store.results(pw); $("login").classList.add("hidden"); $("painel").classList.remove("hidden"); show(); }
  catch (e) { $("err").textContent = e.message; }
};
$("pw").addEventListener("keydown", e => { if (e.key === "Enter") $("entrar").click(); });
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => { tab = b.dataset.t; document.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("on", x === b)); show(); });
const show = () => ({ apuracao, cand, dio, cfg: outros })[tab]();

function apuracao() {
  const tot = votes.length, cnt = {}; votes.forEach(v => cnt[v.voto] = (cnt[v.voto] || 0) + 1);
  const linhas = cfg.candidatos.map(c => ({ n: c.num, nome: c.nome, q: cnt[c.num] || 0 }));
  linhas.sort((a, b) => b.q - a.q);
  const pct = q => tot ? (q * 100 / tot).toFixed(1) : "0.0";
  let h = `<div class="row"><button class="btn sm" id="atual">Atualizar</button><button class="btn sm sec" id="csv">Exportar CSV</button><button class="btn sm red" id="reset">Zerar votação</button></div><p><b>Total de votos: ${tot}</b> · Brancos: ${cnt.BRANCO || 0} · Nulos: ${cnt.NULO || 0}</p>
  <table><tr><th>Nº</th><th>Candidato(a)</th><th>Votos</th><th>%</th><th style="width:30%"></th></tr>` +
    linhas.map(l => `<tr><td>${l.n}</td><td>${esc(l.nome)}</td><td>${l.q}</td><td>${pct(l.q)}%</td><td><div class="bar" style="width:${pct(l.q)}%"></div></td></tr>`).join("") + `</table>
  <h3>Por diocese</h3><table><tr><th>Diocese</th><th>Votos</th>${cfg.candidatos.map(c => `<th>${c.num}</th>`).join("")}<th>Br</th><th>Nu</th></tr>` +
    cfg.dioceses.map(d => { const vs = votes.filter(v => v.dioceseNum === d.num); return `<tr><td>${d.num} – ${esc(d.nome)}</td><td>${vs.length}</td>${cfg.candidatos.map(c => `<td>${vs.filter(v => v.voto === c.num).length}</td>`).join("")}<td>${vs.filter(v => v.voto === "BRANCO").length}</td><td>${vs.filter(v => v.voto === "NULO").length}</td></tr>`; }).join("") + `</table>
  <h3>Votos registrados</h3><table><tr><th>Hora</th><th>Nome</th><th>Diocese</th><th>Voto</th></tr>` +
    votes.slice().reverse().map(v => `<tr><td>${new Date(v.hora).toLocaleString("pt-BR")}</td><td>${esc(v.nome)}</td><td>${esc(v.dioceseNum)} – ${esc(v.dioceseNome)}</td><td>${esc(v.voto)} ${v.voto.length === 2 ? "– " + esc(v.candNome) : ""}</td></tr>`).join("") + `</table>`;
  $("conteudo").innerHTML = h;
  $("atual").onclick = async () => { votes = await Store.results(pw); apuracao(); };
  $("reset").onclick = async () => { if (confirm("Apagar TODOS os votos? Isso não pode ser desfeito.")) { await Store.reset(pw); votes = []; apuracao(); } };
  $("csv").onclick = () => {
    const rows = [["hora", "nome", "dioceseNum", "diocese", "voto", "candidato"], ...votes.map(v => [v.hora, v.nome, v.dioceseNum, v.dioceseNome, v.voto, v.candNome])];
    const csv = rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = "apuracao-ieab.csv"; a.click();
  };
}

function salvar() { return Store.saveConfig(cfg, pw).then(() => alert("Salvo!")).catch(e => alert(e.message)); }
function lerCampos(sel, arr, keys) { document.querySelectorAll(sel).forEach(tr => { const i = +tr.dataset.i; keys.forEach(k => arr[i][k] = tr.querySelector(`[data-k=${k}]`).value.trim()); }); }

function cand() {
  $("conteudo").innerHTML = `<p>Para fotos: coloque o arquivo na pasta <code>fotos/</code> do GitHub (ex.: <code>fotos/11.jpg</code>), cole um link de imagem, ou use “Enviar foto”.</p><table><tr><th>Foto</th><th>Nº</th><th>Nome</th><th>Cargo</th><th>Foto (caminho/link)</th><th></th></tr>` +
    cfg.candidatos.map((c, i) => `<tr class="rc" data-i="${i}"><td><img class="thumb" src="${esc(c.foto)}" onerror="this.style.visibility='hidden'"></td><td style="width:60px"><input data-k="num" value="${esc(c.num)}" maxlength="2"></td><td><input data-k="nome" value="${esc(c.nome)}"></td><td><input data-k="cargo" value="${esc(c.cargo)}"></td><td><input data-k="foto" value="${esc(c.foto.startsWith("data:") ? "(foto enviada)" : c.foto)}"><input type="file" accept="image/*" data-up="${i}" style="font-size:11px"></td><td><button class="btn sm red" data-del="${i}">✕</button></td></tr>`).join("") +
    `</table><div class="row"><button class="btn sm sec" id="add">+ Candidato</button><button class="btn sm" id="sv">Salvar</button></div>`;
  const ler = () => { document.querySelectorAll(".rc").forEach(tr => { const c = cfg.candidatos[+tr.dataset.i]; ["num", "nome", "cargo"].forEach(k => c[k] = tr.querySelector(`[data-k=${k}]`).value.trim()); const f = tr.querySelector("[data-k=foto]").value.trim(); if (f !== "(foto enviada)") c.foto = f; }); };
  $("add").onclick = () => { ler(); cfg.candidatos.push({ num: "", nome: "", cargo: "", foto: "" }); cand(); };
  $("sv").onclick = () => { ler(); if (cfg.candidatos.some(c => !/^\d{2}$/.test(c.num))) return alert("Todo número deve ter 2 dígitos."); salvar(); };
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { if (confirm("Remover candidato?")) { ler(); cfg.candidatos.splice(+b.dataset.del, 1); cand(); } });
  document.querySelectorAll("[data-up]").forEach(inp => inp.onchange = () => { const f = inp.files[0]; if (!f) return; ler(); const i = +inp.dataset.up, img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 150; cv.height = 190; const x = cv.getContext("2d"), r = Math.max(150 / img.width, 190 / img.height); x.drawImage(img, (150 - img.width * r) / 2, (190 - img.height * r) / 2, img.width * r, img.height * r); cfg.candidatos[i].foto = cv.toDataURL("image/jpeg", .7); cand(); }; img.src = URL.createObjectURL(f); });
}

function dio() {
  $("conteudo").innerHTML = `<table><tr><th>Nº</th><th>Diocese</th><th></th></tr>` + cfg.dioceses.map((d, i) => `<tr class="rd" data-i="${i}"><td style="width:70px"><input data-k="num" value="${esc(d.num)}" maxlength="2"></td><td><input data-k="nome" value="${esc(d.nome)}"></td><td><button class="btn sm red" data-del="${i}">✕</button></td></tr>`).join("") + `</table><div class="row"><button class="btn sm sec" id="add">+ Diocese</button><button class="btn sm" id="sv">Salvar</button></div>`;
  const ler = () => lerCampos(".rd", cfg.dioceses, ["num", "nome"]);
  $("add").onclick = () => { ler(); cfg.dioceses.push({ num: "", nome: "" }); dio(); };
  $("sv").onclick = () => { ler(); if (cfg.dioceses.some(d => !/^\d{2}$/.test(d.num))) return alert("Todo número deve ter 2 dígitos."); salvar(); };
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { ler(); cfg.dioceses.splice(+b.dataset.del, 1); dio(); });
}

function outros() {
  $("conteudo").innerHTML = `<label>Título da votação (cargo exibido na urna)</label><input id="tit" value="${esc(cfg.titulo)}"><div class="row"><button class="btn sm" id="sv">Salvar</button></div>`;
  $("sv").onclick = () => { cfg.titulo = $("tit").value.trim() || "Primaz da IEAB"; salvar(); };
}
