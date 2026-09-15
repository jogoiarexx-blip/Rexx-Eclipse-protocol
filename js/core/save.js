(() => {
  const key = "rexx.eclipse.v1";
  const defaults = () => ({
    version: 1,
    coins: 0,
    permanent: {},
    achievements: [],
    discoveries: {},
    evolutions: [],
    records: {},
    stats: {
      runs: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      bosses: 0,
      time: 0,
      bestTime: 0,
      bestLevel: 1,
      bestDamage: 0,
      xp: 0,
      chests: 0,
      evolved: 0,
      mapWins: {},
      characters: {},
    },
    settings: {
      master: 0.6,
      music: 0.35,
      sfx: 0.65,
      shake: true,
      numbers: true,
      particles: true,
      quality: "alta",
    },
  });
  function numeric(v, d = 0) {
    return Number.isFinite(v) && v >= 0 ? Math.min(v, 1e12) : d;
  }
  Rexx.Save = {
    key,
    warning: "",
    load() {
      let d = defaults();
      try {
        let raw = localStorage.getItem(key);
        if (!raw) return d;
        let s = JSON.parse(raw);
        if (!s || s.version !== 1 || typeof s.stats !== "object")
          throw Error("Formato inválido");
        d.coins = numeric(s.coins);
        for (const k of Object.keys(d.stats))
          if (typeof d.stats[k] === "number")
            d.stats[k] = numeric(s.stats[k], d.stats[k]);
        for (const k of ["mapWins", "characters"])
          if (s.stats[k] && typeof s.stats[k] === "object")
            for (const [id, n] of Object.entries(s.stats[k]))
              if (/^[a-z0-9]+$/.test(id)) d.stats[k][id] = numeric(n);
        for (const p of Rexx.data.permanent)
          d.permanent[p.id] = Math.min(
            10,
            Math.floor(numeric(s.permanent?.[p.id])),
          );
        d.achievements = Array.isArray(s.achievements)
          ? s.achievements.filter((x) => typeof x === "string")
          : [];
        d.evolutions = Array.isArray(s.evolutions)
          ? s.evolutions.filter((x) => typeof x === "string")
          : [];
        if (s.discoveries && typeof s.discoveries === "object")
          for (const [k, v] of Object.entries(s.discoveries))
            d.discoveries[k] = numeric(v);
        if (s.records && typeof s.records === "object")
          for (const [k, v] of Object.entries(s.records))
            d.records[k] = numeric(v);
        for (const k of ["master", "music", "sfx"])
          d.settings[k] = Math.min(1, numeric(s.settings?.[k], d.settings[k]));
        for (const k of ["shake", "numbers", "particles"])
          if (typeof s.settings?.[k] === "boolean")
            d.settings[k] = s.settings[k];
        if (["alta", "média", "baixa"].includes(s.settings?.quality))
          d.settings.quality = s.settings.quality;
        return d;
      } catch (e) {
        this.warning =
          "Save inválido ou indisponível: um perfil seguro foi iniciado.";
        return d;
      }
    },
    write(s) {
      try {
        localStorage.setItem(key, JSON.stringify(s));
        return true;
      } catch (e) {
        this.warning =
          "Não foi possível salvar neste navegador. Exporte seu perfil em Configurações.";
        return false;
      }
    },
    export(s) {
      const b = new Blob([JSON.stringify(s, null, 2)], {
          type: "application/json",
        }),
        a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "REXX-save.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
  };
})();
