Rexx.Engine = class {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = canvas;
    this.c = canvas.getContext("2d", { alpha: false });
    this.w = innerWidth;
    this.h = innerHeight;
    this.last = 0;
    this.fps = 60;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame((t) => this.frame(t));
  }
  resize() {
    this.w = innerWidth;
    this.h = innerHeight;
    let d = Math.min(
      devicePixelRatio || 1,
      this.app.save.settings.quality === "alta" ? 1.5 : 1,
    );
    this.canvas.width = Math.floor(this.w * d);
    this.canvas.height = Math.floor(this.h * d);
    this.dpr = d;
  }
  frame(t) {
    let dt = Math.min(0.05, (t - this.last) / 1000 || 0.016);
    this.last = t;
    this.fps += (1 / Math.max(0.001, dt) - this.fps) * 0.03;
    const g = this.app.game;
    if (g) {
      let remaining = dt;
      while (remaining > 0) {
        const step = Math.min(1 / 60, remaining);
        g.update(step);
        remaining -= step;
      }
      this.draw(g);
      this.app.ui.hud(g);
    } else this.menu(t / 1000);
    this.app.audio.update();
    requestAnimationFrame((t) => this.frame(t));
  }
  base() {
    this.c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.c.globalAlpha = 1;
  }
  menu(t) {
    this.base();
    const c = this.c,
      w = this.w,
      h = this.h;
    c.fillStyle = "#070f17";
    c.fillRect(0, 0, w, h);
    let cx = w * 0.72,
      cy = h * 0.47,
      r = Math.min(w * 0.23, h * 0.38);
    let grad = c.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.6);
    grad.addColorStop(0, "#112627");
    grad.addColorStop(0.55, "#153d3b");
    grad.addColorStop(1, "#070f17");
    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
    c.save();
    c.translate(cx, cy);
    c.rotate(-0.2);
    c.strokeStyle = "#79e4c3";
    c.lineWidth = 2;
    for (let j = 0; j < 3; j++) {
      c.globalAlpha = 0.35 - j * 0.09;
      c.beginPath();
      c.ellipse(
        0,
        0,
        r * (1 + j * 0.13),
        r * (1 + j * 0.13),
        0,
        0.3 + t * 0.03 + j,
        5.8 + t * 0.03 + j,
      );
      c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = "#050b11";
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    c.shadowColor = "#89ffd9";
    c.shadowBlur = 25;
    c.strokeStyle = "#a9ffe1";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, r, 3.6, 6.4);
    c.stroke();
    c.shadowBlur = 0;
    c.restore();
    for (let i = 0; i < 60; i++) {
      let x = (i * 193.71) % w,
        y = (i * 83.17 + t * (3 + (i % 5))) % h;
      c.fillStyle = i % 5 === 0 ? "#527c7d" : "#243c46";
      c.fillRect(x, y, 2, 2);
    }
    c.strokeStyle = "#1c333b";
    for (let y = h * 0.8; y < h; y += 30) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
  }
  draw(g) {
    this.base();
    let c = this.c,
      w = this.w,
      h = this.h;
    c.fillStyle = g.map.bg;
    c.fillRect(0, 0, w, h);
    c.save();
    g.camera.apply(c, w, h);
    const cam = g.camera,
      left = cam.x - w / 2 - 150,
      top = cam.y - h / 2 - 150,
      right = cam.x + w / 2 + 150,
      bottom = cam.y + h / 2 + 150;
    c.strokeStyle = g.map.detail;
    c.lineWidth = 1;
    const cell = 140;
    if (!this.app.ground?.draw(c, g.map, left, top, right, bottom)) {
      for (let x = Math.floor(left / cell) * cell; x < right; x += cell)
        for (let y = Math.floor(top / cell) * cell; y < bottom; y += cell)
          this.tile(c, g, x, y, cell);
    }
    this.app.scenery?.draw(c, g, left, top, right, bottom);
    c.strokeStyle = g.map.color;
    c.globalAlpha = 0.5;
    c.strokeRect(0, 0, Rexx.C.world, Rexx.C.world);
    c.globalAlpha = 1;
    for (const o of g.objectives) {
      c.strokeStyle = o.done ? "#789591" : g.map.color;
      c.fillStyle = "#101e28";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(o.x, o.y, 35, 0, 7);
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(o.x, o.y, 44, -1.57, -1.57 + (o.progress / 12) * 6.283);
      c.stroke();
      c.font = "19px monospace";
      c.fillStyle = g.map.color;
      c.textAlign = "center";
      c.fillText(o.done ? "✓" : "⌘", o.x, o.y + 6);
      if (Rexx.util.dist(o, g.player) < 160) {
        c.font = "11px monospace";
        c.fillText(
          o.done
            ? "RESTAURADO"
            : "PERMANEÇA PRÓXIMO · " +
                Math.floor((o.progress / 12) * 100) +
                "%",
          o.x,
          o.y + 65,
        );
      }
    }
    g.zones.each((z) => {
      if (z.x + z.r < left || z.x - z.r > right) return;
      const warn = z.delay > 0;
      c.save();
      c.strokeStyle = z.color;
      c.fillStyle = z.color;
      c.lineWidth = warn ? 2 : 4;
      c.globalAlpha = warn ? 0.22 : 0.17;
      if (z.beam) {
        c.translate(z.x, z.y);
        c.rotate(z.a);
        c.fillRect(0, -z.width, z.len, z.width * 2);
        c.globalAlpha = 0.8;
        c.strokeRect(0, -z.width, z.len, z.width * 2);
      } else {
        c.beginPath();
        c.arc(z.x, z.y, z.r, 0, 7);
        c.fill();
        c.globalAlpha = warn ? 0.65 : 0.5;
        if (warn) c.setLineDash([8, 7]);
        c.stroke();
        if (warn) {
          c.setLineDash([]);
          c.beginPath();
          c.arc(z.x, z.y, z.r * Math.max(0.02, 1 - z.delay / z.maxDelay), 0, 7);
          c.stroke();
        }
        if (z.mine) {
          c.font = "24px monospace";
          c.fillText("✥", z.x, z.y);
        }
      }
      c.restore();
    });
    g.pickups.each((p) => {
      if (p.x < left || p.x > right || p.y < top || p.y > bottom) return;
      if (this.app.pickupSprites?.draw(c, p)) return;
      let colors = {
        xp:
          p.value >= 40
            ? "#ffa8f8"
            : p.value >= 10
              ? "#bda1ff"
              : p.value >= 5
                ? "#75aaff"
                : "#78e9d2",
        heal: "#ff8594",
        coin: "#ffd68a",
        magnet: "#8db8ff",
        bomb: "#ff985d",
        chest: "#ffe0a5",
        energy: "#ecb4ff",
      };
      c.fillStyle = colors[p.type];
      if (p.type === "xp") {
        let r = p.value >= 10 ? 6 : 4;
        c.beginPath();
        c.moveTo(p.x, p.y - r);
        c.lineTo(p.x + r, p.y);
        c.lineTo(p.x, p.y + r);
        c.lineTo(p.x - r, p.y);
        c.fill();
      } else {
        c.font =
          p.type === "chest" ? "bold 25px monospace" : "bold 17px monospace";
        c.textAlign = "center";
        c.fillText(
          {
            heal: "✚",
            coin: "●",
            magnet: "⊕",
            bomb: "✹",
            chest: "▣",
            energy: "ϟ",
          }[p.type],
          p.x,
          p.y + 5,
        );
      }
    });
    g.enemies.each((e) => {
      if (e.x < left || e.x > right || e.y < top || e.y > bottom) return;
      this.entity(c, e, g.time);
    });
    g.projectiles.each((p) => {
      if (this.app.weaponSprites?.projectile(c, p)) return;
      c.fillStyle = p.color;
      c.strokeStyle = p.color;
      c.lineWidth = p.r;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
      c.stroke();
      c.beginPath();
      c.arc(p.x, p.y, p.r, 0, 7);
      c.fill();
    });
    this.player(c, g);
    g.lines.each((l) => {
      c.globalAlpha = l.life / l.max;
      c.strokeStyle = l.color;
      c.lineWidth = l.width;
      c.beginPath();
      c.moveTo(l.x, l.y);
      c.lineTo(l.tx, l.ty);
      c.stroke();
    });
    c.globalAlpha = 1;
    g.particles.draw(c);
    g.finale?.drawWorld(c);
    c.restore();
    if (g.hurt > 0) {
      c.fillStyle = `rgba(255,60,85,${g.hurt * 0.5})`;
      c.fillRect(0, 0, w, h);
    }
    if (g.player.hp / g.player.stats.hp < 0.25) {
      let v = c.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.25,
        w / 2,
        h / 2,
        w * 0.65,
      );
      v.addColorStop(0, "transparent");
      v.addColorStop(1, "#a21b4855");
      c.fillStyle = v;
      c.fillRect(0, 0, w, h);
    }
    this.minimap(c, g);
    if (g.alertLife > 0) {
      c.textAlign = "center";
      c.font = "bold 14px monospace";
      c.fillStyle = "#0b1728dd";
      c.fillRect(w / 2 - 300, 115, 600, 42);
      c.fillStyle = g.map.color;
      c.fillText(g.alertText, w / 2, 141);
    }
    if (g.time >= Rexx.ENCOUNTERS.finalAt && !g.bossFinalDefeated) {
      c.font = "12px monospace";
      c.fillStyle = "#ff9fad";
      c.textAlign = "center";
      c.fillText("DESTRUA A ENTIDADE PARA CONCLUIR A EXTRAÇÃO", w / 2, h - 90);
    }
    g.finale?.drawScreen(c, w, h);
  }
  tile(c, g, x, y, s) {
    let seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    c.globalAlpha = 0.38;
    c.strokeStyle = g.map.detail;
    c.strokeRect(x, y, s, s);
    c.globalAlpha = 1;
    if (seed < 0.44) return;
    let px = x + 25 + seed * 45,
      py = y + 30 + seed * 30;
    c.fillStyle = g.map.detail;
    c.strokeStyle = g.map.detail;
    if (g.map.boss === 0) {
      c.fillRect(px, py, 15 + seed * 40, 45);
      c.fillStyle = "#203b41";
      c.fillRect(px + 5, py + 4, 4, 12);
    }
    if (g.map.boss === 1) {
      c.beginPath();
      c.moveTo(px, py - 15);
      c.lineTo(px + 18, py + 20);
      c.lineTo(px - 12, py + 30);
      c.closePath();
      c.fill();
    }
    if (g.map.boss === 2) {
      c.strokeRect(px, py, 45, 40);
      c.fillRect(px + 10, py + 6, 25, 25);
      c.fillStyle = g.map.color;
      c.globalAlpha = 0.15;
      c.fillRect(px + 14, py + 10, 3, 14);
      c.globalAlpha = 1;
    }
    if (g.map.boss === 3) {
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(px, py + 40);
      c.lineTo(px + 10, py);
      c.lineTo(px + 25, py - 15);
      c.moveTo(px + 10, py + 10);
      c.lineTo(px - 15, py - 4);
      c.stroke();
      c.lineWidth = 1;
    }
    if (g.map.boss === 4) {
      c.beginPath();
      c.ellipse(px, py, 25, 10, seed * 5, 0, 7);
      c.stroke();
    }
  }
  entity(c, e, t) {
    if (e.demon) {
      const f = this.app.game.finale;
      Rexx.Demon.draw(
        c,
        e,
        f.phase.startsWith("death") ? f.timer : t,
        f.phase.startsWith("death") ? "laugh" : e.anim,
      );
      return;
    }
    if (this.app.enemySprites?.draw(c, e, t, this.app.game?.map.id || "zero"))
      return;
    c.save();
    c.translate(e.x, e.y);
    let color =
      e.flash > 0
        ? "#fff"
        : e.status.freeze
          ? "#c7f8ff"
          : e.status.poison
            ? "#d2ff89"
            : e.data.color;
    c.fillStyle = color;
    c.strokeStyle = color;
    if (e.elite) {
      c.globalAlpha = 0.25;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, e.r + 6 + Math.sin(t * 4) * 3, 0, 7);
      c.stroke();
      c.globalAlpha = 1;
    }
    if (e.boss) {
      c.rotate(t * 0.3);
      let points = 5 + e.data.type;
      c.lineWidth = 4;
      c.beginPath();
      for (let i = 0; i < points * 2; i++) {
        let a = (i / (points * 2)) * 6.283,
          r = i % 2 ? e.r * 0.58 : e.r;
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      c.closePath();
      c.fillStyle = "#152733";
      c.fill();
      c.stroke();
      c.rotate(-t * 0.3);
      c.fillStyle = color;
      c.beginPath();
      c.arc(0, 0, e.r * 0.28, 0, 7);
      c.fill();
      c.fillStyle = "#07121b";
      c.fillRect(-8, -5, 16, 10);
    } else {
      let type = e.data.type;
      c.rotate(
        type === "fly"
          ? Math.sin(t * 5 + e.uid) * 0.3
          : Math.atan2(e.vy || 1, e.vx || 0),
      );
      if (["tank", "shield", "shooter", "charge"].includes(type)) {
        c.fillStyle = "#172632";
        c.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
        c.lineWidth = 2;
        c.strokeRect(-e.r, -e.r, e.r * 2, e.r * 2);
        c.fillStyle = color;
        c.fillRect(-e.r * 0.5, -3, e.r, 6);
      } else {
        c.beginPath();
        let n = type === "fly" ? 3 : type === "summon" ? 6 : 5;
        for (let i = 0; i < n; i++) {
          let a = (i / n) * 6.283;
          c.lineTo(Math.cos(a) * e.r, Math.sin(a) * e.r);
        }
        c.closePath();
        c.fill();
        c.fillStyle = "#10202b";
        c.fillRect(-4, -4, 8, 8);
      }
      if (e.shield > 0) {
        c.strokeStyle = "#86d0ff";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(0, 0, e.r + 4, -1.7, 1.7);
        c.stroke();
      }
    }
    c.restore();
    if (e.elite && !e.boss) {
      c.fillStyle = "#111e28";
      c.fillRect(e.x - 23, e.y - e.r - 14, 46, 4);
      c.fillStyle = color;
      c.fillRect(e.x - 23, e.y - e.r - 14, 46 * Math.max(0, e.hp / e.maxHP), 4);
    }
  }
  player(c, g) {
    const p = g.player,
      t = g.time;
    c.save();
    c.translate(p.x, p.y);
    if (g.specialDeath) {
      const fall = Math.min(1, g.finale.timer / 0.45);
      c.rotate((fall * Math.PI) / 2);
      c.scale(1, 1 - fall * 0.3);
    }
    c.fillStyle = "#0006";
    c.beginPath();
    c.ellipse(0, 15, 20, 7, 0, 0, 7);
    c.fill();
    if (!g.specialDeath && p.invuln > 0 && Math.floor(t * 20) % 2)
      c.globalAlpha = 0.4;
    if (!g.app.sprites?.drawAgent(c, p)) {
      c.strokeStyle = p.character.color;
      c.fillStyle = "#223c47";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, -21);
      c.lineTo(15, -4);
      c.lineTo(12, 15);
      c.lineTo(-12, 15);
      c.lineTo(-15, -4);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = p.character.color;
      if (p.character.id === "brakk") {
        c.fillRect(-22, -4, 8, 18);
        c.fillRect(14, -4, 8, 18);
      } else if (p.character.id === "nyra") {
        c.strokeRect(-23, -15, 8, 8);
        c.strokeRect(15, -15, 8, 8);
      } else if (p.character.id === "suri") {
        c.beginPath();
        c.moveTo(-10, 8);
        c.lineTo(-22, 28);
        c.lineTo(3, 16);
        c.fill();
      } else if (p.character.id === "ilya") {
        c.beginPath();
        c.arc(0, -5, 27, 3.5, 5.9);
        c.stroke();
      } else if (p.character.id === "null") {
        c.beginPath();
        c.arc(0, 0, 27, 0, 7);
        c.stroke();
      }
      c.fillRect(-8, -12, 16, 5);
      c.fillRect(-4, 1, 8, 8);
      c.strokeStyle = "#e9fff4";
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(p.angle || 0) * 23, Math.sin(p.angle || 0) * 23);
      c.stroke();
    }
    if (p.shield > 0 || p.dash > 0) {
      c.strokeStyle = p.character.color;
      c.beginPath();
      c.arc(0, 0, 30, 0, 7);
      c.stroke();
    }
    c.restore();
    if (g.specialDeath) return;
    for (const w of p.weapons) {
      let d = Rexx.data.weapons.find((a) => a.id === w.id);
      c.strokeStyle = d.color;
      c.fillStyle = d.color;
      if (d.type === "orbit") {
        let count = 2 + Math.floor((w.level - 1) / 2) + p.stats.amount;
        for (let j = 0; j < count; j++) {
          let a = t * 2.8 + (j / count) * 6.283,
            r = 85 * p.stats.area * (1 + w.level * 0.04);
          c.save();
          c.translate(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
          c.rotate(a);
          if (!this.app.weaponSprites?.draw(c, "orbital", 0, 0, 36))
            c.fillRect(-13, -3, 26, 6);
          c.restore();
        }
      }
      if (d.type === "aura") {
        c.globalAlpha = 0.12;
        c.beginPath();
        c.arc(p.x, p.y, 95 * p.stats.area * (1 + w.level * 0.04), 0, 7);
        c.fill();
        c.globalAlpha = 0.45;
        c.stroke();
        c.globalAlpha = 1;
      }
      if (d.type === "drone") {
        for (let j = 0; j < (w.evolved ? 3 : 1); j++) {
          let a = t + j * 2.09,
            x = p.x + Math.cos(a) * 65,
            y = p.y + Math.sin(a) * 65;
          if (!this.app.weaponSprites?.draw(c, "drone", x, y, 36)) {
            c.fillRect(x - 8, y - 5, 16, 10);
            c.strokeRect(x - 13, y - 8, 26, 16);
          }
        }
      }
    }
  }
  minimap(c, g) {
    const size = 132,
      x = this.w - size - 22,
      y = this.h - size - 35,
      scale = size / Rexx.C.world;
    c.fillStyle = "#08131dea";
    c.fillRect(x, y, size, size);
    c.strokeStyle = "#35515d";
    c.strokeRect(x, y, size, size);
    const dot = (p, color, r) => {
      c.fillStyle = color;
      c.beginPath();
      c.arc(x + p.x * scale, y + p.y * scale, r, 0, 7);
      c.fill();
    };
    for (const o of g.objectives) if (!o.done) dot(o, "#84c7ff", 3);
    g.pickups.each((p) => {
      if (p.type === "chest") dot(p, "#ffd590", 3);
    });
    g.enemies.each((e) => {
      if (e.boss) dot(e, "#ff7997", 4);
    });
    dot(g.player, "#b1ffe0", 3);
    c.font = "10px monospace";
    c.textAlign = "left";
    c.fillStyle = "#6e909b";
    c.fillText("RADAR · " + Math.round(this.fps) + " FPS", x, y + size + 15);
  }
};
