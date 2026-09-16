Rexx.Projectile = {
  create: () => ({ active: false, hits: new Set() }),
  spawn(g, o) {
    const p = g.projectiles.get();
    if (!p) return null;
    Object.assign(
      p,
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 5,
        life: 2,
        age: 0,
        damage: 1,
        color: "#fff",
        hostile: false,
        pierce: 0,
        bounce: 0,
        returning: false,
        weapon: null,
        status: null,
        split: false,
        turned: false,
        collect: false,
      },
      o,
    );
    p.hits.clear();
    g.particles.flash(p.x, p.y, p.color, p.hostile ? 10 : 15, "muzzle");
    return p;
  },
  update(g, p, dt) {
    p.life -= dt;
    p.age += dt;
    if (p.life <= 0) {
      g.projectiles.release(p);
      return;
    }
    if (p.returning && p.age > 0.55) {
      let dx = g.player.x - p.x,
        dy = g.player.y - p.y,
        n = Math.hypot(dx, dy) || 1;
      p.vx = (dx / n) * 410;
      p.vy = (dy / n) * 410;
      if (n < 22) {
        g.projectiles.release(p);
        return;
      }
      if (p.collect)
        for (const k of g.pickups.items)
          if (k.active && Math.hypot(k.x - p.x, k.y - p.y) < 85)
            k.magnet = true;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.hostile) {
      if (Math.hypot(p.x - g.player.x, p.y - g.player.y) < p.r + 15) {
        g.damage.player(p.damage);
        g.projectiles.release(p);
      }
      return;
    }
    for (const e of g.grid.query(p.x, p.y, p.r + 28)) {
      if (p.hits.has(e.uid) || Math.hypot(e.x - p.x, e.y - p.y) > e.r + p.r)
        continue;
      p.hits.add(e.uid);
      const dealt = g.damage.hit(e, p.damage, p.weapon, p.status, 40);
      if (dealt > 0) {
        g.particles.flash(p.x, p.y, p.color, 18);
        g.particles.burst(p.x, p.y, p.color, 3);
      }
      if (p.split) {
        p.split = false;
        for (let j = -1; j <= 1; j += 2)
          g.shot(
            p.x,
            p.y,
            Math.atan2(p.vy, p.vx) + j * 0.7,
            p.damage * 0.5,
            p.weapon,
            { color: p.color, pierce: 1 },
          );
      }
      if (p.bounce > 0) {
        p.bounce--;
        let t = g.nearest(p.x, p.y, 500, p.hits);
        if (t) {
          let a = Math.atan2(t.y - p.y, t.x - p.x),
            v = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(a) * v;
          p.vy = Math.sin(a) * v;
        }
        break;
      }
      if (p.pierce-- <= 0) {
        g.projectiles.release(p);
        break;
      }
    }
  },
};
