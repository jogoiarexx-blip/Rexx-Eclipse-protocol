const { JSDOM } = require("jsdom");
const { createCanvas, Image } = require("@napi-rs/canvas");
const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const watchdog = setTimeout(() => {
  console.error("Timed out waiting for asset loading or tests");
  process.exit(1);
}, 15000);
(async () => {
  const root = path.resolve(__dirname, ".."),
    html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url: "https://rexx-sprites.test/",
    }),
    w = dom.window;
  const consoleErrors = [];
  w.addEventListener("error", (event) => consoleErrors.push(event.message));
  w.console.error = (...args) => consoleErrors.push(args.join(" "));
  w.innerWidth = 1280;
  w.innerHeight = 720;
  w.devicePixelRatio = 1;
  w.requestAnimationFrame = () => 0;
  w.navigator.getGamepads = () => [];
  w.Image = class extends Image {
    set src(value) {
      super.src = fs.readFileSync(path.join(root, value));
    }
  };
  w.HTMLCanvasElement.prototype.getContext = function () {
    this._canvas ||= createCanvas(this.width, this.height);
    const context = this._canvas.getContext("2d");
    if (!context._domPatternBridge) {
      const createPattern = context.createPattern.bind(context);
      context.createPattern = (image, repeat) =>
        createPattern(image._canvas || image, repeat);
      context._domPatternBridge = true;
    }
    return context;
  };
  const canvas = w.document.getElementById("game");
  canvas.width = 1280;
  canvas.height = 720;
  for (const m of html.matchAll(/<script defer src="([^"]+)"/g))
    w.eval(fs.readFileSync(path.join(root, m[1]), "utf8"));
  const A = w.Rexx.app;
  const ready = await Promise.race([
    A.sprites.loaded,
    new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
  ]);
  assert.equal(ready, true, "Atlas did not load at the expected dimensions");
  assert.equal(await A.scenery.loaded, true, "Scenery atlas loads");
  let sceneryFrames = 0;
  for (const frames of Object.values(A.scenery.atlas.maps)) {
    assert.equal(frames.length, 4);
    for (const f of frames) {
      assert.ok(
        f.x >= 0 &&
          f.y >= 0 &&
          f.x + f.w <= A.scenery.image.width &&
          f.y + f.h <= A.scenery.image.height,
      );
      sceneryFrames++;
    }
  }
  assert.equal(sceneryFrames, 20);
  assert.equal(await A.pickupSprites.loaded, true, "Pickup sprites load");
  assert.equal(Object.keys(A.pickupSprites.atlas.frames).length, 12);
  const pickupContext = createCanvas(120, 120).getContext("2d");
  for (const [value, key] of [
    [1, "xp_small"],
    [5, "xp_medium"],
    [10, "xp_large"],
    [40, "xp_special"],
  ]) {
    assert.equal(A.pickupSprites.key({ type: "xp", value }), key);
    assert.equal(
      A.pickupSprites.draw(pickupContext, { type: "xp", value, x: 60, y: 60 }),
      true,
    );
  }
  for (const type of ["heal", "coin", "magnet", "bomb", "energy", "chest"]) {
    assert.equal(
      A.pickupSprites.draw(pickupContext, {
        type,
        value: 1,
        x: 60,
        y: 60,
        age: 1,
      }),
      true,
    );
  }
  assert.equal(A.pickupSprites.draw(pickupContext, { type: "unknown" }), false);
  assert.equal(
    A.pickupSprites.chestElement().querySelectorAll("canvas").length,
    3,
  );
  assert.equal(await A.weaponSprites.loaded, true, "Weapon sprites load");
  assert.equal(Object.keys(A.weaponSprites.atlas.frames).length, 15);
  for (const weapon of w.Rexx.data.weapons) {
    assert.ok(A.weaponSprites.atlas.frames[weapon.id]);
    assert.equal(
      A.weaponSprites.draw(pickupContext, weapon.id, 60, 60, 40),
      true,
    );
    assert.ok(A.weaponSprites.icon(weapon.id).includes("weapon-art"));
  }
  assert.equal(
    A.weaponSprites.projectile(pickupContext, {
      weapon: "disc",
      hostile: false,
      x: 60,
      y: 60,
      r: 6,
      age: 1,
    }),
    true,
  );
  assert.equal(
    A.weaponSprites.projectile(pickupContext, {
      weapon: "boomerang",
      hostile: false,
      x: 60,
      y: 60,
      r: 6,
      age: 1,
    }),
    true,
  );
  assert.equal(
    A.weaponSprites.projectile(pickupContext, {
      weapon: "disc",
      hostile: true,
    }),
    false,
  );
  const groundReady = await A.ground.loaded;
  assert.equal(groundReady.length, 5);
  assert.ok(groundReady.every(Boolean), "All regional floors must load");
  const floorContext = canvas.getContext("2d");
  assert.equal(
    A.ground.draw(floorContext, { id: "missing" }, 0, 0, 20, 20),
    false,
  );
  for (const map of w.Rexx.data.maps) {
    const tile = A.ground.tiles.get(map.id)._canvas;
    const tc = tile.getContext("2d");
    assert.deepEqual(
      tc.getImageData(0, 0, 1, 1024).data,
      tc.getImageData(1023, 0, 1, 1024).data,
      "Horizontal repeat seam",
    );
    assert.deepEqual(
      tc.getImageData(0, 0, 1024, 1).data,
      tc.getImageData(0, 1023, 1024, 1).data,
      "Vertical repeat seam",
    );
    assert.equal(
      A.ground.draw(floorContext, map, -300, -200, 1600, 1000),
      true,
    );
  }
  const enemyReady = await A.enemySprites.loaded;
  assert.equal(enemyReady.length, 6);
  assert.ok(enemyReady.every(Boolean), "Enemy and boss atlas files must load");
  let enemyFrames = 0;
  for (const sheet of A.enemySprites.sheets) {
    for (const [id, animation] of Object.entries(sheet.animations)) {
      assert.equal(animation.frames.length, 4);
      for (const f of animation.frames) {
        assert.ok(
          f.x >= 0 &&
            f.y >= 0 &&
            f.w > 0 &&
            f.h > 0 &&
            f.x + f.w <= sheet.width &&
            f.y + f.h <= sheet.height,
        );
        enemyFrames++;
      }
    }
  }
  assert.equal(enemyFrames, 260);
  const check = createCanvas(1024, 1536),
    ctx = check.getContext("2d");
  ctx.drawImage(A.sprites.image, 0, 0);
  const pixels = ctx.getImageData(0, 0, 1024, 1536).data;
  assert.equal(pixels[3], 0, "Atlas must have real transparent background");
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 4; col++) {
      let visible = 0,
        clear = 0;
      for (let y = row * 256; y < (row + 1) * 256; y++)
        for (let x = col * 256; x < (col + 1) * 256; x++) {
          const a = pixels[(y * 1024 + x) * 4 + 3];
          if (a > 100) visible++;
          if (a === 0) clear++;
        }
      assert.ok(
        visible > 1000 && clear > 1000,
        "Missing sprite or opaque cell " + row + "," + col,
      );
    }
  A.start();
  const g = A.game,
    p = g.player;
  const testContext = canvas.getContext("2d");
  for (const map of w.Rexx.data.maps) {
    const fixture = { map, player: g.player, objectives: g.objectives };
    let total = 0;
    const columns = Math.ceil(w.Rexx.C.world / A.scenery.cell);
    for (let row = 0; row < columns; row++)
      for (let col = 0; col < columns; col++) {
        const a = A.scenery.placement(fixture, col, row),
          b = A.scenery.placement(fixture, col, row);
        assert.deepEqual(a, b, "Scenery positions must remain stable");
        if (a) {
          total++;
          for (const o of fixture.objectives)
            assert.ok(Math.hypot(a.x - o.x, a.y - o.y) >= 180);
        }
      }
    assert.ok(total > 20);
    const visible = A.scenery.draw(
      testContext,
      fixture,
      2400,
      2400,
      3600,
      3600,
    );
    assert.ok(visible > 0 && visible < total, "Only visible cells are drawn");
  }
  const directions = [
    ["d"],
    ["d", "s"],
    ["s"],
    ["a", "s"],
    ["a"],
    ["a", "w"],
    ["w"],
    ["d", "w"],
  ];
  for (let i = 0; i < directions.length; i++) {
    A.input.keys.clear();
    directions[i].forEach((key) => A.input.keys.add(key));
    p.update(g, 0.016);
    assert.equal(
      A.sprites.direction(p),
      i,
      "Eight-way facing follows movement",
    );
    A.input.keys.clear();
    p.update(g, 0.016);
    assert.equal(A.sprites.direction(p), i, "Facing persists while idle");
  }
  w.navigator.getGamepads = () => [{ axes: [-1, -1], buttons: [] }];
  p.update(g, 0.016);
  assert.equal(A.sprites.direction(p), 5, "Gamepad northwest direction");
  w.navigator.getGamepads = () => [];
  p.angle = Math.PI / 2;
  const atlas = A.sprites.directionAtlas;
  assert.equal(Object.keys(atlas.characters).length, 6);
  for (const [id, animation] of Object.entries(atlas.characters)) {
    assert.equal(animation.frames.length, 8);
    for (let i = 0; i < 8; i++) {
      const f = animation.frames[i];
      assert.ok(
        f.x >= 0 &&
          f.y >= 0 &&
          f.x + f.w <= atlas.width &&
          f.y + f.h <= atlas.height,
      );
      const c = createCanvas(96, 96).getContext("2d");
      c.translate(48, 48);
      assert.equal(
        A.sprites.drawAgent(c, {
          character: { id },
          angle: (i * Math.PI) / 4,
          moving: true,
          walkTime: 0.2,
        }),
        true,
      );
    }
  }
  if (process.env.SCREENSHOTS) {
    const sheet = createCanvas(800, 660),
      c = sheet.getContext("2d");
    c.fillStyle = "#142631";
    c.fillRect(0, 0, 800, 660);
    Object.keys(atlas.characters).forEach((id, row) => {
      for (let i = 0; i < 8; i++) {
        c.save();
        c.translate(50 + i * 100, 50 + row * 110);
        A.sprites.drawAgent(c, {
          character: { id },
          angle: (i * Math.PI) / 4,
          moving: true,
          walkTime: 0.1,
        });
        c.restore();
      }
    });
    fs.writeFileSync(
      path.join(process.env.SCREENSHOTS, "agents-eight-directions.webp"),
      sheet.toBuffer("image/webp"),
    );
  }
  let captures = [];
  for (const [id, row] of Object.entries(A.sprites.rows)) {
    p.character = w.Rexx.data.characters.find((c) => c.id === id);
    for (let frame = 0; frame < 4; frame++) {
      p.moving = true;
      p.walkTime = frame / 8;
      const c = createCanvas(96, 96),
        cc = c.getContext("2d");
      cc.translate(48, 48);
      assert.equal(A.sprites.drawAgent(cc, p), true);
      captures.push(c.toBuffer("image/webp"));
    }
  }
  for (let r = 0; r < 6; r++)
    assert.notDeepEqual(
      captures[r * 4],
      captures[r * 4 + 1],
      "Walk frames must differ",
    );
  A.input.keys.add("d");
  g.update(0.16);
  A.input.keys.clear();
  assert.equal(p.moving, true);
  g.update(0.016);
  assert.equal(p.moving, false);
  assert.equal(A.sprites.frame(p), 0);
  A.ui.select();
  assert.equal(A.ui.root.querySelectorAll(".agent-art").length, 6);
  A.ui.characters();
  assert.equal(A.ui.root.querySelectorAll(".agent-art").length, 6);
  A.ui.arsenal();
  assert.equal(A.ui.root.querySelectorAll(".weapon-art").length, 15);
  A.ui.level([
    {
      kind: "weapon",
      id: "orbital",
      name: "Lâminas Orbitais",
      icon: "◈",
      level: 1,
      desc: "Teste",
      rarity: { color: "#fff", name: "Comum", mult: 1 },
    },
  ]);
  assert.equal(A.ui.root.querySelectorAll(".weapon-art").length, 1);
  A.ui.hide();
  p.character = w.Rexx.data.characters[0];
  p.shield = 0;
  A.engine.draw(g);
  A.ui.hud(g);
  if (process.env.SCREENSHOTS)
    fs.writeFileSync(
      path.join(process.env.SCREENSHOTS, "sprites-in-game.png"),
      canvas._canvas.toBuffer("image/webp"),
    );
  if (process.env.SCREENSHOTS) {
    const originalMap = g.map;
    for (const map of w.Rexx.data.maps) {
      g.map = map;
      A.engine.draw(g);
      fs.writeFileSync(
        path.join(process.env.SCREENSHOTS, "ground-" + map.id + ".png"),
        canvas._canvas.toBuffer("image/webp"),
      );
    }
    g.map = originalMap;
    g.alertLife = 0;
    const dropTypes = [
      "xp",
      "xp",
      "xp",
      "xp",
      "heal",
      "coin",
      "magnet",
      "bomb",
      "energy",
      "chest",
    ];
    dropTypes.forEach((type, index) =>
      w.Rexx.Pickup.spawn(
        g,
        g.player.x - 180 + (index % 5) * 90,
        g.player.y + 80 + Math.floor(index / 5) * 70,
        type,
        [1, 5, 10, 40][index] || 1,
      ),
    );
    A.engine.draw(g);
    fs.writeFileSync(
      path.join(process.env.SCREENSHOTS, "pickups-in-game.png"),
      canvas._canvas.toBuffer("image/webp"),
    );
    g.pickups.each((p) => g.pickups.release(p));
  }
  g.openChest(1);
  assert.equal(g.state, "chest");
  assert.equal(A.ui.root.querySelectorAll(".chest-sprite canvas").length, 3);
  assert.ok(A.ui.root.querySelectorAll(".chest-rewards .card").length > 0);
  g.resumeChest();
  assert.equal(g.state, "playing");
  w.eval(fs.readFileSync(path.join(__dirname, "scenarios.js"), "utf8"));
  for (const map of w.Rexx.data.maps) {
    for (const index of map.enemies) {
      const entity = {
        id: "e" + index,
        data: w.Rexx.data.enemies[index],
        r: 18,
        x: 60,
        y: 60,
        uid: index,
        status: {},
        elite: false,
      };
      const match = A.enemySprites.match(entity, map.id);
      assert.equal(match.sheet.id, map.id);
      const testContext = createCanvas(120, 120).getContext("2d");
      assert.equal(A.enemySprites.draw(testContext, entity, 1, map.id), true);
    }
    const boss = {
      id: "b" + map.boss,
      boss: true,
      data: w.Rexx.data.bosses[map.boss],
      r: 45,
      x: 80,
      y: 80,
      status: {},
      elite: true,
    };
    assert.equal(A.enemySprites.match(boss, map.id).sheet.id, "bosses");
  }
  const regression = w.runRexxTests();
  for (const r of regression) assert.ok(r.pass, r.name + " " + r.error);
  w.eval(fs.readFileSync(path.join(__dirname, "balance-scenarios.js"), "utf8"));
  w.captureBalance = (name) => {
    if (process.env.SCREENSHOTS)
      fs.writeFileSync(
        path.join(process.env.SCREENSHOTS, name + ".webp"),
        canvas._canvas.toBuffer("image/webp"),
      );
  };
  const balance = w.runBalanceTests();
  for (const result of balance)
    assert.ok(result.pass, result.name + " " + result.error);
  assert.equal(consoleErrors.length, 0, consoleErrors.join("\n"));
  const report = {
    consoleErrors: consoleErrors.length,
    balanceGroups: balance.length,
    directionalAgentSprites: 48,
    eightWayMovementAndIdle: true,
    webpDecoded: true,
    weaponSprites: 15,
    weaponUiAndProjectiles: true,
    pickupSprites: 12,
    chestFramesAndResume: true,
    scenerySprites: sceneryFrames,
    sceneryPlacementAndCulling: true,
    groundTexturesLoaded: groundReady.length,
    mirroredSeamsMatch: true,
    missingGroundFallback: true,
    atlasLoaded: true,
    enemyAtlasesLoaded: enemyReady.length,
    enemyAndBossFrames: enemyFrames,
    allFiveRegionsMatched: true,
    transparentBackground: true,
    validFrames: 24,
    distinctWalkingFrames: true,
    menuPortraits: 6,
    movementAndIdle: true,
    regressionGroups: regression.length,
    allPassed: true,
    environment: "JSDOM + native Canvas; not a real-browser visual test",
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.REPORT_PATH)
    fs.writeFileSync(process.env.REPORT_PATH, JSON.stringify(report, null, 2));
  clearTimeout(watchdog);
  dom.window.close();
})().catch((e) => {
  clearTimeout(watchdog);
  console.error(e);
  process.exit(1);
});
