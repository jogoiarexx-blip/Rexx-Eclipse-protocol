Rexx.Boss = {
  spawn(g, index, final = false, options = {}) {
    let e = g.enemies.get();
    if (!e) {
      const expendable = g.enemies.items.find((x) => x.active && !x.boss);
      if (expendable) g.enemies.release(expendable);
      e = g.enemies.get();
    }
    if (!e) return null;
    const d = Rexx.data.bosses[index];
    Object.assign(e, {
      x: options.x ?? Rexx.util.clamp(g.player.x + 450, 60, Rexx.C.world - 60),
      y: options.y ?? Rexx.util.clamp(g.player.y - 220, 60, Rexx.C.world - 60),
      r: 54,
      hp:
        d.hp *
        g.difficulty.hp *
        (final ? 1 : 0.32) *
        (1 + g.player.level * 0.012),
      data: d,
      id: d.id,
      speed: 45,
      damage: d.damage * g.difficulty.damage,
      boss: true,
      demon: false,
      escort: !!options.escort,
      tenMinuteMini: false,
      shield: 0,
      elite: true,
      final,
      uid: ++g.uid,
      timer: 2,
      phase: 1,
      attack: 0,
      flash: 0,
      status: {},
      sources: {},
      dot: 0.5,
      vx: 0,
      vy: 0,
      charge: 0,
    });
    if (options.hp !== undefined) e.hp = options.hp;
    e.maxHP = e.hp;
    g.app.save.discoveries[d.id] ??= 0;
    g.camera.event = 4;
    g.alert((final ? "ENTIDADE REGIONAL · " : "MINICHEFE · ") + d.name);
    g.app.audio.mode = "boss";
    g.app.audio.play("boss");
    return e;
  },
  update(g, e, dt) {
    e.phase = e.hp / e.maxHP < 0.3 ? 3 : e.hp / e.maxHP < 0.65 ? 2 : 1;
    let dx = g.player.x - e.x,
      dy = g.player.y - e.y,
      n = Math.hypot(dx, dy) || 1,
      a = Math.atan2(dy, dx);
    if (e.charge > 0) {
      e.charge -= dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    } else {
      e.x += (dx / n) * (35 + e.phase * 13) * dt;
      e.y += (dy / n) * (35 + e.phase * 13) * dt;
    }
    if (n < e.r + 15) g.damage.player(e.damage);
    e.timer -= dt;
    if (e.timer > 0) return;
    e.timer = Math.max(0.8, 2.9 - e.phase * 0.45);
    let pattern = (e.attack++ + e.data.type) % 4,
      count = 10 + e.phase * 5;
    if (pattern === 0) {
      let offset = g.time * 0.6;
      for (let j = 0; j < count; j++)
        g.hostile(
          e.x,
          e.y,
          offset + (j / count) * Math.PI * 2,
          120 + e.phase * 25,
          e.damage,
          6,
        );
    }
    if (pattern === 1) {
      if (e.data.type === 2) {
        for (let j = 0; j < 4; j++)
          g.beam(
            e.x,
            e.y,
            (j * Math.PI) / 2 + g.time * 0.15,
            850,
            24,
            1.1,
            e.damage,
          );
      } else if (e.data.type === 4) {
        g.zone(e.x, e.y, 160, 1, e.damage, true, e.data.color);
        e.x = g.player.x + Math.cos(g.time) * 340;
        e.y = g.player.y + Math.sin(g.time) * 340;
      } else {
        for (let j = -e.phase - 1; j <= e.phase + 1; j++)
          g.hostile(e.x, e.y, a + j * 0.18, 240, e.damage);
        e.vx = (dx / n) * 310;
        e.vy = (dy / n) * 310;
        e.charge = 0.65;
      }
    }
    if (pattern === 2) {
      for (let j = 0; j < e.phase + 2; j++)
        g.zone(
          g.player.x + Rexx.util.rand(-170, 170),
          g.player.y + Rexx.util.rand(-170, 170),
          75 + e.phase * 15,
          1.3,
          e.damage,
          true,
          e.data.color,
        );
    }
    if (pattern === 3) {
      for (let j = 0; j < e.phase * 3; j++)
        Rexx.Enemy.spawn(
          g,
          g.map.enemies[Math.min(g.map.enemies.length - 1, 3 + e.data.type)],
          e.x + Rexx.util.rand(-100, 100),
          e.y + Rexx.util.rand(-100, 100),
        );
      if (e.data.type === 3)
        g.zone(e.x, e.y, 220, 1.8, e.damage, true, e.data.color);
      else
        for (let j = 0; j < 8; j++)
          g.hostile(e.x, e.y, a + j * 0.785, 155, e.damage);
    }
  },
};
