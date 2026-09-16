window.runRexxTests = function () {
  const R = Rexx,
    A = R.app,
    results = [];
  function test(name, fn) {
    try {
      let detail = fn();
      results.push({ name, pass: true, detail });
    } catch (e) {
      results.push({ name, pass: false, error: e.stack });
    }
  }
  function ok(v, msg = "assertion failed") {
    if (!v) throw Error(msg);
  }
  function fresh() {
    A.start("rexx", "zero", "normal");
    const g = A.game;
    g.enemies.clear();
    g.grid.clear();
    g.director.update = () => {};
    g.player.shield = 99999;
    return g;
  }
  function tick(g, n = 120) {
    for (let i = 0; i < n; i++) {
      if (g.state === "level") g.choose(R.Upgrades.options(g)[0]);
      if (g.state === "chest") g.resumeChest();
      g.update(1 / 60);
    }
  }
  test("Content counts", () => {
    ok(R.data.characters.length === 6);
    ok(R.data.weapons.length >= 15);
    ok(R.data.enemies.length >= 20);
    ok(R.data.bosses.length === 5);
    ok(R.data.maps.length === 5);
    ok(R.data.achievements.length >= 30);
    return {
      weapons: R.data.weapons.length,
      achievements: R.data.achievements.length,
    };
  });
  test("Movement, diagonal normalization, boundaries and pause", () => {
    let g = fresh(),
      p = g.player;
    A.input.keys.add("d");
    A.input.keys.add("s");
    let x = p.x,
      y = p.y;
    g.update(1);
    ok(Math.abs(Math.hypot(p.x - x, p.y - y) - p.stats.speed) < 1);
    A.input.keys.clear();
    A.pause();
    let t = g.time;
    g.update(1);
    ok(g.time === t);
    A.pause();
    ok(g.state === "playing");
    p.x = R.C.world;
    A.input.keys.add("d");
    g.update(1);
    A.input.keys.clear();
    ok(p.x <= R.C.world - 35);
  });
  test("Spatial hash and pool reuse", () => {
    let h = new R.SpatialHash(),
      p = new R.Pool(() => ({}), 2),
      a = p.get(),
      b = p.get();
    ok(!p.get());
    p.release(a);
    ok(p.get() === a);
    Object.assign(a, { x: 100, y: 100, r: 10 });
    Object.assign(b, { x: 900, y: 900, r: 10 });
    h.insert(a);
    h.insert(b);
    ok(h.query(100, 100, 20).length === 1);
    h.clear();
    ok(h.query(100, 100, 20).length === 0);
  });
  test("Damage, armor, resistance, invincibility and death", () => {
    let g = fresh(),
      p = g.player;
    p.shield = 0;
    p.stats.armor = 5;
    p.stats.resist = 0.2;
    let hp = p.hp;
    g.damage.player(25);
    ok(Math.abs(p.hp - (hp - 16)) < 0.01);
    g.damage.player(25);
    ok(Math.abs(p.hp - (hp - 16)) < 0.01);
    p.invuln = 0;
    g.damage.player(9999);
    ok(g.state === "ended");
    ok(A.save.stats.losses >= 1);
  });
  test("XP collection, queued levels and all upgrade card actions", () => {
    let g = fresh();
    R.Pickup.spawn(g, g.player.x, g.player.y, "xp", 100);
    tick(g, 1);
    ok(g.player.level > 1);
    ok(g.state === "level");
    let p = g.player.level;
    while (g.state === "level") g.choose(R.Upgrades.options(g)[0]);
    ok(g.player.level === p);
    for (let i = 0; i < 10; i++) {
      let options = R.Upgrades.options(g);
      ok(options.length === 3);
      R.Upgrades.apply(g, options[0]);
    }
    ok(g.player.weapons.length > 0);
  });
  test("Every weapon base and evolution causes damage", () => {
    let scores = [];
    for (const d of R.data.weapons)
      for (const evolved of [false, true]) {
        let g = fresh();
        g.player.weapons = [
          { id: d.id, level: 8, evolved, quality: 1, timer: 0, damage: 0 },
        ];
        for (let j = 0; j < 12; j++) {
          let e = R.Enemy.spawn(
            g,
            2,
            g.player.x + Math.cos((j / 12) * 6.283) * 65,
            g.player.y + Math.sin((j / 12) * 6.283) * 65,
          );
          e.hp = e.maxHP = 100000;
          e.speed = 0;
          g.grid.insert(e);
        }
        tick(g, 360);
        ok(g.stats.damage > 0, d.id + " evolved=" + evolved);
        scores.push(
          d.id + (evolved ? "+" : "") + ":" + Math.round(g.stats.damage),
        );
      }
    return scores;
  });
  test("All 15 evolution recipes require max level and passive", () => {
    for (const d of R.data.weapons) {
      let g = fresh();
      g.player.weapons = [
        { id: d.id, level: 7, evolved: false, quality: 1, timer: 0, damage: 0 },
      ];
      g.player.passives[d.passive] = 1;
      ok(!R.Upgrades.evolve(g));
      g.player.weapons[0].level = 8;
      ok(R.Upgrades.evolve(g)?.id === d.id);
      ok(!R.Upgrades.evolve(g));
    }
  });
  test("Seven statuses and DOT", () => {
    let g = fresh(),
      e = R.Enemy.spawn(g, 2, 3150, 3100);
    e.hp = e.maxHP = 10000;
    for (const status of [
      "burn",
      "shock",
      "freeze",
      "slow",
      "poison",
      "vulnerable",
      "stun",
    ]) {
      g.damage.hit(e, 1, "ghost", status);
      ok(e.status[status] > 0, status);
    }
    let hp = e.hp;
    R.Enemy.update(g, e, 0.6);
    ok(e.hp < hp);
  });
  test("All drops, chest queue and reward UI", () => {
    let g = fresh();
    g.player.hp = 20;
    g.collect({ type: "heal", value: 12 });
    ok(g.player.hp === 32);
    g.collect({ type: "coin", value: 5 });
    ok(g.stats.coins === 5);
    R.Pickup.spawn(g, 3500, 3500, "xp", 5);
    g.collect({ type: "magnet" });
    ok(g.pickups.items[0].magnet);
    g.collect({ type: "energy" });
    ok(g.player.special === 0);
    let e = R.Enemy.spawn(g, 0, 3200, 3100);
    g.collect({ type: "bomb" });
    ok(!e.active);
    g.openChest(3);
    ok(g.state === "chest");
    ok(A.ui.root.textContent.includes("RECOLHER"));
    g.openChest();
    ok(g.chestQueue === 1);
    g.resumeChest();
    ok(g.state === "chest");
    g.resumeChest();
    ok(g.state === "playing");
    g.pendingLevels = 1;
    g.openLevel();
    g.openChest();
    g.choose(R.Upgrades.options(g)[0]);
    g.update(1 / 60);
    ok(g.state === "chest");
  });
  test("Five bosses: attacks, phases, final victory and map unlock", () => {
    for (let i = 0; i < 5; i++) {
      let g = fresh();
      g.map = R.data.maps[i];
      let e = R.Boss.spawn(g, i, true);
      for (const fraction of [1, 0.6, 0.2]) {
        e.hp = e.maxHP * fraction;
        for (let n = 0; n < 5; n++) {
          e.timer = 0;
          R.Boss.update(g, e, 1 / 60);
        }
      }
      ok(e.phase === 3);
      ok(g.projectiles.count + g.zones.count > 0);
      g.damage.hit(e, 1e9, "ghost");
      ok(g.state === "ended");
      ok(A.save.stats.mapWins[g.map.id]);
    }
    ok(A.unlockedMaps().length === 5);
  });
  test("Boss spawns even with pool at capacity", () => {
    let g = fresh();
    for (let i = 0; i < R.C.maxEnemies; i++) R.Enemy.spawn(g, 0, 3000, 3000);
    ok(g.enemies.count === R.C.maxEnemies);
    ok(R.Boss.spawn(g, 0, true));
  });
  test("Wave milestones and environmental mechanisms", () => {
    for (let i = 0; i < 5; i++) {
      let g = fresh();
      g.map = R.data.maps[i];
      g.director = new R.Director(g);
      g.director.environment(3);
      ok(g.zones.count > 0);
      for (let t of [600, 900, 1200, 1800]) {
        g.time = t;
        g.director.update(0.1);
      }
      ok(g.enemies.items.filter((e) => e.active && e.boss).length === 3);
      ok(g.enemies.items.some((e) => e.active && e.final));
    }
  });
  test("Retransmitter objective grants chest and coins", () => {
    let g = fresh(),
      o = g.objectives[0];
    g.player.x = o.x;
    g.player.y = o.y;
    tick(g, 725);
    ok(o.done);
    ok(g.stats.coins >= 80);
  });
  test("Save roundtrip and corrupted JSON fallback", () => {
    A.save.coins = 1234;
    A.save.settings.music = 0.17;
    A.persist();
    let s = R.Save.load();
    ok(s.coins === 1234);
    ok(s.settings.music === 0.17);
    let backup = localStorage.getItem(R.Save.key);
    localStorage.setItem(R.Save.key, "{broken");
    ok(R.Save.load().coins === 0);
    localStorage.setItem(
      R.Save.key,
      JSON.stringify({
        version: 1,
        stats: { kills: "bad" },
        permanent: { hp: 999 },
      }),
    );
    s = R.Save.load();
    ok(s.stats.kills === 0);
    ok(s.permanent.hp === 10);
    localStorage.setItem(R.Save.key, backup);
  });
  test("Menu renderers, settings and restart", () => {
    for (const f of [
      "menu",
      "select",
      "characters",
      "permanent",
      "arsenal",
      "bestiary",
      "achievements",
      "statistics",
      "settings",
    ]) {
      A.ui[f]();
      ok(A.ui.root.textContent.length > 50, f);
    }
    A.start();
    ok(A.game.state === "playing");
    A.pause();
    A.ui.settings(() => A.ui.pause());
    ok(A.game.state === "paused");
    A.ui.pause();
    ok(A.ui.root.textContent.includes("CONTINUAR"));
  });
  test("Stress: 520 enemies, six evolved weapons and bounded pools", () => {
    const g = fresh();
    g.player.weapons = [
      "ghost",
      "orbital",
      "drone",
      "tesla",
      "solar",
      "meteor",
    ].map((id) => ({
      id,
      level: 8,
      evolved: true,
      quality: 1,
      timer: 0,
      damage: 0,
    }));
    for (let i = 0; i < R.C.maxEnemies; i++) {
      const a = i * 0.27,
        r = 130 + (i % 13) * 20,
        e = R.Enemy.spawn(
          g,
          i % 3,
          g.player.x + Math.cos(a) * r,
          g.player.y + Math.sin(a) * r,
        );
      e.hp = e.maxHP = 1e9;
      e.speed = 0;
    }
    let peak = 0;
    for (let frame = 0; frame < 300; frame++) {
      g.update(1 / 60);
      peak = Math.max(peak, g.projectiles.count);
      if (frame % 30 === 0) A.engine.draw(g);
      ok(g.enemies.count <= R.C.maxEnemies);
      ok(g.projectiles.count <= R.C.maxShots);
      ok(g.particles.pool.count <= R.C.maxParticles);
    }
    ok(g.enemies.count === 520);
    ok(g.stats.damage > 0);
    ok(g.state === "playing");
    return { enemies: g.enemies.count, peakProjectiles: peak, frames: 300 };
  });
  return results;
};
