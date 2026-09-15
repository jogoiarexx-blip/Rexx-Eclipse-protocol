Rexx.Weapons = class {
  constructor(g) {
    this.g = g;
  }
  update(dt) {
    for (const w of this.g.player.weapons) {
      w.timer -= dt;
      if (w.timer <= 0) {
        const d = Rexx.data.weapons.find((a) => a.id === w.id);
        w.timer =
          (d.cooldown * (1 - this.g.player.stats.cooldown)) /
          (this.g.player.stats.attackSpeed * (1 + w.level * 0.035));
        this.fire(w, d);
      }
    }
  }
  fire(w, d) {
    const g = this.g,
      p = g.player,
      s = p.stats,
      l = w.level,
      E = w.evolved,
      damage =
        d.damage * (1 + (l - 1) * 0.23) * s.damage * w.quality * (E ? 1.45 : 1),
      area = s.area * (1 + l * 0.04),
      n = 1 + Math.floor((l - 1) / 3) + s.amount,
      target = g.nearest(p.x, p.y, 900),
      a = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.angle || 0,
      opts = { color: d.color, status: null };
    const shot = (ang, x = p.x, y = p.y, extra = {}) =>
      g.shot(x, y, ang, damage, w.id, { ...opts, ...extra });
    g.app.audio.play("shot");
    Rexx.WeaponBehaviors[d.type]({
      g,
      p,
      s,
      l,
      E,
      damage,
      area,
      n,
      target,
      a,
      shot,
      w,
      d,
    });
  }
};
