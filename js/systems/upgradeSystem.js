Rexx.Upgrades = {
  rarity(luck) {
    let rs = Rexx.data.rarities,
      weights = rs.map((r, i) => r.weight * (i ? 1 + (luck - 1) * i : 0.95)),
      n = Math.random() * weights.reduce((a, b) => a + b, 0);
    return rs[weights.findIndex((v) => (n -= v) < 0)] || rs[0];
  },
  options(g) {
    const p = g.player,
      all = [];
    for (const w of Rexx.data.weapons) {
      let own = p.weapons.find((a) => a.id === w.id);
      if (
        (own && own.level < 8) ||
        (!own &&
          p.weapons.length < Rexx.C.weaponSlots &&
          g.app.save.stats.kills >= w.unlock)
      )
        all.push({
          kind: "weapon",
          id: w.id,
          name: w.name,
          icon: w.icon,
          level: (own?.level || 0) + 1,
          desc: own
            ? "Mais dano, alcance e cadência; projéteis extras nos níveis 4 e 7."
            : w.desc,
        });
    }
    for (const a of Rexx.data.passives)
      if (
        (p.passives[a.id] || 0) < a.max &&
        (p.passives[a.id] ||
          Object.keys(p.passives).length < Rexx.C.passiveSlots)
      )
        all.push({
          kind: "passive",
          id: a.id,
          name: a.name,
          icon: a.icon,
          level: (p.passives[a.id] || 0) + 1,
          desc: `+${a.id === "regen" ? "0,25 HP/s" : a.value < 1 ? Math.round(a.value * 100) + "%" : a.value} ${a.label}${a.id === "cooldown" ? " de redução" : ""}`,
        });
    if (all.length < 3)
      all.push(
        {
          kind: "heal",
          id: "heal",
          name: "Reparo de campo",
          icon: "✚",
          level: 1,
          desc: "Recupere 35% do HP máximo.",
        },
        {
          kind: "coin",
          id: "coin",
          name: "Reserva de núcleos",
          icon: "◉",
          level: 1,
          desc: "Receba 40 moedas.",
        },
      );
    while (all.length < 3)
      all.push({
        kind: "coin",
        id: "reserve" + all.length,
        name: "Crédito de exploração",
        icon: "◉",
        level: 1,
        desc: "Receba 40 moedas.",
      });
    const out = [];
    while (out.length < 3 && all.length) {
      let i = Math.floor(Math.random() * all.length),
        o = all.splice(i, 1)[0];
      o.rarity = this.rarity(p.stats.luck);
      out.push(o);
    }
    return out;
  },
  apply(g, o) {
    let p = g.player;
    if (o.kind === "weapon") {
      let w = p.weapons.find((a) => a.id === o.id);
      if (w) {
        w.level = Math.min(8, w.level + 1);
        w.quality += 0.025 * o.rarity.mult;
      } else
        p.weapons.push({
          id: o.id,
          level: 1,
          timer: 0,
          evolved: false,
          quality: 1 + 0.06 * (o.rarity.mult - 1),
          damage: 0,
        });
    } else if (o.kind === "passive") {
      p.passives[o.id] = (p.passives[o.id] || 0) + 1;
      p.quality[o.id] =
        ((p.quality[o.id] || 1) * ((p.passives[o.id] || 1) - 1) +
          o.rarity.mult) /
        p.passives[o.id];
      p.recalc(g.app.save);
    } else if (o.kind === "heal")
      p.hp = Math.min(p.stats.hp, p.hp + p.stats.hp * 0.35);
    else g.stats.coins += 40;
    g.app.audio.play("level");
  },
  evolve(g) {
    let w = g.player.weapons.find(
      (w) =>
        !w.evolved &&
        w.level === 8 &&
        g.player.passives[Rexx.data.weapons.find((d) => d.id === w.id).passive],
    );
    if (!w) return null;
    w.evolved = true;
    let d = Rexx.data.weapons.find((d) => d.id === w.id);
    g.stats.evolutions++;
    if (!g.app.save.evolutions.includes(w.id)) g.app.save.evolutions.push(w.id);
    g.camera.event = 2;
    g.camera.shake = 18;
    g.particles.burst(g.player.x, g.player.y, d.color, 70);
    g.app.audio.play("evolve");
    g.alert("EVOLUÇÃO · " + d.evolution);
    return d;
  },
};
