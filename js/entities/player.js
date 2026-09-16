Rexx.Player = class {
  constructor(character, save) {
    this.character = character;
    this.x = 3100;
    this.y = 3100;
    this.r = 15;
    this.angle = Math.PI / 2;
    this.animationTime = 0;
    this.level = 1;
    this.xp = 0;
    this.nextXP = 12;
    this.totalXP = 0;
    this.weapons = [
      {
        id: character.weapon,
        level: 1,
        timer: 0,
        evolved: false,
        quality: 1,
        damage: 0,
      },
    ];
    this.passives = {};
    this.quality = {};
    this.invuln = 0;
    this.special = 6;
    this.specialMax = {
      pulse: 25,
      barrage: 22,
      shield: 30,
      dash: 18,
      freeze: 26,
      rewrite: 28,
    }[character.ability];
    this.shield = 0;
    this.dash = 0;
    this.recalc(save);
    this.hp = this.stats.hp;
  }
  recalc(save) {
    let old = this.stats?.hp || 0;
    this.stats = {
      hp: 100,
      regen: 0.15,
      speed: 220,
      armor: 0,
      damage: 1,
      attackSpeed: 1,
      cooldown: 0,
      area: 1,
      duration: 1,
      projectileSpeed: 1,
      amount: 0,
      crit: 0.08,
      critDamage: 2,
      luck: 1,
      pickup: 95,
      xp: 1,
      resist: 0,
      ...this.character.stats,
    };
    for (const p of Rexx.data.passives) {
      let n =
        (this.passives[p.id] || 0) * (this.quality[p.id] || 1) +
        (save.permanent[p.id] || 0) * 0.4;
      if (!n) continue;
      let v = p.value * n;
      if (["hp", "speed", "pickup"].includes(p.id)) this.stats[p.id] *= 1 + v;
      else this.stats[p.id] += v;
    }
    this.stats.cooldown = Math.min(0.65, this.stats.cooldown);
    this.stats.resist = Math.min(0.65, this.stats.resist);
    this.stats.amount = Math.floor(this.stats.amount);
    this.stats.crit = Math.min(0.85, this.stats.crit);
    this.stats.projectileSpeed += Math.max(0, this.level - 1) * 0.002;
    if (this.hp !== undefined)
      this.hp = Math.min(
        this.stats.hp,
        this.hp + Math.max(0, this.stats.hp - old),
      );
  }
  update(g, dt) {
    this.animationTime += dt;
    const a = g.app.input.axis(),
      s = this.stats;
    this.moving = Math.hypot(a.x, a.y) > 0.05;
    if (this.moving) this.walkTime = (this.walkTime || 0) + dt;
    else this.walkTime = 0;
    if (Math.abs(a.x) > 0.05) this.facingLeft = a.x < 0;
    this.invuln = Math.max(0, this.invuln - dt);
    this.shield = Math.max(0, this.shield - dt);
    this.dash = Math.max(0, this.dash - dt);
    this.x = Rexx.util.clamp(
      this.x + a.x * s.speed * (this.dash > 0 ? 1.7 : 1) * dt,
      35,
      Rexx.C.world - 35,
    );
    this.y = Rexx.util.clamp(
      this.y + a.y * s.speed * (this.dash > 0 ? 1.7 : 1) * dt,
      35,
      Rexx.C.world - 35,
    );
    if (a.x || a.y) this.angle = Math.atan2(a.y, a.x);
    this.hp = Math.min(s.hp, this.hp + s.regen * dt);
    this.special -= dt;
    if (this.special <= 0) {
      this.special = this.specialMax;
      g.special(this.character.ability);
    }
  }
};
