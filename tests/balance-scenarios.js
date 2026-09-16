window.runBalanceTests = function () {
  const R = Rexx,
    A = R.app,
    results = [],
    saved = A.save;
  const raw = localStorage.getItem(R.Save.key);
  localStorage.removeItem(R.Save.key);
  const blank = R.Save.load();
  function ok(v, message = "assertion failed") {
    if (!v) throw Error(message);
  }
  function test(name, fn) {
    try {
      fn();
      results.push({ name, pass: true });
    } catch (e) {
      results.push({ name, pass: false, error: e.stack });
    }
  }
  function fresh(id = "easy", map = "zero") {
    A.save = JSON.parse(JSON.stringify(blank));
    A.save.stats.wins = 20;
    A.save.stats.kills = 20000;
    A.save.stats.bestTime = 900;
    A.save.stats.bosses = 10;
    for (const m of R.data.maps) A.save.stats.mapWins[m.id] = 1;
    A.save.coins = 500;
    A.start("rexx", map, id);
    const g = A.game;
    g.enemies.clear();
    g.grid.clear();
    g.projectiles.clear();
    g.zones.clear();
    g.pickups.clear();
    g.player.special = 1e6;
    g.director.spawn =
      g.director.event =
      g.director.elite =
      g.director.hazard =
        1e6;
    return g;
  }
  function defeatFinal(g) {
    const b = R.Boss.spawn(g, g.map.boss, true);
    g.damage.hit(b, 1e9, "ghost");
    return b;
  }
  function hunt() {
    const g = fresh();
    defeatFinal(g);
    g.update(2.49);
    ok(g.finale.phase === "portal");
    g.update(0.02);
    ok(g.finale.phase === "hunt");
    return g;
  }
  test("Easy keeps former Normal stats; central IDs and retained Eclipse", () => {
    const d = R.DIFFICULTIES.easy;
    for (const k of ["hp", "damage", "speed", "count", "xp"]) ok(d[k] === 1, k);
    for (const id of ["easy", "normal", "hard", "nightmare", "eclipse"])
      ok(R.DIFFICULTIES[id].id === id);
    ok(d.permanentCurrencyMultiplier === 0 && d.specialDemon);
    ok(R.C.duration === 900);
  });
  test("10:00 mini; 15:00 exactly final + two matching escorts; no repeated milestones", () => {
    for (const map of R.data.maps) {
      const g = fresh("easy", map.id);
      g.time = 599.99;
      g.director.update(0);
      ok(g.enemies.count === 0);
      g.time = 600;
      g.director.update(0);
      let bosses = g.enemies.items.filter((e) => e.active && e.boss);
      ok(bosses.length === 1 && !bosses[0].final);
      const hp = bosses[0].maxHP,
        id = bosses[0].id;
      g.time = 899.99;
      g.director.update(0);
      ok(g.enemies.count === 1);
      g.player.level = 30;
      g.time = 900;
      g.director.update(0);
      bosses = g.enemies.items.filter((e) => e.active && e.boss);
      ok(bosses.length === 3);
      ok(bosses.filter((e) => e.final).length === 1);
      const escorts = bosses.filter((e) => e.escort);
      ok(
        escorts.length === 2 &&
          escorts.every((e) => e.id === id && e.maxHP === hp),
      );
      ok(new Set(bosses.map((e) => `${e.x},${e.y}`)).size === 3);
      g.director.update(0);
      g.time = 1800;
      g.director.update(0);
      ok(g.enemies.items.filter((e) => e.active && e.boss).length === 3);
    }
  });
  test("Final formation spawns at pool capacity", () => {
    const g = fresh();
    for (let i = 0; i < R.C.maxEnemies; i++) R.Enemy.spawn(g, 0, 3000, 3000);
    g.time = 900;
    g.director.update(0);
    ok(g.enemies.items.filter((e) => e.active && e.boss).length === 3);
  });
  test("Escort deaths do not duplicate boss loot or boss rewards", () => {
    const g = fresh("normal");
    g.time = 900;
    g.director.update(0);
    const boss = g.enemies.items.find((e) => e.active && e.final);
    g.enemies.items
      .filter((e) => e.active && e.escort)
      .forEach((e) => g.damage.hit(e, 1e9, "ghost"));
    ok(g.stats.coins === 0 && g.stats.bosses === 0 && g.pickups.count === 0);
    g.damage.hit(boss, 1e9, "ghost");
    ok(g.state === "ended" && g.stats.bosses === 1 && g.stats.coins === 150);
  });
  test("Easy blocks drops, collection, objectives, upgrades, chests, achievements and final currency", () => {
    const g = fresh(),
      before = A.save.coins;
    R.Pickup.spawn(g, 100, 100, "coin", 99);
    ok(g.pickups.count === 0);
    g.collect({ type: "coin", value: 999 });
    g.addCoins(80);
    const random = Math.random;
    Math.random = () => 0.05;
    try {
      const common = R.Enemy.spawn(g, 0, 100, 100);
      g.kill(common);
    } finally {
      Math.random = random;
    }
    ok(g.pickups.items.some((p) => p.active && p.type === "xp"));
    ok(!g.pickups.items.some((p) => p.active && p.type === "coin"));
    R.Upgrades.apply(g, { kind: "coin" });
    g.openChest(3);
    ok(g.stats.coins === 0);
    g.resumeChest();
    const o = g.objectives[0];
    g.player.x = o.x;
    g.player.y = o.y;
    o.progress = 11.99;
    g.update(0.02);
    ok(o.done && g.stats.coins === 0);
    if (g.state === "chest") g.resumeChest();
    const mini = R.Boss.spawn(g, 0, false);
    g.damage.hit(mini, 1e9, "ghost");
    ok(g.stats.coins === 0);
    g.finish(false);
    ok(g.reward === 0 && A.save.coins === before);
    ok(R.Save.load().coins === before);
  });
  test("Easy XP, levels and weapon upgrades continue", () => {
    const g = fresh();
    g.collect({ type: "xp", value: 100 });
    ok(g.player.totalXP === 100 && g.player.level > 1);
    if (g.state === "playing") g.openLevel();
    g.choose({ kind: "weapon", id: "orbital", level: 1, rarity: { mult: 1 } });
    ok(g.player.weapons.some((w) => w.id === "orbital"));
  });
  test("Demon is gated by Easy plus final defeat and delayed portal", () => {
    const g = fresh();
    ok(R.Demon.spawn(g) === null);
    defeatFinal(g);
    ok(g.bossFinalDefeated && g.state === "portal");
    g.update(2.49);
    ok(!g.finale.demon);
    A.engine.draw(g);
    window.captureBalance?.("portal");
    g.update(0.02);
    ok(g.finale.demon && g.finale.phase === "hunt");
    ok(g.finale.begin() === false);
  });
  test("Demon fixed HP, speed, pursuit, bounded incoming hits and all animation states", () => {
    const g = hunt(),
      e = g.finale.demon;
    ok(e.hp === 1000 && e.maxHP === 1000 && e.damage === 100);
    ok(e.speed === 220 * 1.35);
    const d = R.util.dist(e, g.player);
    R.Demon.update(g, e, 0.1);
    ok(R.util.dist(e, g.player) < d);
    g.damage.hit(e, 1e9, "ghost");
    ok(e.hp === 1000, "spawn grace");
    e.grace = 0;
    g.damage.hit(e, 1e9, "ghost");
    ok(e.hp === 875, "cannot be one-shot");
    g.damage.hit(e, 1e9, "ghost");
    ok(e.hp === 875, "per-hit recovery");
    for (const mode of ["idle", "run", "attack", "hurt", "laugh", "death"])
      R.Demon.draw(A.engine.c, e, 0.3, mode);
    A.engine.draw(g);
    window.captureBalance?.("demon-hunt");
  });
  test("Demon hit is exactly 100 HP, even with armor/resistance; attack cadence", () => {
    const g = hunt(),
      e = g.finale.demon;
    g.player.hp = 350;
    g.player.stats.hp = 350;
    g.player.stats.armor = 99;
    g.player.stats.resist = 0.65;
    g.player.shield = g.player.dash = g.player.invuln = 0;
    e.grace = 0;
    e.x = g.player.x + 40;
    e.y = g.player.y;
    R.Demon.update(g, e, 0.01);
    ok(g.player.hp === 250);
    g.player.invuln = 0;
    R.Demon.update(g, e, 0.1);
    ok(g.player.hp === 250);
    R.Demon.update(g, e, 1);
    ok(g.player.hp === 150);
  });
  test("Demon death scene delays buttons, laughs, records once and offers working difficulty selection", () => {
    const g = hunt(),
      e = g.finale.demon;
    g.player.hp = 100;
    g.player.invuln = g.player.shield = g.player.dash = 0;
    e.grace = 0;
    e.x = g.player.x + 40;
    e.y = g.player.y;
    R.Demon.update(g, e, 0.01);
    ok(g.state === "demonDeath" && g.player.hp === 0 && g.specialDeath);
    ok(A.ui.screen !== "result");
    const runs = A.save.stats.runs;
    g.update(1.5);
    A.engine.draw(g);
    window.captureBalance?.("demon-laugh");
    ok(A.ui.screen !== "demonResult");
    g.update(2.6);
    ok(A.ui.screen === "demonResult");
    ok(A.ui.root.textContent.includes("VOCÊ É UM NOOB!"));
    ok(
      A.ui.root.textContent.includes("Volte e tente em uma dificuldade maior."),
    );
    ok(A.ui.root.querySelectorAll("button").length === 3);
    ok(A.save.stats.runs === runs + 1 && g.reward === 0);
    g.finish(false, true);
    ok(A.save.stats.runs === runs + 1);
    [...A.ui.root.querySelectorAll("button")]
      .find((b) => b.textContent === "Selecionar dificuldade")
      .click();
    ok(
      A.ui.screen === "select" &&
        A.ui.selectedDifficulty === 1 &&
        A.game === null,
    );
  });
  test("Killing demon leads to true victory with zero permanent reward", () => {
    const g = hunt(),
      e = g.finale.demon,
      before = A.save.coins;
    e.grace = 0;
    for (let i = 0; i < 8; i++) {
      e.hitLock = 0;
      g.damage.hit(e, 1e9, "ghost");
    }
    ok(g.state === "demonVictory");
    A.engine.draw(g);
    g.update(1.3);
    ok(g.state === "ended" && A.ui.screen === "result");
    ok(g.reward === 0 && A.save.coins === before);
  });
  test("Normal, Hard, Nightmare and Eclipse finish without demon", () => {
    for (const id of ["normal", "hard", "nightmare", "eclipse"]) {
      const g = fresh(id);
      defeatFinal(g);
      ok(
        g.state === "ended" && g.bossFinalDefeated && g.finale.phase === "none",
      );
      ok(R.Demon.spawn(g) === null);
      ok(g.reward > 0);
    }
  });
  test("Other lethal sources keep normal Game Over in Easy", () => {
    const g = hunt();
    g.player.hp = 5;
    g.player.invuln = g.player.shield = g.player.dash = 0;
    g.damage.player(100);
    ok(g.state === "ended" && !g.specialDeath && A.ui.screen === "result");
  });
  test("Pause freezes portal, resumes original state; restart has fresh event state", () => {
    const g = fresh();
    defeatFinal(g);
    g.update(1);
    A.pause();
    ok(g.state === "paused");
    g.update(5);
    ok(g.finale.timer === 1);
    A.pause();
    ok(g.state === "portal");
    g.update(1.6);
    ok(g.finale.phase === "hunt");
    A.start("rexx", "zero", "easy");
    ok(A.game.finale.phase === "none" && !A.game.bossFinalDefeated);
  });
  test("Legacy save migration preserves wallet and upgrades, moves old Normal records to Easy", () => {
    const legacy = JSON.parse(JSON.stringify(blank));
    delete legacy.difficultySchema;
    legacy.coins = 789;
    legacy.permanent.damage = 3;
    legacy.records = { "zero-Normal": 1000, "zero-Difícil": 1234 };
    R.Save.write(legacy);
    const migrated = R.Save.load();
    ok(
      migrated.coins === 789 &&
        migrated.permanent.damage === 3 &&
        migrated.records["zero-Fácil"] === 1000 &&
        !migrated.records["zero-Normal"],
    );
    R.Save.write(migrated);
    ok(
      R.Save.load().difficultySchema === 2 &&
        R.Save.load().records["zero-Difícil"] === 1234,
    );
  });
  test("Easy selection clearly explains no permanent currency", () => {
    fresh();
    A.ui.selectedDifficulty = 0;
    A.ui.select();
    ok(
      A.ui.root.textContent.includes(
        "Ideal para aprender o jogo. Não concede moedas para upgrades permanentes.",
      ),
    );
  });
  A.save = saved;
  if (raw === null) localStorage.removeItem(R.Save.key);
  else localStorage.setItem(R.Save.key, raw);
  return results;
};
