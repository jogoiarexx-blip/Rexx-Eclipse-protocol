Rexx.UI = class {
  constructor(app) {
    this.app = app;
    this.root = document.getElementById("ui");
    this.hudRoot = document.getElementById("hud");
    this.selectedCharacter = "rexx";
    this.selectedMap = "zero";
    this.selectedDifficulty = 0;
    this.screen = "menu";
    this.tick = 0;
  }
  button(text, fn, cls = "") {
    const b = document.createElement("button");
    b.className = cls;
    b.textContent = text;
    b.onclick = () => {
      this.app.audio.init();
      this.app.audio.play("ui");
      fn();
    };
    return b;
  }
  shell(title, subtitle = "", back = () => this.menu()) {
    this.root.innerHTML = "";
    this.root.className = "screen";
    const head = document.createElement("header");
    head.innerHTML = `<div><span class="eyebrow">REXX / ECLIPSE PROTOCOL</span><h2>${title}</h2><p>${subtitle}</p></div>`;
    head.append(this.button("← Voltar", back, "quiet"));
    this.root.append(head);
    const body = document.createElement("div");
    body.className = "content";
    this.root.append(body);
    return body;
  }
  card(parent, html, cls = "") {
    let d = document.createElement("article");
    d.className = "card " + cls;
    d.innerHTML = html;
    parent.append(d);
    return d;
  }
  hide() {
    this.root.innerHTML = "";
    this.root.className = "hidden";
    this.hudRoot.classList.remove("hidden");
  }
  menu() {
    this.screen = "menu";
    this.app.game = null;
    this.app.audio.mode = "menu";
    this.hudRoot.classList.add("hidden");
    this.root.className = "home";
    this.root.innerHTML = `<div class="home-top"><span class="brand">R / EP</span><span>PROTOCOLO DE CONTENÇÃO · V${Rexx.version}</span><span class="wallet">◉ ${Rexx.util.fmt(this.app.save.coins)}</span></div><div class="home-copy"><span class="eyebrow">A ÚLTIMA LINHA ENTRE REALIDADES</span><h1>REXX<span>ECLIPSE PROTOCOL</span></h1><p>A realidade se rompeu.<br>Você ainda pode mudar o que resta.</p><nav id="nav"></nav></div><div class="home-lore"><span class="micro">TRANSMISSÃO 001</span><p>O Eclipse abriu as fendas.<br>O Core transforma seus ecos em poder.<br>Entre. Evolua. Encerre o sinal.</p><div class="signal">● SINAL ESTÁVEL</div></div><footer><span>WASD / SETAS · MOVER &nbsp; ESC · PAUSAR</span><span>HTML5 · OFFLINE · UNIVERSO ORIGINAL</span></footer>`;
    const nav = this.root.querySelector("#nav");
    nav.append(
      this.button("INICIAR PROTOCOLO  ↗", () => this.select(), "primary play"),
    );
    let links = document.createElement("div");
    links.className = "nav-grid";
    for (const [label, fn] of [
      ["Personagens", () => this.characters()],
      ["Upgrades", () => this.permanent()],
      ["Arsenal", () => this.arsenal()],
      ["Bestiário", () => this.bestiary()],
      ["Conquistas", () => this.achievements()],
      ["Estatísticas", () => this.statistics()],
      ["Configurações", () => this.settings()],
    ])
      links.append(this.button(label, fn, "nav-button"));
    nav.append(links);
    if (Rexx.Save.warning) this.toast(Rexx.Save.warning);
  }
  select() {
    this.screen = "select";
    const b = this.shell(
      "Preparar missão",
      "Minichefe aos 10:00. Batalha final aos 15:00: entidade regional + 2 minichefes. Ataques e habilidades são automáticos.",
    );
    b.innerHTML =
      '<h3>01 / AGENTE</h3><div class="grid agents"></div><h3>02 / REGIÃO</h3><div class="grid maps"></div><h3>03 / INTENSIDADE</h3><div class="difficulty"></div><div class="launch"></div>';
    const agents = b.querySelector(".agents");
    for (const ch of Rexx.data.characters) {
      const ok = ch.test(this.app.save.stats),
        d = this.card(
          agents,
          `<div class="portrait" style="--accent:${ch.color}"><span class="agent-art" style="--row:${this.app.sprites.rows[ch.id]}" role="img" aria-label="${ch.name}"></span></div><span class="micro">${ch.role}</span><h4>${ch.name}</h4><p>${Rexx.data.weapons.find((w) => w.id === ch.weapon).name}</p><small>${ok ? ch.special : ch.unlock}</small>`,
          (this.selectedCharacter === ch.id ? "selected " : "") +
            (!ok ? "locked" : ""),
        );
      d.append(
        this.button(
          ok
            ? this.selectedCharacter === ch.id
              ? "Selecionado"
              : "Selecionar"
            : "Bloqueado",
          () => {
            if (ok) {
              this.selectedCharacter = ch.id;
              this.select();
            }
          },
          "small",
        ),
      );
    }
    const maps = b.querySelector(".maps"),
      unlocked = this.app.unlockedMaps();
    Rexx.data.maps.forEach((m, i) => {
      const ok = unlocked.includes(m.id),
        record =
          this.app.save.records[
            m.id + "-" + Rexx.data.difficulties[this.selectedDifficulty].name
          ] || 0;
      const d = this.card(
        maps,
        `<div class="map-art map-${i}" style="--accent:${m.color}"><span>0${i + 1}</span><b>◎</b></div><h4>${m.name}</h4><span class="micro">${m.subtitle}</span><p>${m.desc}</p><small>Entidade: ${Rexx.data.bosses[m.boss].name}<br>Escala: ${m.difficulty}× · Recorde: ${Rexx.util.time(record)}<br>${ok ? "Região acessível" : "Vença em " + Rexx.data.maps[i - 1].name + " para abrir."}</small>`,
        (this.selectedMap === m.id ? "selected " : "") + (!ok ? "locked" : ""),
      );
      d.append(
        this.button(
          ok
            ? this.selectedMap === m.id
              ? "Selecionado"
              : "Selecionar"
            : "Bloqueado",
          () => {
            if (ok) {
              this.selectedMap = m.id;
              this.select();
            }
          },
          "small",
        ),
      );
    });
    const diff = b.querySelector(".difficulty");
    Rexx.data.difficulties.forEach((d, i) => {
      let ok = this.app.save.stats.wins >= d.wins;
      diff.append(
        this.button(
          d.name +
            (ok
              ? d.id === "easy"
                ? " · sem moedas permanentes"
                : ` · ${d.reward}× moedas`
              : ` · ${d.wins} vitórias`),
          () => {
            if (ok) {
              this.selectedDifficulty = i;
              this.select();
            }
          },
          i === this.selectedDifficulty ? "selected" : "",
        ),
      );
    });
    const info = document.createElement("p");
    info.className = "difficulty-info";
    info.textContent =
      Rexx.data.difficulties[this.selectedDifficulty].description;
    diff.after(info);
    b.querySelector(".launch").append(
      this.button(
        "ENTRAR NA FENDA →",
        () =>
          this.app.start(
            this.selectedCharacter,
            this.selectedMap,
            this.selectedDifficulty,
          ),
        "primary",
      ),
    );
  }
  characters() {
    this.screen = "characters";
    const b = this.shell(
      "Agentes",
      "Cada Eclipse Core manifesta uma habilidade automática e atributos próprios.",
    );
    b.classList.add("grid");
    for (const c of Rexx.data.characters) {
      const ok = c.test(this.app.save.stats),
        s = new Rexx.Player(c, this.app.save).stats;
      this.card(
        b,
        `<div class="portrait big" style="--accent:${c.color}"><span class="agent-art" style="--row:${this.app.sprites.rows[c.id]}" role="img" aria-label="${c.name}"></span></div><span class="micro">${c.role} · ${ok ? "DISPONÍVEL" : "BLOQUEADO"}</span><h3>${c.name}</h3><p>${c.desc}</p><p class="accent">${c.special}</p><div class="statline"><span>HP ${Math.round(s.hp)}</span><span>Vel. ${Math.round(s.speed)}</span><span>Dano ${s.damage.toFixed(2)}×</span><span>Armadura ${s.armor}</span></div><p>Arma: ${Rexx.data.weapons.find((w) => w.id === c.weapon).name}</p><small>${c.unlock}<br>Bônus: ${Object.entries(
          c.stats,
        )
          .map(([k, v]) => `${Rexx.statLabels[k] || k} ${v}`)
          .join(" · ")}</small>`,
      );
    }
  }
  permanent() {
    this.screen = "permanent";
    const b = this.shell(
      "Aprimorar o Core",
      `◉ ${Rexx.util.fmt(this.app.save.coins)} moedas · Melhorias permanentes aplicadas no início de cada missão.`,
    );
    b.classList.add("grid");
    for (const p of Rexx.data.permanent) {
      let level = this.app.save.permanent[p.id] || 0,
        cost = this.app.cost(level),
        locked =
          ["luck", "area", "cooldown"].includes(p.id) &&
          this.app.save.stats.kills < 100;
      let d = this.card(
        b,
        `<span class="item-icon">${p.icon}</span><h3>${p.name}</h3><p>${p.label} · ${level}/10</p><progress value="${level}" max="10"></progress><small>Por compra: +${p.id === "regen" ? "0,10 HP/s" : p.id === "armor" ? "0,4" : (p.value * 0.4 * 100).toFixed(1) + "%"} ${p.label}</small>`,
      );
      d.append(
        this.button(
          locked
            ? "Requer 100 eliminações"
            : level >= 10
              ? "Aprimoramento máximo"
              : `Comprar · ◉ ${cost}`,
          () => {
            if (!locked && level < 10 && this.app.save.coins >= cost) {
              this.app.save.coins -= cost;
              this.app.save.permanent[p.id] = level + 1;
              this.app.persist();
              this.permanent();
            } else
              this.toast(
                locked
                  ? "Elimine 100 inimigos para liberar este módulo."
                  : "Moedas insuficientes ou nível máximo.",
              );
          },
          "small",
        ),
      );
    }
  }
  arsenal() {
    this.screen = "arsenal";
    const b = this.shell(
      "Arsenal",
      "6 espaços de armas + 6 passivas por missão. Arma nível 8 + passiva compatível + baú = evolução.",
    );
    b.innerHTML =
      '<h3>ARMAS / 15 PROTOCOLOS</h3><div class="grid weapons"></div><h3>MÓDULOS PASSIVOS / 14</h3><div class="grid passives"></div>';
    for (const w of Rexx.data.weapons) {
      const unlocked = this.app.save.stats.kills >= w.unlock,
        discovered = this.app.save.evolutions.includes(w.id),
        p = Rexx.data.passives.find((p) => p.id === w.passive);
      this.card(
        b.querySelector(".weapons"),
        `<span class="item-icon" style="color:${w.color}">${this.app.weaponSprites.icon(w.id)}</span><span class="micro">${unlocked ? "NÍVEIS 1–8" : w.unlock + " ELIMINAÇÕES PARA LIBERAR"}</span><h3>${w.name}</h3><p>${w.desc}</p><small>Dano base ${w.damage} · Intervalo ${w.cooldown}s<br>Cada nível: +23% dano base, +3,5% cadência, +4% área.<br>Projéteis extras nos níveis 4 e 7.</small><div class="recipe"><span>${w.name} VIII + ${p.name}</span><h4>${discovered ? "✺ " : "◇ "}${w.evolution}</h4><small>${w.evoDesc}<br>${discovered ? "Combinação descoberta" : "Combinação ainda não descoberta"}</small></div>`,
        unlocked ? "" : "locked",
      );
    }
    for (const p of Rexx.data.passives)
      this.card(
        b.querySelector(".passives"),
        `<span class="item-icon">${p.icon}</span><h4>${p.name}</h4><p>${p.label} · 5 níveis</p><small>${["armor", "amount"].includes(p.id) ? "+" + p.value : p.id === "regen" ? "+0,25 HP/s" : "+" + Math.round(p.value * 100) + "%"} por nível comum. Raridades amplificam o ganho.</small>`,
      );
  }
  bestiary() {
    this.screen = "bestiary";
    const b = this.shell(
      "Arquivo de entidades",
      "A primeira aparição revela a entidade. Os abates são preservados ao encerrar a missão.",
    );
    b.classList.add("grid");
    for (const e of [...Rexx.data.enemies, ...Rexx.data.bosses]) {
      let known = e.id in this.app.save.discoveries;
      let card = this.card(
        b,
        known
          ? `<canvas class="enemy-preview" width="160" height="100" data-id="${e.id}"></canvas><span class="micro">${e.id[0] === "b" ? "ENTIDADE REGIONAL" : e.type}</span><h3>${e.name}</h3><p>${e.desc}</p><small>HP base ${e.hp} · Dano ${e.damage}<br>Eliminados: ${this.app.save.discoveries[e.id]}</small>`
          : '<span class="item-icon">?</span><h3>Sinal desconhecido</h3><p>Encontre esta entidade durante uma missão.</p>',
        known ? "" : "locked",
      );
      if (known) {
        let c = card.querySelector("canvas").getContext("2d");
        this.app.engine.entity(
          c,
          {
            x: 80,
            y: 50,
            r: e.id[0] === "b" ? 32 : e.r,
            data: e,
            boss: e.id[0] === "b",
            status: {},
            shield: 0,
            elite: false,
            hp: 1,
            maxHP: 1,
          },
          0,
        );
      }
    }
  }
  achievements() {
    this.screen = "achievements";
    const b = this.shell(
      "Conquistas",
      `${this.app.save.achievements.length} / ${Rexx.data.achievements.length} sinais concluídos. Recompensas creditadas automaticamente ao encerrar a missão.`,
    );
    b.classList.add("grid");
    for (const a of Rexx.data.achievements) {
      let ok = this.app.save.achievements.includes(a.id),
        v = Math.min(a.target, a.value(this.app.save.stats));
      this.card(
        b,
        `<span class="item-icon">${ok ? "✦" : "◇"}</span><h4>${a.name}</h4><p>${a.desc}</p><progress value="${v}" max="${a.target}"></progress><small>${Rexx.util.fmt(v)} / ${Rexx.util.fmt(a.target)} · ◉ ${a.reward}<br>${ok ? "CONQUISTADO" : "EM PROGRESSO"}</small>`,
        ok ? "selected" : "",
      );
    }
  }
  statistics() {
    this.screen = "statistics";
    const s = this.app.save.stats,
      b = this.shell(
        "Registro de operações",
        "Estatísticas globais do seu Eclipse Core.",
      ),
      favorite = Object.entries(s.characters).sort((a, b) => b[1] - a[1])[0];
    b.classList.add("grid");
    for (const [k, v] of Object.entries({
      Partidas: s.runs,
      Vitórias: s.wins,
      Derrotas: s.losses,
      "Inimigos eliminados": Rexx.util.fmt(s.kills),
      "Chefes derrotados": s.bosses,
      "Tempo total": Rexx.util.time(s.time),
      "Maior sobrevivência": Rexx.util.time(s.bestTime),
      "Maior nível": s.bestLevel,
      "Maior dano em uma missão": Rexx.util.fmt(s.bestDamage),
      "XP total": Rexx.util.fmt(s.xp),
      "Baús abertos": s.chests,
      Evoluções: s.evolved,
      "Agente favorito": favorite
        ? Rexx.data.characters.find((c) => c.id === favorite[0])?.name
        : "—",
    }))
      this.card(b, `<span class="micro">${k}</span><h2>${v}</h2>`);
  }
  settings(back = () => this.menu()) {
    this.screen = "settings";
    const b = this.shell(
      "Configurações",
      "Preferências salvas automaticamente.",
      back,
    );
    b.classList.add("settings");
    const s = this.app.save.settings;
    for (const [id, name] of [
      ["master", "Volume geral"],
      ["music", "Música"],
      ["sfx", "Efeitos sonoros"],
    ]) {
      let l = document.createElement("label");
      l.innerHTML = `<span>${name}</span><input type="range" min="0" max="1" step=".01" value="${s[id]}"><output>${Math.round(s[id] * 100)}%</output>`;
      l.querySelector("input").oninput = (e) => {
        this.app.audio.init();
        s[id] = +e.target.value;
        l.querySelector("output").textContent = Math.round(s[id] * 100) + "%";
        this.app.persist();
      };
      b.append(l);
    }
    for (const [id, name] of [
      ["shake", "Tremor de tela"],
      ["numbers", "Números de dano"],
      ["particles", "Partículas"],
    ]) {
      let l = document.createElement("label");
      l.innerHTML = `<span>${name}</span><input type="checkbox" ${s[id] ? "checked" : ""}>`;
      l.querySelector("input").onchange = (e) => {
        s[id] = e.target.checked;
        this.app.persist();
      };
      b.append(l);
    }
    let l = document.createElement("label");
    l.innerHTML =
      "<span>Qualidade gráfica</span><select><option>alta</option><option>média</option><option>baixa</option></select>";
    l.querySelector("select").value = s.quality;
    l.querySelector("select").onchange = (e) => {
      s.quality = e.target.value;
      this.app.engine.resize();
      this.app.persist();
    };
    b.append(l);
    b.append(
      this.button("Alternar tela cheia", () => {
        const action = document.fullscreenElement
          ? document.exitFullscreen?.bind(document)
          : document.documentElement.requestFullscreen?.bind(
              document.documentElement,
            );
        if (!action) {
          this.toast("Tela cheia indisponível neste navegador.");
          return;
        }
        Promise.resolve(action()).catch(() =>
          this.toast("Tela cheia indisponível neste navegador."),
        );
      }),
      this.button("Exportar perfil de segurança", () =>
        Rexx.Save.export(this.app.save),
      ),
    );
    let label = document.createElement("label");
    label.innerHTML =
      '<span>Importar perfil JSON</span><input type="file" accept=".json,application/json">';
    label.querySelector("input").onchange = async (e) => {
      let file = e.target.files[0];
      if (!file) return;
      try {
        const raw = await file.text(),
          data = JSON.parse(raw);
        if (data.version !== 1 || !data.stats) throw Error();
        localStorage.setItem(Rexx.Save.key, raw);
        this.app.save = Rexx.Save.load();
        this.toast("Perfil importado.");
        this.settings(back);
      } catch {
        this.toast("Arquivo de perfil inválido.");
      }
    };
    b.append(label);
    let note = document.createElement("p");
    note.textContent =
      "WASD ou setas para mover. ESC pausa. Gamepad: analógico esquerdo e Start; use mouse nos menus. Música e efeitos originais sintetizados localmente.";
    b.append(note);
  }
  toast(text) {
    let t = document.getElementById("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove("show"), 4500);
  }
};
