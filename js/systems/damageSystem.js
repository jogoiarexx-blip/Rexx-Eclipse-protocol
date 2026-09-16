Rexx.Damage = class {
  constructor(g) {
    this.g = g;
  }
  hit(e, base, w, status, knock = 0) {
    if (!e.active || this.g.state !== "playing") return;
    if (e.demon && (e.grace > 0 || e.hitLock > 0)) return;
    let g = this.g,
      crit = w !== "status" && Math.random() < g.player.stats.crit,
      amount =
        base *
        (crit ? g.player.stats.critDamage : 1) *
        (e.status.vulnerable ? 1.35 : 1);
    if (e.shield > 0) {
      amount *= 0.35;
      e.shield--;
      g.particles.burst(e.x, e.y, "#82ceff", 4);
    }
    if (e.demon) {
      amount = Math.min(amount, Rexx.DEMON_CONFIG.maxHit);
      e.hitLock = Rexx.DEMON_CONFIG.hitInterval;
    }
    amount = Math.min(e.hp, amount);
    e.hp -= amount;
    e.flash = 0.08;
    g.stats.damage += amount;
    let weapon = g.player.weapons.find((a) => a.id === w);
    if (weapon) weapon.damage += amount;
    if (e.demon) status = null;
    if (status) {
      e.sources[status] = w;
    }
    if (status)
      e.status[status] = Math.max(
        e.status[status] || 0,
        (status === "freeze" ? 1.3 : 3) * g.player.stats.duration,
      );
    if (status === "shock") e.status.stun = 0.2;
    if (knock && !e.boss) {
      let n = Rexx.util.dist(e, g.player) || 1;
      e.x += ((e.x - g.player.x) / n) * knock * 0.1;
      e.y += ((e.y - g.player.y) / n) * knock * 0.1;
    }
    g.particles.number(e.x, e.y, amount, crit);
    if (e.hp <= 0) {
      const frost =
        e.status.freeze &&
        g.player.weapons.some((w) => w.id === "frost" && w.evolved);
      g.kill(e);
      if (frost) g.zone(e.x, e.y, 65, 0.12, base * 0.5, false, "#9ceaff", w);
    }
    return amount;
  }
  player(base, options = {}) {
    const g = this.g,
      p = g.player;
    if (p.invuln > 0 || p.shield > 0 || p.dash > 0 || g.state !== "playing")
      return;
    let d = options.trueDamage
      ? base
      : Math.max(1, base - p.stats.armor) * (1 - p.stats.resist);
    p.hp -= d;
    p.invuln = 0.65;
    g.camera.shake = 13;
    g.hurt = 0.2;
    g.app.audio.play("hurt");
    g.particles.number(p.x, p.y, -d, false);
    if (p.hp <= 0) {
      p.hp = 0;
      if (options.source?.demon) g.finale.killedPlayer(options.source);
      else g.finish(false);
    }
    return d;
  }
};
