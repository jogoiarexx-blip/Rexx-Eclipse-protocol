const { JSDOM } = require("jsdom");
const { createCanvas, Image } = require("@napi-rs/canvas");
const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
(async () => {
  const root = path.resolve(__dirname, ".."),
    html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url: "https://rexx-sprites.test/",
    }),
    w = dom.window;
  w.innerWidth = 1280;
  w.innerHeight = 720;
  w.devicePixelRatio = 1;
  w.requestAnimationFrame = () => 0;
  w.navigator.getGamepads = () => [];
  w.Image = class extends Image {
    set src(value) {
      // Native test decoder misidentifies embedded SVG provenance thumbnails.
      // Ignore ancillary metadata only in this in-memory test decode. The
      // distributed PNG and its pixel data/provenance remain unchanged.
      const png = fs.readFileSync(path.join(root, value));
      const parts = [png.subarray(0, 8)];
      for (let offset = 8; offset < png.length;) {
        const length = png.readUInt32BE(offset),
          type = png.toString("ascii", offset + 4, offset + 8);
        if (["IHDR", "IDAT", "IEND", "PLTE", "tRNS"].includes(type))
          parts.push(png.subarray(offset, offset + length + 12));
        offset += length + 12;
      }
      super.src = Buffer.concat(parts);
    }
  };
  w.HTMLCanvasElement.prototype.getContext = function () {
    this._canvas ||= createCanvas(this.width, this.height);
    return this._canvas.getContext("2d");
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
      captures.push(c.toBuffer("image/png"));
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
  A.ui.hide();
  p.character = w.Rexx.data.characters[0];
  p.shield = 0;
  A.engine.draw(g);
  A.ui.hud(g);
  if (process.env.SCREENSHOTS)
    fs.writeFileSync(
      path.join(process.env.SCREENSHOTS, "sprites-in-game.png"),
      canvas._canvas.toBuffer("image/png"),
    );
  w.eval(fs.readFileSync(path.join(__dirname, "scenarios.js"), "utf8"));
  const regression = w.runRexxTests();
  for (const r of regression) assert.ok(r.pass, r.name + " " + r.error);
  const report = {
    atlasLoaded: true,
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
  dom.window.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
