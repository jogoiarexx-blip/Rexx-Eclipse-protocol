"use strict";
Rexx.RelayVisual = {
  draw(c, g, o) {
    const t = g.time, near = Math.hypot(o.x - g.player.x, o.y - g.player.y);
    const charging = !o.done && near < 90 && g.state === "playing";
    const color = o.done ? "#8bf6bd" : g.map.color;
    const progress = Math.min(1, o.progress / 12);
    const low = g.app.save.settings.quality === "baixa";
    c.save(); c.translate(o.x, o.y); c.lineCap = "round";
    // The outer ring matches the actual capture radius.
    c.strokeStyle = color; c.lineWidth = 1;
    c.globalAlpha = o.done ? .1 : charging ? .6 : .22;
    c.beginPath(); c.arc(0, 0, 90, 0, Math.PI * 2); c.stroke();
    if (!low && !o.done) {
      const glow = c.createRadialGradient(0, 0, 8, 0, 0, 88);
      glow.addColorStop(0, color + (charging ? "45" : "20"));
      glow.addColorStop(1, color + "00");
      c.globalAlpha = 1; c.fillStyle = glow;
      c.fillRect(-90, -90, 180, 180);
    }
    c.globalAlpha = 1;
    c.fillStyle = "#02090eb0"; c.beginPath(); c.ellipse(0, 12, 65, 49, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#14232e"; c.strokeStyle = "#527080"; c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      const x = Math.cos(a) * 57, y = Math.sin(a) * 57;
      if (!i) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#08141e"; c.beginPath(); c.arc(0, 0, 43, 0, Math.PI * 2); c.fill();
    // Segmented progress stays legible over busy floor textures.
    for (let i = 0; i < 32; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 32;
      c.strokeStyle = i / 32 < progress ? color : "#30434f";
      c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 66, a, a + .13); c.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 - Math.PI / 2;
      c.save(); c.rotate(a); c.fillStyle = "#263e4c"; c.fillRect(-7, -53, 14, 13);
      c.fillStyle = color; c.globalAlpha = o.done || charging ? 1 : .4;
      c.fillRect(-4, -52, 8, 3); c.restore();
    }
    c.strokeStyle = color; c.lineWidth = 2; c.globalAlpha = .7;
    c.beginPath(); c.arc(0, 0, 32, t * .7, t * .7 + Math.PI * 1.3); c.stroke();
    const bob = o.done ? 0 : Math.sin(t * 2.8) * 3;
    c.translate(0, bob - 5); c.globalAlpha = 1;
    c.fillStyle = o.done ? "#b5ffdb" : "#d6faff"; c.strokeStyle = color;
    c.beginPath(); c.moveTo(0, -22); c.lineTo(15, 0); c.lineTo(0, 22); c.lineTo(-15, 0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = color; c.beginPath(); c.moveTo(0, -22); c.lineTo(15, 0); c.lineTo(0, 22); c.closePath(); c.fill();
    c.translate(0, 5 - bob);
    if (charging && !low && g.app.save.settings.particles) {
      for (let i = 0; i < 8; i++) {
        const phase = (t * .65 + i / 8) % 1, a = i * 2.4;
        const r = 76 * (1 - phase);
        c.globalAlpha = Math.sin(phase * Math.PI); c.fillStyle = color;
        c.fillRect(Math.cos(a) * r - 1, Math.sin(a) * r - 1, 3, 3);
      }
    }
    const since = o.doneAt == null ? 10 : t - o.doneAt;
    if (o.done && since < 1.4) {
      c.globalAlpha = Math.max(0, 1 - since / 1.4); c.strokeStyle = color; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, 65 + since * 65, 0, Math.PI * 2); c.stroke();
    }
    c.globalAlpha = 1; c.textAlign = "center";
    if (near < 190) {
      c.fillStyle = "#06111de8"; c.fillRect(-110, 101, 220, 43);
      c.font = "bold 11px sans-serif"; c.fillStyle = color;
      c.fillText(o.done ? "RETRANSMISSOR RESTAURADO" : charging ? "SINCRONIZANDO ECLIPSE CORE" : "RETRANSMISSOR", 0, 118);
      c.font = "11px sans-serif"; c.fillStyle = "#d6e5ee";
      c.fillText(o.done ? "RECOMPENSA LIBERADA" : charging ? `${Math.floor(progress * 100)}% · ${Math.max(0, 12 - o.progress).toFixed(1)}s` : "ENTRE NO ANEL PARA ATIVAR", 0, 135);
    }
    c.restore();
  },
};
