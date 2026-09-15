Rexx.UI.prototype.hud = function (g) {
  if (g.state === "ended") return;
  let now = performance.now();
  if (now - this.tick < 100) return;
  this.tick = now;
  let p = g.player,
    s = p.stats,
    bosses = g.enemies.items.filter((e) => e.active && e.boss);
  this.hudRoot.innerHTML = `<div class="hud-top"><div class="vitals"><div class="hud-label"><b>${p.character.name}</b><span>${Math.ceil(p.hp)} / ${Math.round(s.hp)}</span></div><div class="bar hp"><i style="width:${(p.hp / s.hp) * 100}%"></i></div><div class="hud-label"><span>NÍVEL ${p.level}</span><span>${Math.floor(p.xp)} / ${p.nextXP} XP</span></div><div class="bar xp"><i style="width:${(p.xp / p.nextXP) * 100}%"></i></div></div><div class="clock"><strong>${Rexx.util.time(g.time)}</strong><span>${g.map.name} / ${g.difficulty.name}</span></div><div class="counters"><b>◉ ${Rexx.util.fmt(g.stats.coins)}</b><span>ELIMINAÇÕES ${Rexx.util.fmt(g.stats.kills)}</span><button id="pause-button">Ⅱ PAUSA</button></div></div><div class="boss-bars">${bosses.map((e) => `<div class="boss-label">${e.data.name} · FASE ${e.phase} <span>${Math.ceil(e.hp)} / ${Math.ceil(e.maxHP)}</span></div><div class="bar boss"><i style="width:${Math.max(0, (e.hp / e.maxHP) * 100)}%;background:${e.data.color}"></i></div>`).join("")}</div><div class="loadout"><div class="slots">${p.weapons
    .map((w) => {
      const d = Rexx.data.weapons.find((d) => d.id === w.id);
      return `<div class="slot ${w.evolved ? "evolved" : ""}" title="${w.evolved ? d.evolution : d.name}"><span style="color:${d.color}">${d.icon}</span><small>${w.evolved ? "✦" : w.level}</small></div>`;
    })
    .join(
      "",
    )}${'<div class="slot empty">+</div>'.repeat(6 - p.weapons.length)}</div><div class="passive-slots">${Object.entries(
    p.passives,
  )
    .map(
      ([id, n]) =>
        `<span title="${Rexx.data.passives.find((d) => d.id === id).name}">${Rexx.data.passives.find((d) => d.id === id).icon}<small>${n}</small></span>`,
    )
    .join(
      "",
    )}</div><div class="ability">${p.character.special.split(":")[0]} <span>${Math.ceil(p.special)}s</span><div class="bar"><i style="width:${(1 - p.special / p.specialMax) * 100}%"></i></div></div></div>`;
  this.hudRoot.querySelector("#pause-button").onclick = () => this.app.pause();
};
