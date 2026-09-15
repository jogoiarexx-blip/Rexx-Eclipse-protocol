Rexx.Game = class {
  constructor(app, character, map, difficulty) {
    this.app = app;
    this.map = map;
    this.difficulty = difficulty;
    this.player = new Rexx.Player(character, app.save);
    this.state = "playing";
    this.time = 0;
    this.uid = 0;
    this.pendingLevels = 0;
    this.hurt = 0;
    this.alertText = "";
    this.alertLife = 0;
    this.stats = {
      kills: 0,
      bosses: 0,
      damage: 0,
      coins: 0,
      chests: 0,
      evolutions: 0,
    };
    this.enemies = new Rexx.Pool(Rexx.Enemy.create, Rexx.C.maxEnemies);
    this.projectiles = new Rexx.Pool(Rexx.Projectile.create, Rexx.C.maxShots);
    this.pickups = new Rexx.Pool(() => ({ active: false }), Rexx.C.maxPickups);
    this.zones = new Rexx.Pool(() => ({ active: false }), 150);
    this.lines = new Rexx.Pool(() => ({ active: false }), 100);
    this.grid = new Rexx.SpatialHash();
    this.camera = new Rexx.Camera();
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.damage = new Rexx.Damage(this);
    this.particles = new Rexx.Particles(this);
    this.weapons = new Rexx.Weapons(this);
    this.director = new Rexx.Director(this);
    this.objectives = [
      { x: 2500, y: 2500, progress: 0, done: false },
      { x: 3850, y: 3150, progress: 0, done: false },
      { x: 3000, y: 4100, progress: 0, done: false },
    ];
    this.app.audio.mode = "map";
    this.alert("PROTOCOLO INICIADO · " + map.name);
    for (let i = 0; i < 12; i++)
      this.director.around(
        map.enemies[i % 2],
        false,
        (i / 12) * Math.PI * 2,
        460 + Math.random() * 130,
      );
  }
  update(dt) {
    if (this.state !== "playing") return;
    this.time += dt;
    this.hurt = Math.max(0, this.hurt - dt);
    this.alertLife = Math.max(0, this.alertLife - dt);
    this.player.update(this, dt);
    this.director.update(dt);
    this.grid.clear();
    this.enemies.each((e) => {
      Rexx.Enemy.update(this, e, dt);
      if (e.active) this.grid.insert(e);
    });
    if (this.state !== "playing") return;
    this.weapons.update(dt);
    this.projectiles.each((p) => Rexx.Projectile.update(this, p, dt));
    this.updateZones(dt);
    this.pickups.each((p) => Rexx.Pickup.update(this, p, dt));
    this.lines.each((l) => {
      l.life -= dt;
      if (l.life <= 0) this.lines.release(l);
    });
    this.particles.update(dt);
    this.camera.update(this.player, dt);
    for (const o of this.objectives)
      if (!o.done && Rexx.util.dist(o, this.player) < 90) {
        o.progress += dt;
        if (o.progress >= 12) {
          o.done = true;
          this.stats.coins += 80;
          Rexx.Pickup.spawn(this, o.x, o.y, "chest");
          this.alert("RETRANSMISSOR RESTAURADO · +80 MOEDAS");
        }
      }
    if (this.state === "playing") {
      if (this.chestQueue) {
        this.chestQueue--;
        this.openChest();
      } else if (this.pendingLevels) this.openLevel();
    }
  }
  nearest(x, y, r = 800, exclude = null) {
    let best = null,
      d = r * r;
    for (const e of this.enemies.items)
      if (e.active && !exclude?.has(e.uid)) {
        let n = (e.x - x) ** 2 + (e.y - y) ** 2;
        if (n < d) {
          d = n;
          best = e;
        }
      }
    return best;
  }
  randomEnemy() {
    let a = this.enemies.items;
    for (let i = 0; i < 10; i++) {
      let e = a[Math.floor(Math.random() * a.length)];
      if (e?.active) return e;
    }
    return this.nearest(this.player.x, this.player.y);
  }
  shot(x, y, a, damage, weapon, opts = {}) {
    const speed = (opts.speed || 430) * this.player.stats.projectileSpeed;
    return Rexx.Projectile.spawn(this, {
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      damage,
      weapon,
      ...opts,
    });
  }
  hostile(x, y, a, speed, damage, r = 5) {
    Rexx.Projectile.spawn(this, {
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      damage,
      r,
      hostile: true,
      color: "#ff7c94",
      life: 7,
    });
  }
  area(x, y, r, damage, w, status, knock = 35) {
    const targets = this.grid.query(x, y, r).slice();
    for (const e of targets) this.damage.hit(e, damage, w, status, knock);
    this.particles.burst(
      x,
      y,
      Rexx.data.weapons.find((a) => a.id === w)?.color || "#b3f9dc",
      4,
    );
  }
  lineDamage(x, y, a, len, width, damage, w, status) {
    const dx = Math.cos(a),
      dy = Math.sin(a);
    for (const e of this.enemies.items)
      if (e.active) {
        let ex = e.x - x,
          ey = e.y - y,
          along = ex * dx + ey * dy,
          across = Math.abs(ex * dy - ey * dx);
        if (along >= 0 && along < len && across < width + e.r)
          this.damage.hit(e, damage, w, status);
      }
  }
  line(x, y, tx, ty, color, life = 0.15, width = 3) {
    let l = this.lines.get();
    if (l) Object.assign(l, { x, y, tx, ty, color, life, max: life, width });
  }
  zone(
    x,
    y,
    r,
    delay,
    damage,
    hostile = false,
    color = "#a5f4ec",
    weapon = null,
    persist = 0,
    status = null,
    pull = false,
    mine = false,
    secondary = false,
  ) {
    let z = this.zones.get();
    if (z)
      Object.assign(z, {
        x,
        y,
        r,
        delay,
        maxDelay: delay,
        damage,
        hostile,
        color,
        weapon,
        persist,
        status,
        pull,
        mine,
        secondary,
        triggered: false,
        tick: 0,
        life: 0.35,
        beam: false,
        playerPull: false,
      });
    return z;
  }
  beam(x, y, a, len, width, delay, damage) {
    let z = this.zone(x, y, len, delay, damage, true, "#ff829d");
    if (z) Object.assign(z, { beam: true, a, len, width });
  }
  updateZones(dt) {
    this.zones.each((z) => {
      if (z.delay > 0) {
        z.delay -= dt;
        if (z.playerPull) {
          let dx = z.x - this.player.x,
            dy = z.y - this.player.y,
            n = Math.hypot(dx, dy) || 1;
          if (n < z.r && n > 15) {
            this.player.x += (dx / n) * 70 * dt;
            this.player.y += (dy / n) * 70 * dt;
          }
        }
        if (z.pull)
          for (const e of this.grid.query(z.x, z.y, z.r))
            if (!e.boss) {
              let dx = z.x - e.x,
                dy = z.y - e.y,
                n = Math.hypot(dx, dy) || 1;
              e.x += (dx / n) * 130 * dt;
              e.y += (dy / n) * 130 * dt;
            }
        return;
      }
      if (z.mine && !z.triggered) {
        z.persist -= dt;
        if (!this.nearest(z.x, z.y, z.r * 0.65) && z.persist > 0) return;
        z.persist = 0;
      }
      if (!z.triggered) {
        z.triggered = true;
        this.particles.burst(z.x, z.y, z.color, 14);
        if (z.secondary)
          for (let j = 0; j < 4; j++)
            this.zone(
              z.x + Math.cos(j * 1.57) * 85,
              z.y + Math.sin(j * 1.57) * 85,
              z.r * 0.7,
              0.3,
              z.damage * 0.6,
              false,
              z.color,
              z.weapon,
            );
        this.app.audio.play("explosion");
      }
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick = 0.5;
        if (z.hostile) {
          let hit = z.beam
            ? (() => {
                let dx = this.player.x - z.x,
                  dy = this.player.y - z.y,
                  along = dx * Math.cos(z.a) + dy * Math.sin(z.a);
                return (
                  along > 0 &&
                  along < z.len &&
                  Math.abs(dx * Math.sin(z.a) - dy * Math.cos(z.a)) <
                    z.width + 15
                );
              })()
            : Rexx.util.dist(z, this.player) < z.r + 15;
          if (hit) this.damage.player(z.damage);
        } else if (z.damage)
          this.area(z.x, z.y, z.r, z.damage, z.weapon, z.status);
      }
      if (z.persist > 0) z.persist -= dt;
      else {
        z.life -= dt;
        if (z.life <= 0) this.zones.release(z);
      }
    });
  }
  kill(e, reward = true) {
    if (!e.active) return;
    this.enemies.release(e);
    this.particles.burst(e.x, e.y, e.data.color, e.elite ? 30 : 5);
    if (!reward) return;
    this.stats.kills++;
    this.app.save.discoveries[e.id] =
      (this.app.save.discoveries[e.id] || 0) + 1;
    if (e.boss) {
      this.stats.bosses++;
      this.stats.coins += 150;
      this.alert("ENTIDADE ELIMINADA · " + e.data.name);
      Rexx.Pickup.spawn(this, e.x, e.y, "chest", 3);
      this.app.audio.mode = "map";
      if (e.final) {
        this.finish(true);
        return;
      }
    } else if (e.elite) Rexx.Pickup.spawn(this, e.x, e.y, "chest", 1);
    Rexx.Pickup.spawn(
      this,
      e.x,
      e.y,
      "xp",
      e.boss ? 150 : e.elite ? 40 : e.data.xp,
    );
    let roll = Math.random();
    if (roll < 0.025) Rexx.Pickup.spawn(this, e.x, e.y, "heal", 12);
    else if (roll < 0.1) Rexx.Pickup.spawn(this, e.x, e.y, "coin", 1);
    else if (roll < 0.104) Rexx.Pickup.spawn(this, e.x, e.y, "magnet");
    else if (roll < 0.107) Rexx.Pickup.spawn(this, e.x, e.y, "bomb");
    else if (roll < 0.113) Rexx.Pickup.spawn(this, e.x, e.y, "energy");
  }
  collect(p) {
    switch (p.type) {
      case "xp":
        Rexx.Level.add(this, p.value);
        break;
      case "heal":
        this.player.hp = Math.min(
          this.player.stats.hp,
          this.player.hp + p.value,
        );
        break;
      case "coin":
        this.stats.coins += p.value;
        break;
      case "magnet":
        this.pickups.each((x) => {
          if (x.type === "xp") x.magnet = true;
        });
        this.alert("ÍMÃ DIMENSIONAL", 1.5);
        break;
      case "bomb":
        this.enemies.each((e) =>
          this.damage.hit(e, 350 * this.player.stats.damage, "bomb", "stun"),
        );
        this.camera.shake = 20;
        break;
      case "energy":
        this.player.special = 0;
        this.player.shield = Math.max(this.player.shield, 2);
        break;
      case "chest":
        this.openChest(p.value);
        break;
    }
  }
  special(type) {
    const p = this.player;
    this.particles.burst(p.x, p.y, p.character.color, 25);
    if (type === "pulse")
      this.area(p.x, p.y, 230, 65 * p.stats.damage, "special", "stun", 300);
    if (type === "barrage")
      for (let j = 0; j < 12; j++)
        this.shot(p.x, p.y, (j / 12) * 6.283, 45 * p.stats.damage, "special", {
          pierce: 3,
          color: p.character.color,
        });
    if (type === "shield") p.shield = 5;
    if (type === "dash") p.dash = 2;
    if (type === "freeze") this.area(p.x, p.y, 400, 15, "special", "freeze");
    if (type === "rewrite") {
      let count = 0;
      this.projectiles.each((s) => {
        if (s.hostile) {
          this.projectiles.release(s);
          count++;
        }
      });
      p.hp = Math.min(p.stats.hp, p.hp + 10 + count);
      this.area(p.x, p.y, 260, 80, "special", "vulnerable");
    }
  }
  openLevel() {
    if (this.state !== "playing") return;
    this.pendingLevels--;
    this.state = "level";
    this.app.ui.level(Rexx.Upgrades.options(this));
  }
  choose(o) {
    if (this.state !== "level") return;
    Rexx.Upgrades.apply(this, o);
    this.state = "playing";
    this.app.ui.hide();
    if (this.pendingLevels) this.openLevel();
  }
  openChest(value = 1) {
    if (this.state === "ended") return;
    this.chestQueue = (this.chestQueue || 0) + 1;
    if (this.state !== "playing") return;
    this.chestQueue--;
    this.state = "chest";
    this.stats.chests++;
    let rewards = [],
      evo = Rexx.Upgrades.evolve(this);
    if (evo)
      rewards.push({ name: evo.evolution, desc: evo.evoDesc, icon: "✺" });
    let n =
      value >= 3 ? 3 : Math.random() < 0.1 * this.player.stats.luck ? 3 : 1;
    for (let i = 0; i < n; i++) {
      let o = Rexx.util.pick(Rexx.Upgrades.options(this));
      if (o) {
        Rexx.Upgrades.apply(this, o);
        rewards.push({
          name: o.name,
          desc: "Nível " + o.level + " · " + o.rarity.name,
          icon: o.icon,
        });
      }
    }
    let coins = 20 + Math.floor(Math.random() * 35);
    this.stats.coins += coins;
    rewards.push({
      name: coins + " moedas",
      desc: "Adicionadas à recompensa da missão.",
      icon: "◉",
    });
    this.app.audio.play("chest");
    this.app.ui.chest(rewards);
  }
  resumeChest() {
    this.state = "playing";
    this.app.ui.hide();
    if (this.chestQueue) {
      this.chestQueue--;
      this.openChest();
    } else if (this.pendingLevels) this.openLevel();
  }
  alert(text, life = 3) {
    this.alertText = text;
    this.alertLife = life;
  }
  finish(win) {
    if (this.state === "ended") return;
    this.state = "ended";
    const s = this.app.save,
      st = s.stats,
      p = this.player;
    const beforeChars = Rexx.data.characters
        .filter((c) => c.test(st))
        .map((c) => c.id),
      beforeMaps = this.app.unlockedMaps();
    st.runs++;
    st[win ? "wins" : "losses"]++;
    st.kills += this.stats.kills;
    st.bosses += this.stats.bosses;
    st.time += this.time;
    st.bestTime = Math.max(st.bestTime, this.time);
    st.bestLevel = Math.max(st.bestLevel, p.level);
    st.bestDamage = Math.max(st.bestDamage, this.stats.damage);
    st.xp += p.totalXP;
    st.chests += this.stats.chests;
    st.evolved += this.stats.evolutions;
    st.characters[p.character.id] = (st.characters[p.character.id] || 0) + 1;
    if (win) st.mapWins[this.map.id] = (st.mapWins[this.map.id] || 0) + 1;
    const key = this.map.id + "-" + this.difficulty.name;
    s.records[key] = Math.max(s.records[key] || 0, this.time);
    this.reward = Math.floor(
      (this.stats.coins +
        this.stats.kills * 0.08 +
        this.time * 0.12 +
        (win ? 450 : 0)) *
        this.difficulty.reward,
    );
    s.coins += this.reward;
    this.newAchievements = Rexx.Achievements.check(this.app);
    this.unlocks = Rexx.data.characters
      .filter((c) => c.test(st) && !beforeChars.includes(c.id))
      .map((c) => c.name)
      .concat(
        this.app
          .unlockedMaps()
          .filter((id) => !beforeMaps.includes(id))
          .map((id) => Rexx.data.maps.find((m) => m.id === id).name),
      );
    this.app.persist();
    this.app.audio.play(win ? "win" : "lose");
    this.app.ui.result(win);
  }
};
