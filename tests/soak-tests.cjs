const { JSDOM } = require("jsdom"),
  { createCanvas } = require("@napi-rs/canvas");
const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const root = path.resolve(__dirname, ".."),
  html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://rexx-soak.test/",
  }),
  w = dom.window;
w.requestAnimationFrame = () => 0;
w.navigator.getGamepads = () => [];
w.HTMLCanvasElement.prototype.getContext = function () {
  return createCanvas(this.width, this.height).getContext("2d");
};
for (const m of html.matchAll(/<script defer src="([^"]+)"/g))
  w.eval(fs.readFileSync(path.join(root, m[1]), "utf8"));
const R = w.Rexx,
  A = R.app;
A.save.settings.particles = false;
A.save.settings.numbers = false;
A.start();
const g = A.game;
// Immortality is only a test fixture, to exercise the full director timeline.
g.player.shield = 100000;
const preferred = ["ghost", "orbital", "solar", "tesla", "frost", "drone"];
let nextLog = 300,
  maxEnemies = 0,
  maxShots = 0,
  maxPickups = 0,
  frames = 0;
const started = performance.now();
while (g.time < 1900 && g.state !== "ended") {
  if (g.state === "level") {
    const opts = R.Upgrades.options(g);
    const score = (o) =>
      o.kind === "weapon"
        ? preferred.includes(o.id)
          ? 20 + (g.player.weapons.find((w) => w.id === o.id)?.level || 0)
          : 0
        : o.kind === "passive"
          ? g.player.weapons.some(
              (w) => R.data.weapons.find((d) => d.id === w.id).passive === o.id,
            )
            ? 15
            : 3
          : -5;
    g.choose(opts.sort((a, b) => score(b) - score(a))[0]);
  }
  if (g.state === "chest") g.resumeChest();
  let target = null,
    dist = Infinity;
  for (const p of g.pickups.items)
    if (p.active) {
      let d = R.util.dist(p, g.player) * (p.type === "chest" ? 0.05 : 1);
      if (d < dist) {
        target = p;
        dist = d;
      }
    }
  if (!target)
    target = g.nearest(g.player.x, g.player.y, 1200) || { x: 3100, y: 3100 };
  let dx = target.x - g.player.x,
    dy = target.y - g.player.y,
    n = Math.hypot(dx, dy) || 1;
  A.input.axis = () => ({ x: dx / n, y: dy / n });
  g.player.shield = 100000;
  g.update(1 / 30);
  frames++;
  maxEnemies = Math.max(maxEnemies, g.enemies.count);
  maxShots = Math.max(maxShots, g.projectiles.count);
  maxPickups = Math.max(maxPickups, g.pickups.count);
  assert.ok(Number.isFinite(g.player.hp) && Number.isFinite(g.stats.damage));
  if (g.time >= nextLog) {
    console.log(
      "timeline",
      Math.floor(g.time),
      "level",
      g.player.level,
      "kills",
      g.stats.kills,
      "entities",
      g.enemies.count,
    );
    nextLog += 300;
  }
}
assert.ok(g.director.fired.has(1800), "Final boss event missing");
if (g.state !== "ended") {
  const final = g.enemies.items.find((e) => e.active && e.final);
  assert.ok(final, "Final boss disappeared without victory");
  g.damage.hit(final, 1e12, "ghost");
}
assert.equal(g.state, "ended");
assert.equal(A.save.stats.wins, 1);
assert.ok(
  maxEnemies <= R.C.maxEnemies &&
    maxShots <= R.C.maxShots &&
    maxPickups <= R.C.maxPickups,
);
const report = {
  timelineSeconds: g.time,
  frames,
  level: g.player.level,
  kills: g.stats.kills,
  bosses: g.stats.bosses,
  evolutions: g.stats.evolutions,
  maxEnemies,
  maxShots,
  maxPickups,
  simulationSeconds: +((performance.now() - started) / 1000).toFixed(2),
  note: "Automated invulnerable collector; not a human balance test or an FPS benchmark.",
};
console.log(JSON.stringify(report, null, 2));
if (process.env.REPORT_PATH)
  fs.writeFileSync(process.env.REPORT_PATH, JSON.stringify(report, null, 2));
w.close();
