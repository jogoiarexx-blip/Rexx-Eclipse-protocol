// Headless DOM + native Canvas validation; does not substitute for browser QA.
const { JSDOM } = require("jsdom");
const { createCanvas } = require("@napi-rs/canvas");
const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  url: "https://rexx.test/",
});
const w = dom.window;
w.innerWidth = 1440;
w.innerHeight = 900;
w.devicePixelRatio = 1;
w.requestAnimationFrame = () => 0;
w.navigator.getGamepads = () => [];
w.HTMLCanvasElement.prototype.getContext = function () {
  if (!this._canvas) this._canvas = createCanvas(this.width, this.height);
  return this._canvas.getContext("2d");
};
w.document.getElementById("game").width = 1440;
w.document.getElementById("game").height = 900;
for (const m of html.matchAll(/<script defer src="([^"]+)"/g))
  w.eval(fs.readFileSync(path.join(root, m[1]), "utf8"));
w.eval(fs.readFileSync(path.join(__dirname, "scenarios.js"), "utf8"));
const report = w.runRexxTests();
for (const r of report)
  console.log(
    (r.pass ? "PASS " : "FAIL ") + r.name + (r.error ? "\n" + r.error : ""),
  );
if (process.env.REPORT_PATH)
  fs.writeFileSync(process.env.REPORT_PATH, JSON.stringify(report, null, 2));
const A = w.Rexx.app;
A.ui.menu();
A.engine.menu(4);
if (process.env.SCREENSHOTS)
  fs.writeFileSync(
    path.join(process.env.SCREENSHOTS, "canvas-menu.png"),
    w.document.getElementById("game")._canvas.toBuffer("image/png"),
  );
A.start();
let g = A.game;
g.time = 370;
for (let i = 0; i < 110; i++)
  g.director.around(i % 8, false, i * 0.17, 180 + (i % 8) * 45);
g.grid.clear();
g.enemies.each((e) => g.grid.insert(e));
g.player.weapons.push(
  { id: "orbital", level: 5, evolved: false, quality: 1, timer: 0, damage: 0 },
  { id: "drone", level: 4, evolved: false, quality: 1, timer: 0, damage: 0 },
);
g.player.shield = 999;
g.weapons.update(0.1);
A.engine.draw(g);
A.ui.tick = 0;
A.ui.hud(g);
if (process.env.SCREENSHOTS)
  fs.writeFileSync(
    path.join(process.env.SCREENSHOTS, "canvas-gameplay.png"),
    w.document.getElementById("game")._canvas.toBuffer("image/png"),
  );
assert.ok(
  report.every((r) => r.pass),
  "Regression failure",
);
console.log("All " + report.length + " regression groups passed.");
w.close();
