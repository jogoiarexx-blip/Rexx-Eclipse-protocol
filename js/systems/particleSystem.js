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
        kind: "spark",
        size: Rexx.util.rand(2, 5),
      });
    }
  }
  flash(x, y, color, size = 18, kind = "ring") {
    if (!this.g.app.save.settings.particles || this.pool.count > 260) return;
    const p = this.pool.get();
    if (!p) return;
    Object.assign(p, { x, y, vx: 0, vy: 0, color, size, kind, text: null,
      life: kind === "muzzle" ? 0.09 : 0.3, max: kind === "muzzle" ? 0.09 : 0.3 });
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
        kind: "number",
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
      } else if (p.kind === "ring" || p.kind === "muzzle") {
        const t = 1 - p.life / p.max;
        c.strokeStyle = p.color;
        c.lineWidth = p.kind === "muzzle" ? 3 : 2 * (1 - t) + 0.5;
        c.beginPath(); c.arc(p.x, p.y, Math.max(1, p.size * (0.2 + t * 0.8)), 0, Math.PI * 2); c.stroke();
      } else {
        c.strokeStyle = p.color; c.lineWidth = Math.max(1, p.size * p.life / p.max);
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); c.stroke();
      }
    });
    c.globalAlpha = 1;
  }
};
