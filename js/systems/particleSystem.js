Rexx.Particles = class {
  constructor(g) {
    this.g = g;
    this.pool = new Rexx.Pool(() => ({ active: false }), Rexx.C.maxParticles);
  }
  burst(x, y, color, n = 8) {
    if (!this.g.app.save.settings.particles) return;
    let cap = this.g.app.save.settings.quality === "baixa" ? 4 : n;
    for (let i = 0; i < cap; i++) {
      let p = this.pool.get();
      if (!p) return;
      let a = Math.random() * 6.283;
      Object.assign(p, {
        x,
        y,
        vx: Math.cos(a) * Rexx.util.rand(20, 150),
        vy: Math.sin(a) * Rexx.util.rand(20, 150),
        life: Rexx.util.rand(0.2, 0.6),
        max: 0.6,
        color,
        text: null,
        size: Rexx.util.rand(2, 5),
      });
    }
  }
  number(x, y, v, crit) {
    if (
      !this.g.app.save.settings.numbers ||
      this.pool.count > 220 ||
      (Math.random() > 0.45 && !crit)
    )
      return;
    let p = this.pool.get();
    if (p)
      Object.assign(p, {
        x,
        y,
        vx: Rexx.util.rand(-15, 15),
        vy: -45,
        life: 0.65,
        max: 0.65,
        color: v < 0 ? "#ff7789" : crit ? "#ffd176" : "#d1e7e5",
        text: Math.ceil(v).toString(),
        size: crit ? 19 : 12,
      });
  }
  update(dt) {
    this.pool.each((p) => {
      p.life -= dt;
      if (p.life <= 0) this.pool.release(p);
      else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    });
  }
  draw(c) {
    this.pool.each((p) => {
      c.globalAlpha = Math.max(0, p.life / p.max);
      c.fillStyle = p.color;
      if (p.text) {
        c.font = `bold ${p.size}px monospace`;
        c.fillText(p.text, p.x, p.y);
      } else c.fillRect(p.x, p.y, p.size, p.size);
    });
    c.globalAlpha = 1;
  }
};
