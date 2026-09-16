"use strict";
// Visual-only rendering: no collision, damage or timing changes.
Rexx.CombatFX = {
  projectile(c, p, app) {
    const low = app.save.settings.quality === "baixa";
    const angle = Math.atan2(p.vy, p.vx), r = p.r;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(angle);
    c.lineCap = "round";
    const length = Math.min(p.age * Math.hypot(p.vx, p.vy), p.weapon === "rail" ? 82 : 38);
    c.strokeStyle = p.color;
    if (!low) {
      c.globalAlpha = 0.16;
      c.lineWidth = r * 3;
      c.beginPath(); c.moveTo(-length, 0); c.lineTo(0, 0); c.stroke();
    }
    c.globalAlpha = 0.65;
    c.lineWidth = Math.max(2, r * 0.8);
    c.beginPath(); c.moveTo(-length, 0); c.lineTo(0, 0); c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = p.hostile ? "#ff668a" : p.color;
    c.beginPath();
    if (p.weapon === "frost") {
      c.moveTo(r * 2, 0); c.lineTo(-r, -r); c.lineTo(-r * 0.4, 0); c.lineTo(-r, r);
      c.closePath();
    } else c.ellipse(0, 0, p.hostile ? r : r * 1.6, r, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff5e4";
    c.beginPath(); c.ellipse(r * 0.25, 0, r * 0.7, r * 0.35, 0, 0, Math.PI * 2); c.fill();
    if (p.hostile) {
      c.strokeStyle = "#431324"; c.lineWidth = 1.5;
      c.beginPath(); c.arc(0, 0, r + 2, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
    // Preserve existing rotating WebP blades, with an animated energy rim.
    if (!p.hostile && (p.weapon === "disc" || p.weapon === "boomerang")) {
      c.save(); c.strokeStyle = p.color; c.globalAlpha = 0.55; c.lineWidth = 2;
      c.beginPath(); c.arc(p.x, p.y, r * 1.8, p.age * 10, p.age * 10 + 4.5); c.stroke(); c.restore();
      app.weaponSprites?.projectile(c, p);
    }
  },
  line(c, l, low) {
    const alpha = Math.max(0, l.life / l.max);
    const dx = l.tx - l.x, dy = l.ty - l.y, length = Math.hypot(dx, dy) || 1;
    const lightning = l.width <= 3;
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); c.moveTo(l.x, l.y);
    if (lightning && !low) {
      const steps = Math.min(18, Math.max(3, Math.ceil(length / 22)));
      const tick = Math.floor((l.max - l.life) * 45);
      for (let i = 1; i < steps; i++) {
        const offset = Math.sin(i * 13.7 + tick * 7.3 + l.x) * Math.min(13, length * 0.12);
        c.lineTo(l.x + dx * i / steps - dy / length * offset, l.y + dy * i / steps + dx / length * offset);
      }
    }
    c.lineTo(l.tx, l.ty);
    c.strokeStyle = l.color;
    if (!low) { c.globalAlpha = alpha * 0.18; c.lineWidth = l.width * 3; c.stroke(); }
    c.globalAlpha = alpha * 0.8; c.lineWidth = l.width; c.stroke();
    c.globalAlpha = alpha; c.strokeStyle = "#efffff"; c.lineWidth = Math.max(1, l.width * 0.25); c.stroke();
    c.restore();
  },
  zone(c, z, time, low) {
    if (z.beam || low) return;
    c.save(); c.strokeStyle = z.color; c.lineWidth = 2;
    const progress = z.delay > 0 ? 1 - z.delay / Math.max(0.001, z.maxDelay) : 1;
    if (z.delay > 0 && z.weapon === "meteor") {
      const distance = (1 - progress) * 190;
      c.globalAlpha = 0.7;
      c.beginPath(); c.moveTo(z.x - distance - 35, z.y - distance * 1.8 - 60);
      c.lineTo(z.x - distance, z.y - distance * 1.8); c.lineWidth = 7; c.stroke();
    }
    if (z.pull || z.persist > 0) {
      c.globalAlpha = z.hostile ? 0.65 : 0.32;
      for (let i = 0; i < 3; i++) {
        const a = time * (z.pull ? -2 : 0.8) + i * Math.PI * 2 / 3;
        c.beginPath(); c.arc(z.x, z.y, z.r * 0.72, a, a + 1.2); c.stroke();
      }
    }
    c.restore();
  },
};
