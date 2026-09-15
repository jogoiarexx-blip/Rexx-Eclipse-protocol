Rexx.Enemy = {
  create: () => ({ active: false, status: {}, uid: 0 }),
  spawn(g, index, x, y, elite = false) {
    const e = g.enemies.get();
    if (!e) return null;
    let d = Rexx.data.enemies[index],
      scale = (1 + g.time / 220) * g.difficulty.hp * g.map.difficulty;
    Object.assign(e, {
      x,
      y,
      id: d.id,
      data: d,
      r: d.r * (elite ? 1.65 : 1),
      hp: d.hp * scale * (elite ? 6 : 1),
      maxHP: d.hp * scale * (elite ? 6 : 1),
      speed: d.speed * g.difficulty.speed,
      damage: d.damage * g.difficulty.damage * (elite ? 1.35 : 1),
      elite,
      boss: false,
      uid: ++g.uid,
      timer: Rexx.util.rand(1, 3),
      phase: 0,
      charge: 0,
      vx: 0,
      vy: 0,
      flash: 0,
      shield: d.type === "shield" ? 3 : 0,
      dot: 0,
    });
    e.status = {};
    e.sources = {};
    g.app.save.discoveries[d.id] ??= 0;
    return e;
  },
  update(g, e, dt) {
    if (!e.active) return;
    e.flash = Math.max(0, e.flash - dt);
    for (const k in e.status) {
      e.status[k] -= dt;
      if (e.status[k] <= 0) delete e.status[k];
    }
    e.dot -= dt;
    if (e.dot <= 0) {
      e.dot = 0.5;
      if (e.status.burn)
        g.damage.hit(
          e,
          5 * g.player.stats.damage,
          e.sources.burn || "status",
          0,
        );
      if (e.status.poison)
        g.damage.hit(
          e,
          8 * g.player.stats.damage,
          e.sources.poison || "status",
          0,
        );
    }
    if (!e.active) return;
    if (e.boss) {
      Rexx.Boss.update(g, e, dt);
      return;
    }
    if (e.status.freeze || e.status.stun) return;
    let dx = g.player.x - e.x,
      dy = g.player.y - e.y,
      n = Math.hypot(dx, dy) || 1,
      slow = e.status.slow ? 0.5 : 1,
      speed = e.speed * slow;
    e.timer -= dt;
    let type = e.data.type;
    if (type === "charge") {
      if (e.charge > 0) {
        e.charge -= dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        return;
      }
      if (e.timer < 0.55) {
        e.flash = 0.1;
        speed = 0;
      }
      if (e.timer <= 0) {
        e.vx = (dx / n) * 370;
        e.vy = (dy / n) * 370;
        e.charge = 0.7;
        e.timer = 4;
      }
    }
    if (type === "shooter") {
      if (n < 310) speed = -speed * 0.45;
      if (n > 280 && n < 430) speed = 0;
      if (e.timer <= 0) {
        g.hostile(e.x, e.y, Math.atan2(dy, dx), 185, e.damage);
        e.timer = 2.8;
      }
    }
    if (type === "summon" && e.timer <= 0) {
      e.timer = 6;
      for (let i = 0; i < 3; i++)
        Rexx.Enemy.spawn(
          g,
          1,
          e.x + Rexx.util.rand(-40, 40),
          e.y + Rexx.util.rand(-40, 40),
        );
    }
    if (type === "teleport" && e.timer <= 0) {
      e.timer = 5;
      let a = Math.random() * Math.PI * 2;
      e.x = g.player.x + Math.cos(a) * 260;
      e.y = g.player.y + Math.sin(a) * 260;
      g.particles.burst(e.x, e.y, e.data.color, 14);
    }
    if (type === "bomb" && n < 65) {
      g.zone(e.x, e.y, 100, 0.75, e.damage, true, "#ff785d");
      g.kill(e, false);
      return;
    }
    let wobble = type === "fly" ? Math.sin(g.time * 4 + e.uid) * 0.8 : 0;
    e.x += (dx / n - (wobble * dy) / n) * speed * dt;
    e.y += (dy / n + (wobble * dx) / n) * speed * dt;
    if (e.elite && Math.floor(g.time * 2 + e.uid) % 12 === 0 && e.timer < 1) {
      g.hostile(e.x, e.y, Math.atan2(dy, dx), 210, e.damage);
      e.timer = 2;
    }
    if (n < e.r + g.player.r) g.damage.player(e.damage);
    if (n > 1800) {
      let a = Math.atan2(dy, dx) + Math.PI;
      e.x = g.player.x + Math.cos(a) * 850;
      e.y = g.player.y + Math.sin(a) * 850;
    }
  },
};
