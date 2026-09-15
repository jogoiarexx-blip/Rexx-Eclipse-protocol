"use strict";
// One shared namespace; classic deferred scripts also work over file://.
window.Rexx = {
  version: "1.0.1",
  C: {
    duration: 1800,
    world: 6200,
    maxEnemies: 520,
    maxShots: 850,
    maxParticles: 350,
    maxPickups: 650,
    weaponSlots: 6,
    passiveSlots: 6,
  },
  data: {},
};
Rexx.util = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  rand: (a, b) => a + Math.random() * (b - a),
  pick: (a) => a[Math.floor(Math.random() * a.length)],
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  time: (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`,
  fmt: (n) => Math.floor(n).toLocaleString("pt-BR"),
};

Rexx.statLabels = {
  hp: "HP máximo",
  regen: "Regeneração / s",
  speed: "Velocidade",
  armor: "Armadura",
  damage: "Dano",
  attackSpeed: "Cadência",
  cooldown: "Redução de intervalo",
  area: "Área",
  duration: "Duração",
  projectileSpeed: "Velocidade dos tiros",
  amount: "Projéteis extras",
  crit: "Chance crítica",
  critDamage: "Dano crítico",
  luck: "Sorte",
  pickup: "Coleta",
  xp: "Ganho de XP",
  resist: "Resistência",
};
