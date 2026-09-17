// Sprite animation with procedural fallback if the atlas cannot load.
Rexx.Demon = {
  spawn(g) {
    if (g.difficulty.id !== "easy" || !g.bossFinalDefeated) return null;
    let e = g.enemies.get();
    if (!e) {
      const expendable = g.enemies.items.find((x) => x.active && !x.boss);
      if (expendable) g.enemies.release(expendable);
      e = g.enemies.get();
    }
    if (!e) return null;
    const cfg = Rexx.DEMON_CONFIG,
      p = g.player;
    const direction = p.x > Rexx.C.world / 2 ? -1 : 1;
    Object.assign(e, {
      id: cfg.id,
      data: {
        id: cfg.id,
        name: "Caçador da Fenda",
        color: "#ff4768",
        type: "demon",
        xp: 0,
      },
      x: Rexx.util.clamp(p.x + direction * 330, 60, Rexx.C.world - 60),
      y: p.y,
      r: 33,
      hp: cfg.hp,
      maxHP: cfg.hp,
      damage: cfg.damage,
      speed: (p.character.stats.speed || 220) * cfg.speedMultiplier,
      boss: true,
      demon: true,
      elite: true,
      final: false,
      escort: false,
      tenMinuteMini: false,
      phase: 1,
      uid: ++g.uid,
      status: {},
      sources: {},
      shield: 0,
      flash: 0,
      age: 0,
      vx: 0,
      vy: 0,
      attackTimer: 0,
      attackPose: 0,
      grace: cfg.spawnGrace,
      hitLock: 0,
      anim: "idle",
      animTime: 0,
      runTime: 0,
      facing: direction > 0 ? -1 : 1,
    });
    return e;
  },
  update(g, e, dt) {
    const previousAnim = e.anim;
    e.age += dt;
    e.animTime += dt;
    e.flash = Math.max(0, e.flash - dt);
    e.grace = Math.max(0, e.grace - dt);
    e.hitLock = Math.max(0, e.hitLock - dt);
    e.attackTimer = Math.max(0, e.attackTimer - dt);
    e.attackPose = Math.max(0, e.attackPose - dt);
    const dx = g.player.x - e.x,
      dy = g.player.y - e.y,
      n = Math.hypot(dx, dy) || 1;
    if (Math.abs(dx) > 0.5) e.facing = dx < 0 ? -1 : 1;
    const travel = Math.min(
      e.speed * dt,
      Math.max(0, n - e.r - g.player.r + 3),
    );
    e.vx = (dx / n) * e.speed;
    e.vy = (dy / n) * e.speed;
    e.x += (dx / n) * travel;
    e.y += (dy / n) * travel;
    if (travel > 0.001) e.runTime = (e.runTime || 0) + dt;
    e.anim = e.attackPose > 0 ? "attack" : e.flash > 0 ? "hurt" : travel > 0.001 ? "run" : "idle";
    if (n <= e.r + g.player.r + 5 && e.attackTimer <= 0 && e.grace <= 0) {
      e.attackTimer = Rexx.DEMON_CONFIG.attackCooldown;
      e.attackPose = 0.3;
      e.anim = "attack";
      g.damage.player(e.damage, { source: e, trueDamage: true });
    }
    if (e.anim !== previousAnim) e.animTime = 0;
  },
  draw(c, e, time, mode = e.anim) {
    if (Rexx.app?.demonSprites?.draw(c, e, time, mode)) return;
    const run = mode === "run",
      laugh = mode === "laugh",
      dead = mode === "death";
    const bob = laugh
      ? Math.sin(time * 19) * 4
      : run
        ? Math.abs(Math.sin(time * 15)) * 4
        : Math.sin(time * 3) * 1.2;
    c.save();
    c.translate(e.x, e.y - bob);
    c.scale(e.facing || 1, 1);
    if (laugh) {
      c.rotate(Math.sin(time * 11) * 0.1);
      c.scale(1 + Math.sin(time * 15) * 0.035, 1 - Math.sin(time * 15) * 0.025);
    }
    if (mode === "attack") c.rotate(-0.22);
    if (dead) {
      const progress = Math.min(1, time / Rexx.ENCOUNTERS.victoryScene);
      c.rotate(progress * 1.5);
      c.globalAlpha = 1 - progress;
      c.scale(1, 1 - progress * 0.6);
    }
    c.strokeStyle = "#ff526e";
    c.lineWidth = 2;
    c.fillStyle = mode === "hurt" ? "#ffe2de" : "#39152b";
    // Split wings and shoulder spines frame the body.
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(side * 17, -24);
      c.lineTo(side * 54, -45);
      c.lineTo(side * 47, 0);
      c.lineTo(side * 30, 13);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-23, -28);
    c.lineTo(22, -28);
    c.lineTo(28, 12);
    c.lineTo(0, 30);
    c.lineTo(-27, 12);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#160d1c";
    c.beginPath();
    c.ellipse(0, -35, 19, 20, 0, 0, 7);
    c.fill();
    c.stroke();
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(side * 10, -47);
      c.lineTo(side * 26, -69);
      c.lineTo(side * 20, -39);
      c.closePath();
      c.fillStyle = "#b95868";
      c.fill();
      const step = run ? Math.sin(time * 15 + side) * 7 : 0;
      c.fillStyle = "#241126";
      c.fillRect(side * 10 - 6, 22 + step, 12, 24);
      c.strokeRect(side * 10 - 6, 22 + step, 12, 24);
      c.strokeStyle = "#ed9caa";
      c.beginPath();
      c.moveTo(side * 23, -8);
      c.lineTo(side * (mode === "attack" ? 48 : 35), 22);
      c.lineTo(side * 27, 29);
      c.stroke();
    }
    c.fillStyle = "#ffdf8e";
    c.fillRect(-13, -39, 9, 4);
    c.fillRect(5, -39, 9, 4);
    c.fillStyle = "#ff3759";
    c.beginPath();
    c.moveTo(0, -17);
    c.lineTo(8, 0);
    c.lineTo(0, 12);
    c.lineTo(-8, 0);
    c.fill();
    c.strokeStyle = "#ffc9ce";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-9, -25);
    c.quadraticCurveTo(0, laugh ? -10 : -20, 10, -25);
    c.stroke();
    c.restore();
  },
};
