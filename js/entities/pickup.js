Rexx.Pickup = {
  spawn(g, x, y, type, value = 1) {
    if (type === "coin" && g.difficulty.permanentCurrencyMultiplier === 0)
      return;
    let p = g.pickups.get();
    if (!p) {
      if (type === "xp") {
        let nearest = g.pickups.items.find((a) => a.active && a.type === "xp");
        if (nearest) nearest.value += value;
      } else g.collect({ type, value });
      return;
    }
    Object.assign(p, {
      x,
      y,
      type,
      value,
      magnet: false,
      age: 0,
      r: type === "chest" ? 15 : 6,
    });
  },
  update(g, p, dt) {
    p.age += dt;
    let dx = g.player.x - p.x,
      dy = g.player.y - p.y,
      n = Math.hypot(dx, dy) || 1;
    if (n < g.player.stats.pickup || p.magnet) {
      p.magnet = true;
      let v = Math.min(n, dt * (350 + p.age * 12));
      p.x += (dx / n) * v;
      p.y += (dy / n) * v;
    }
    if (n < 22) {
      g.pickups.release(p);
      g.collect(p);
    }
  },
};
