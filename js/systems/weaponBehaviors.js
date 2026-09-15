// Independent attack strategies; data/weapons.js chooses the strategy by type.
Rexx.WeaponBehaviors = {
  orbit({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < 2 + Math.floor((l - 1) / 2) + s.amount; j++) {
      let ang =
        g.time * 2.8 + (j / (2 + Math.floor((l - 1) / 2) + s.amount)) * 6.283;
      g.area(
        p.x + Math.cos(ang) * 85 * area,
        p.y + Math.sin(ang) * 85 * area,
        29 * area,
        damage,
        w.id,
        "vulnerable",
      );
      if (E) {
        g.area(
          p.x + Math.cos(-ang) * 145 * area,
          p.y + Math.sin(-ang) * 145 * area,
          33 * area,
          damage,
          w.id,
          "slow",
        );
        shot(ang, p.x + Math.cos(ang) * 85, p.y + Math.sin(ang) * 85, {
          life: 0.6,
        });
      }
    }
  },
  chain({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    if (!target) return;
    let current = target,
      from = p,
      hit = new Set();
    for (let j = 0; j < 3 + l + (E ? 5 : 0); j++) {
      if (!current) break;
      hit.add(current.uid);
      g.line(from.x, from.y, current.x, current.y, d.color, 0.18);
      g.damage.hit(current, damage, w.id, "shock");
      if (E)
        g.zone(
          current.x,
          current.y,
          55,
          0.1,
          damage * 0.35,
          false,
          d.color,
          w.id,
          2,
          "shock",
        );
      from = { x: current.x, y: current.y };
      current = g.nearest(from.x, from.y, 190 * area, hit);
    }
  },
  drone({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < (E ? 3 : 1); j++) {
      let ang = g.time + j * 2.09,
        x = p.x + Math.cos(ang) * 65,
        y = p.y + Math.sin(ang) * 65;
      for (let k = 0; k < n; k++)
        shot(a + (k - (n - 1) / 2) * 0.12, x, y, { pierce: E ? 3 : 0 });
    }
  },
  aura({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    g.area(p.x, p.y, 95 * area, damage, w.id, "burn");
    if (E) {
      g.zone(p.x, p.y, 180 * area, 0.25, damage, false, d.color, w.id);
      p.hp = Math.min(s.hp, p.hp + 1.5);
    }
  },
  gravity({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < (E ? 2 : 1); j++) {
      let x = (target?.x || p.x + 150) + j * 110,
        y = target?.y || p.y;
      g.zone(
        x,
        y,
        125 * area,
        1.4 * s.duration,
        damage,
        false,
        d.color,
        w.id,
        0,
        "stun",
        true,
      );
      if (E)
        for (let k = 0; k < 6; k++)
          shot((k / 6) * 6.283, x, y, { life: 1, pierce: 1 });
    }
  },
  pierce({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < n + (E ? 3 : 0); j++)
      shot(a + (j - (n + (E ? 3 : 0) - 1) / 2) * 0.16, p.x, p.y, {
        pierce: 3 + l,
        returning: E,
        life: E ? 2.8 : 2,
      });
  },
  meteor({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < n + 1; j++) {
      let t = g.randomEnemy() || p;
      g.zone(
        t.x + Rexx.util.rand(-60, 60),
        t.y + Rexx.util.rand(-60, 60),
        65 * area,
        0.65 + j * 0.12,
        damage,
        false,
        d.color,
        w.id,
        E ? 3 : 0,
        "burn",
      );
    }
  },
  laser({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < (E ? 3 : 1); j++) {
      let angle = a + (j - (E ? 1 : 0)) * 0.38,
        range = 700;
      g.line(
        p.x,
        p.y,
        p.x + Math.cos(angle) * range,
        p.y + Math.sin(angle) * range,
        d.color,
        0.25,
        12 * area,
      );
      g.lineDamage(
        p.x,
        p.y,
        angle,
        range,
        19 * area,
        damage,
        w.id,
        E ? "vulnerable" : null,
      );
    }
  },
  mine({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    g.zone(
      p.x,
      p.y,
      80 * area,
      0.4,
      damage,
      false,
      d.color,
      w.id,
      8 * s.duration,
      "stun",
      false,
      true,
      E,
    );
  },
  bounce({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < n; j++)
      shot(a + j * 0.12, p.x, p.y, {
        bounce: 2 + l,
        pierce: 0,
        life: 4,
        split: E,
        r: 8,
      });
  },
  fan({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < n + 2 + (E ? 3 : 0); j++)
      shot(a + (j - (n + 1 + (E ? 3 : 0)) / 2) * 0.14, p.x, p.y, {
        status: E ? "freeze" : Math.random() < 0.25 ? "freeze" : "slow",
        pierce: E ? 4 : 1,
      });
  },
  toxin({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    let t = target || p;
    g.zone(
      t.x,
      t.y,
      (E ? 140 : 90) * area,
      0.4,
      damage * 0.5,
      false,
      d.color,
      w.id,
      4 * s.duration,
      "poison",
    );
    if (E)
      for (let j = 0; j < 8; j++)
        shot((j / 8) * 6.283, t.x, t.y, { status: "poison", life: 1.2 });
  },
  rail({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < (E ? 3 : 1); j++)
      shot(
        a,
        p.x + Math.cos(a + 1.57) * (j - (E ? 1 : 0)) * 35,
        p.y + Math.sin(a + 1.57) * (j - (E ? 1 : 0)) * 35,
        {
          speed: 950,
          pierce: 25,
          r: 7,
          status: E ? "stun" : "vulnerable",
          life: 1.3,
        },
      );
  },
  return({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    for (let j = 0; j < n + (E ? 2 : 0); j++)
      shot(a + (j - (n - 1) / 2) * 0.35, p.x, p.y, {
        returning: true,
        pierce: 30,
        life: 3,
        collect: E,
        r: 9,
      });
  },
  nova({ g, p, s, l, E, damage, area, n, target, a, shot, w, d }) {
    g.area(p.x, p.y, 210 * area, damage, w.id, "vulnerable", 200);
    g.zone(p.x, p.y, 210 * area, 0.01, 0, false, d.color, w.id);
    if (E)
      for (let j = 1; j <= 3; j++)
        g.zone(
          p.x,
          p.y,
          (210 + j * 40) * area,
          0.4 * j,
          damage * 0.6,
          false,
          d.color,
          w.id,
          0,
          "vulnerable",
        );
  },
};
