let cfg, nome = "", etapa = "diocese", digits = "", dioceseSel = null, branco = false, ocupado = false;
const $ = id => document.getElementById(id);
const initials = s => s.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("").toUpperCase();

// som
let ac; function beep(f = 880, d = .12) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(ac.destination); g.gain.value = .15; o.start(); o.stop(ac.currentTime + d); } catch {} }
function somFim() { beep(700, .25); setTimeout(() => beep(700, .25), 280); setTimeout(() => beep(700, .8), 560); }

// teclado
"123456789".split("").forEach(n => $("keys").insertAdjacentHTML("beforeend", `<button class="key" data-k="${n}">${n}</button>`));
$("keys").insertAdjacentHTML("beforeend", `<button class="key z" data-k="0">0</button>`);
document.querySelectorAll(".key").forEach(b => b.onclick = () => press(b.dataset.k));
document.addEventListener("keydown", e => {
  if ($("urna").classList.contains("hidden")) return;
  if (/^\d$/.test(e.key)) press(e.key); else if (e.key === "Enter") press("confirma"); else if (e.key === "Backspace" || e.key === "Escape") press("corrige");
});

$("iniciar").onclick = async () => {
  nome = $("nome").value.trim();
  if (nome.split(" ").length < 2) { $("err").textContent = "Digite seu nome e sobrenome."; return; }
  cfg = await Store.getConfig();
  $("ident").classList.add("hidden"); $("urna").classList.remove("hidden");
  etapa = "diocese"; digits = ""; branco = false; render();
};

function press(k) {
  if (ocupado || etapa === "fim") return;
  beep(900, .07);
  if (/^\d$/.test(k)) { if (!branco && digits.length < 2) digits += k; }
  else if (k === "corrige") { digits = ""; branco = false; }
  else if (k === "branco") { if (etapa === "candidato" && digits.length === 0) branco = true; }
  else if (k === "confirma") return confirmar();
  render();
}

async function confirmar() {
  if (etapa === "diocese") {
    const d = cfg.dioceses.find(x => x.num === digits);
    if (!d) return beep(300, .3);
    dioceseSel = d; etapa = "candidato"; digits = ""; branco = false; return render();
  }
  if (etapa === "candidato") {
    if (!branco && digits.length < 2) return beep(300, .3);
    const c = cfg.candidatos.find(x => x.num === digits);
    const voto = branco ? "BRANCO" : (c ? c.num : "NULO");
    ocupado = true;
    try {
      await Store.vote({ nome, dioceseNum: dioceseSel.num, dioceseNome: dioceseSel.nome, voto, candNome: c ? c.nome : voto, hora: new Date().toISOString() });
    } catch (e) { ocupado = false; return erroTela(e.message); }
    ocupado = false; etapa = "fim"; render(); somFim();
    setTimeout(() => { $("urna").classList.add("hidden"); $("ident").classList.remove("hidden"); $("nome").value = ""; }, 4500);
  }
}

function erroTela(msg) { $("tela").insertAdjacentHTML("beforeend", `<div class="aviso" style="color:#b3261e">${msg}</div>`); beep(250, .5); setTimeout(() => { etapa = "diocese"; digits = ""; render(); $("urna").classList.add("hidden"); $("ident").classList.remove("hidden"); $("err").textContent = msg; }, 3000); }

function boxes() { return `<div class="digitos">${[0, 1].map(i => `<span class="${i === digits.length && !branco ? "cur" : ""}">${digits[i] || ""}</span>`).join("")}</div>`; }

function render() {
  const t = $("tela");
  if (etapa === "fim") { t.innerHTML = `<div class="fim">FIM</div><div class="rodape" style="text-align:center">VOTOU</div>`; return; }
  if (etapa === "diocese") {
    const d = digits.length === 2 ? cfg.dioceses.find(x => x.num === digits) : null;
    t.innerHTML = `<div class="topo">Eleitor: ${nome}</div><div class="titulo">SUA DIOCESE</div>${boxes()}
      <div class="info">${digits.length === 2 ? (d ? `Diocese:<br><b>${d.nome}</b>` : `<div class="aviso">NÚMERO ERRADO</div>`) : ""}</div>
      <div class="rodape">Digite o número da sua diocese<br>CONFIRMA para continuar · CORRIGE para refazer</div>`;
    return;
  }
  const c = digits.length === 2 ? cfg.candidatos.find(x => x.num === digits) : null;
  let corpo = "";
  if (branco) corpo = `<div class="aviso">VOTO EM BRANCO</div>`;
  else if (digits.length === 2 && c) corpo = `<div class="info">Nome:<br><b>${c.nome}</b><br><br>${c.cargo}</div>${fotoHTML(c)}`;
  else if (digits.length === 2) corpo = `<div class="aviso">NÚMERO ERRADO</div><div class="aviso">VOTO NULO</div>`;
  t.innerHTML = `<div class="topo">Eleitor: ${nome} · ${dioceseSel.nome}</div><div class="titulo">SEU VOTO PARA</div><div class="cargo">${cfg.titulo.toUpperCase()}</div>${branco ? "" : boxes()}${corpo}
    <div class="rodape">Aperte a tecla:<br>VERDE para CONFIRMAR este voto · LARANJA para CORRIGIR · BRANCO para voto em branco</div>`;
}

function fotoHTML(c) {
  const ini = initials(c.nome);
  return `<div class="foto">${c.foto ? `<img src="${c.foto}" alt="" onerror="this.remove()">` : ""}<span style="position:absolute;z-index:-0">${ini}</span><small>${c.num}</small></div>`;
}
