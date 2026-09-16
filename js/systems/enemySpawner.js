Rexx.Director = class {
  constructor(g) {
    this.g = g;
    this.spawn = 0;
    this.event = 18;
    this.elite = 75;
    this.hazard = 14;
    this.fired = new Set();
  }
  update(dt) {
    if (this.g.bossFinalDefeated) return;
    const g = this.g,
      t = g.time;
    this.spawn -= dt;
    this.event -= dt;
    this.elite -= dt;
    this.hazard -= dt;
    const chapter = Math.floor(t / 300),
      pool = g.map.enemies.slice(
        0,
        Math.min(g.map.enemies.length, 3 + chapter * 2),
      );
    if (this.spawn <= 0) {
      this.spawn = Math.max(0.13, 0.85 - t / 2600) / g.difficulty.count;
      const cap = Math.min(Rexx.C.maxEnemies - 30, 65 + chapter * 65);
      for (let i = 0; i < 1 + Math.floor(chapter / 2); i++)
        if (g.enemies.count < cap) this.around(Rexx.util.pick(pool));
    }
    if (this.event <= 0) {
      this.event = Rexx.util.rand(26, 42);
      const formation = Math.floor(t / 30) % 3,
        n = 12 + chapter * 5,
        a = Math.random() * 6.28;
      g.alert(
        ["CERCO DIMENSIONAL", "COLUNA CORROMPIDA", "INVASÃO DE FENDA"][
          formation
        ],
        2,
      );
      for (let i = 0; i < n; i++) {
        const angle =
          formation === 0 ? (i / n) * 6.283 : a + (i - n / 2) * 0.035;
        this.around(
          Rexx.util.pick(pool),
          false,
          angle,
          formation === 2 ? 700 + i * 7 : 730,
        );
      }
    }
    if (this.elite <= 0) {
      this.elite = Math.max(35, 85 - chapter * 7);
      this.around(Rexx.util.pick(pool), true);
      g.alert("ASSINATURA ELITE DETECTADA", 2);
    }
    if (this.hazard <= 0) {
      this.hazard = Math.max(6, 18 - chapter);
      this.environment(chapter);
    }
    if (t >= Rexx.ENCOUNTERS.miniAt && !this.fired.has(600)) {
      this.fired.add(600);
      this.mini = Rexx.Boss.spawn(g, g.map.boss, false);
      if (this.mini) {
        this.mini.tenMinuteMini = true;
        this.miniHP = this.mini.maxHP;
      }
    }
    if (t >= Rexx.ENCOUNTERS.finalAt && !this.fired.has(900)) {
      this.fired.add(900);
      // Retire the earlier encounter without loot so the finale has exactly three bosses.
      g.enemies.each((e) => {
        if (e.tenMinuteMini) g.enemies.release(e);
      });
      const cx = Rexx.util.clamp(g.player.x, 500, Rexx.C.world - 500);
      const cy = Rexx.util.clamp(g.player.y, 500, Rexx.C.world - 500);
      for (let i = 0; i < 1 + Rexx.ENCOUNTERS.escortCount; i++) {
        const angle = (i * Math.PI * 2) / (1 + Rexx.ENCOUNTERS.escortCount);
        Rexx.Boss.spawn(g, g.map.boss, i === 0, {
          escort: i > 0,
          hp: i > 0 ? this.miniHP : undefined,
          x: cx + Math.cos(angle) * 400,
          y: cy + Math.sin(angle) * 400,
        });
      }
      g.alert("BATALHA FINAL · ENTIDADE + 2 MINICHEFES", 5);
    }
  }

  environment(chapter) {
    const g = this.g,
      p = g.player,
      x = p.x + Rexx.util.rand(-170, 170),
      y = p.y + Rexx.util.rand(-170, 170),
      damage = 12 + chapter * 4;
    switch (g.map.boss) {
      case 0:
        g.zone(x, y, 90, 1.8, damage, true, g.map.color);
        break;
      case 1:
        for (let j = 0; j < 4; j++)
          g.zone(
            x + j * 55,
            y + j * 25,
            48,
            1 + j * 0.25,
            damage,
            true,
            g.map.color,
          );
        break;
      case 2:
        g.beam(x - 250, y, 0, 600, 20, 2, damage);
        g.beam(x, y - 250, Math.PI / 2, 600, 20, 2, damage);
        break;
      case 3:
        g.zone(x, y, 110, 1.8, damage, true, g.map.color, null, 5);
        break;
      case 4:
        const z = g.zone(x, y, 155, 2.5, damage, true, g.map.color);
        if (z) z.playerPull = true;
        break;
    }
  }
  around(index, elite = false, a = Math.random() * 6.283, r = 780) {
    return Rexx.Enemy.spawn(
      this.g,
      index,
      Rexx.util.clamp(this.g.player.x + Math.cos(a) * r, 10, Rexx.C.world - 10),
      Rexx.util.clamp(this.g.player.y + Math.sin(a) * r, 10, Rexx.C.world - 10),
      elite,
    );
  }
};
