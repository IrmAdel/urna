// Cole este código em script.google.com (projeto ligado a uma Planilha Google). Veja LEIAME.md.
const SENHA_ADMIN = "troque-esta-senha";

function aba(nome, cab) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(nome);
  if (!s) { s = ss.insertSheet(nome); if (cab) s.appendRow(cab); }
  return s;
}
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const norm = s => String(s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");

function doGet() { return out({ ok: true }); }

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents), a = d.action;
    if (a === "config") {
      const v = aba("Config").getDataRange().getValues().map(r => r[0]).join("");
      return out({ config: v ? JSON.parse(v) : null });
    }
    if (a === "vote") {
      const v = d.vote, s = aba("Votos", ["hora", "nome", "dioceseNum", "dioceseNome", "voto", "candNome"]);
      const dup = s.getDataRange().getValues().slice(1).some(r => norm(r[1]) === norm(v.nome) && String(r[2]) === String(v.dioceseNum));
      if (dup) return out({ error: "Este nome já votou nesta diocese." });
      s.appendRow([new Date().toISOString(), v.nome, "'" + v.dioceseNum, v.dioceseNome, "'" + v.voto, v.candNome]);
      return out({ ok: true });
    }
    if (d.pw !== SENHA_ADMIN) return out({ error: "Senha incorreta" });
    if (a === "login") return out({ ok: true });
    if (a === "results") {
      const rows = aba("Votos", ["hora", "nome", "dioceseNum", "dioceseNome", "voto", "candNome"]).getDataRange().getValues().slice(1);
      return out({ votes: rows.map(r => ({ hora: r[0], nome: r[1], dioceseNum: String(r[2]), dioceseNome: r[3], voto: String(r[4]), candNome: r[5] })) });
    }
    if (a === "saveConfig") {
      const s = aba("Config"), txt = JSON.stringify(d.config); s.clear();
      for (let i = 0; i < txt.length; i += 40000) s.appendRow([txt.substr(i, 40000)]);
      return out({ ok: true });
    }
    if (a === "reset") {
      const s = aba("Votos", ["hora", "nome", "dioceseNum", "dioceseNome", "voto", "candNome"]);
      if (s.getLastRow() > 1) s.deleteRows(2, s.getLastRow() - 1);
      return out({ ok: true });
    }
    return out({ error: "Ação desconhecida" });
  } catch (err) { return out({ error: String(err) }); }
  finally { lock.releaseLock(); }
}
