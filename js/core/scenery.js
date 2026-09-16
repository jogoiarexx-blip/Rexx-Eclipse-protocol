Rexx.Scenery = class {
  constructor(basePath = "assets/images/scenery/") {
    this.atlas = window.REXX_SCENERY_ATLAS;
    this.image = new Image();
    this.ready = false;
    this.cell = 280;
    this.layouts = new WeakMap();
    this.loaded = new Promise((resolve) => {
      this.image.onload = () => {
        this.ready =
          this.image.width === this.atlas.width &&
          this.image.height === this.atlas.height;
        resolve(this.ready);
      };
      this.image.onerror = () => resolve(false);
      this.image.src = basePath + this.atlas.image;
    });
  }
  // Integer hash keeps positions stable without affecting combat randomness.
  hash(x, y, seed) {
    let n = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ seed;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  placement(g, col, row) {
    const seed = (g.map.boss + 1) * 7919;
    if (this.hash(col, row, seed) < 0.24) return null;
    const x = col * this.cell + 70 + this.hash(col, row, seed + 1) * 140;
    const y = row * this.cell + 70 + this.hash(col, row, seed + 2) * 140;
    if (x < 100 || y < 100 || x > Rexx.C.world - 100 || y > Rexx.C.world - 100)
      return null;
    const center = Rexx.C.world / 2;
    if (Math.hypot(x - center, y - center) < 180) return null;
    for (const o of g.objectives)
      if (Math.hypot(x - o.x, y - o.y) < 180) return null;
    return {
      x,
      y,
      index: Math.floor(this.hash(col, row, seed + 3) * 4),
      scale: 0.8 + this.hash(col, row, seed + 4) * 0.45,
    };
  }
  draw(c, g, left, top, right, bottom) {
    if (!this.ready) return 0;
    const frames = this.atlas.maps[g.map.id];
    if (!frames) return 0;
    let maps = this.layouts.get(g);
    if (!maps) this.layouts.set(g, (maps = new Map()));
    let layout = maps.get(g.map.id);
    const columns = Math.ceil(Rexx.C.world / this.cell);
    if (!layout) {
      layout = new Array(columns * columns);
      for (let row = 0; row < columns; row++)
        for (let col = 0; col < columns; col++)
          layout[row * columns + col] = this.placement(g, col, row);
      maps.set(g.map.id, layout);
    }
    let count = 0;
    c.save();
    for (
      let row = Math.max(0, Math.floor(top / this.cell));
      row <= Math.min(columns - 1, Math.floor(bottom / this.cell));
      row++
    ) {
      for (
        let col = Math.max(0, Math.floor(left / this.cell));
        col <= Math.min(columns - 1, Math.floor(right / this.cell));
        col++
      ) {
        const p = layout[row * columns + col];
        if (!p) continue;
        const f = frames[p.index],
          size = f.size * p.scale;
        const scale = size / Math.max(f.w, f.h);
        const dist = Math.hypot(p.x - g.player.x, p.y - g.player.y);
        const light = 0.96 + Math.sin((g.time || 0) * 1.6 + p.x * 0.03) * 0.04;
        c.globalAlpha =
          (0.34 + Math.min(1, Math.max(0, (dist - 50) / 95)) * 0.5) * light;
        c.drawImage(
          this.image,
          f.x,
          f.y,
          f.w,
          f.h,
          p.x - (f.w * scale) / 2,
          p.y - (f.h * scale) / 2,
          f.w * scale,
          f.h * scale,
        );
        count++;
      }
    }
    c.restore();
    return count;
  }
};
