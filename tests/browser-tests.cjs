/* Development-only regression suite. The game itself needs no Node packages. */
const { chromium } = require("playwright");
const path = require("path");
const { pathToFileURL } = require("url");
const assert = require("assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });
  await page.goto(pathToFileURL(path.join(__dirname, "../index.html")).href);
  await page.addScriptTag({ path: path.join(__dirname, "scenarios.js") });
  await page.addScriptTag({
    path: path.join(__dirname, "balance-scenarios.js"),
  });
  await page.evaluate(async () => {
    const a = Rexx.app;
    await Promise.all([
      a.sprites.loaded,
      a.enemySprites.loaded,
      a.ground.loaded,
      a.scenery.loaded,
      a.pickupSprites.loaded,
      a.weaponSprites.loaded,
    ]);
  });
  const report = await page.evaluate(() => [
    ...window.runRexxTests(),
    ...window.runBalanceTests(),
  ]);
  for (const r of report)
    console.log(
      (r.pass ? "PASS " : "FAIL ") + r.name + (r.error ? "\n" + r.error : ""),
    );
  console.log("PAGE ERRORS:", JSON.stringify(errors));
  await page.evaluate(() => {
    Rexx.app.ui.menu();
    Rexx.app.engine.menu(4);
  });
  if (process.env.SCREENSHOTS)
    await page.screenshot({
      path: path.join(process.env.SCREENSHOTS, "menu.png"),
    });
  await page.evaluate(() => {
    const A = Rexx.app;
    A.start();
    const g = A.game;
    g.time = 370;
    for (let i = 0; i < 100; i++)
      g.director.around(i % 8, false, i * 0.17, 170 + (i % 8) * 45);
    g.grid.clear();
    g.enemies.each((e) => g.grid.insert(e));
    g.player.weapons.push(
      {
        id: "orbital",
        level: 5,
        evolved: false,
        quality: 1,
        timer: 0,
        damage: 0,
      },
      {
        id: "drone",
        level: 4,
        evolved: false,
        quality: 1,
        timer: 0,
        damage: 0,
      },
    );
    g.player.shield = 999;
    g.weapons.update(0.1);
    A.engine.draw(g);
    A.ui.tick = 0;
    A.ui.hud(g);
  });
  if (process.env.SCREENSHOTS)
    await page.screenshot({
      path: path.join(process.env.SCREENSHOTS, "gameplay.png"),
    });
  if (process.env.REPORT_PATH)
    require("fs").writeFileSync(
      process.env.REPORT_PATH,
      JSON.stringify({ report, errors }, null, 2),
    );
  await browser.close();
  assert.equal(errors.length, 0);
  assert.ok(
    report.every((r) => r.pass),
    "Regression failure",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
