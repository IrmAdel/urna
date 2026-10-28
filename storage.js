// Camada de armazenamento: modo LOCAL (localStorage) ou REMOTO (Google Apps Script + Planilha)
const Store = (() => {
  const C = window.APP_CONFIG, remote = !!C.BACKEND_URL;
  const lj = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const norm = s => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
  async function call(action, payload = {}) {
    const r = await fetch(C.BACKEND_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, ...payload }) });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    return j;
  }
  const checkPw = pw => { if (pw !== C.ADMIN_PASSWORD) throw new Error("Senha incorreta"); };
  return {
    remote,
    async getConfig() {
      if (remote) { try { const j = await call("config"); if (j.config) return j.config; } catch (e) { console.warn(e); } return DEFAULT_DATA; }
      return lj("ieab_config", DEFAULT_DATA);
    },
    async saveConfig(cfg, pw) {
      if (remote) return call("saveConfig", { pw, config: cfg });
      checkPw(pw); localStorage.setItem("ieab_config", JSON.stringify(cfg));
    },
    async vote(v) {
      if (remote) return call("vote", { vote: v });
      const votes = lj("ieab_votes", []);
      if (votes.some(x => norm(x.nome) === norm(v.nome) && x.dioceseNum === v.dioceseNum)) throw new Error("Este nome já votou nesta diocese.");
      votes.push(v); localStorage.setItem("ieab_votes", JSON.stringify(votes));
    },
    async login(pw) { if (remote) return call("login", { pw }); checkPw(pw); },
    async results(pw) {
      if (remote) return (await call("results", { pw })).votes;
      checkPw(pw); return lj("ieab_votes", []);
    },
    async reset(pw) {
      if (remote) return call("reset", { pw });
      checkPw(pw); localStorage.removeItem("ieab_votes");
    }
  };
})();
