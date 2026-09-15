Rexx.Level = {
  add(g, n) {
    const p = g.player,
      v = n * p.stats.xp;
    p.totalXP += v;
    p.xp += v;
    while (p.xp >= p.nextXP) {
      p.xp -= p.nextXP;
      p.level++;
      p.nextXP = Math.floor(12 + p.level * 7 + Math.pow(p.level, 1.45));
      g.pendingLevels++;
      p.recalc(g.app.save);
    }
    if (g.pendingLevels && g.state === "playing") g.openLevel();
  },
};
