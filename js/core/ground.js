// Ground is baked once per region; mirrored edges keep the repeated surface continuous.
Rexx.Ground = class {
  constructor(basePath = "assets/images/ground/") {
    this.tiles = new Map();
    this.patterns = new WeakMap();
    this.loaded = Promise.all(
      Rexx.data.maps.map(
        (map) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              const tile = document.createElement("canvas");
              const size = 512;
              tile.width = tile.height = size * 2;
              const c = tile.getContext("2d");
              for (let row = 0; row < 2; row++) {
                for (let col = 0; col < 2; col++) {
                  c.save();
                  c.translate(col ? size * 2 : 0, row ? size * 2 : 0);
                  c.scale(col ? -1 : 1, row ? -1 : 1);
                  c.drawImage(image, 0, 0, size, size);
                  c.restore();
                }
              }
              // A uniform tint preserves the visibility of combat telegraphs and pickups.
              c.fillStyle = map.bg;
              c.globalAlpha = 0.26;
              c.fillRect(0, 0, tile.width, tile.height);
              this.tiles.set(map.id, tile);
              resolve(true);
            };
            image.onerror = () => resolve(false);
            image.src = basePath + map.id + ".png";
          }),
      ),
    );
  }
  draw(c, map, left, top, right, bottom) {
    const tile = this.tiles.get(map.id);
    if (!tile) return false;
    let cache = this.patterns.get(c);
    if (!cache) this.patterns.set(c, (cache = new Map()));
    if (!cache.has(map.id)) cache.set(map.id, c.createPattern(tile, "repeat"));
    const pattern = cache.get(map.id);
    if (!pattern) return false;
    c.save();
    c.globalAlpha = 1;
    c.fillStyle = pattern;
    c.fillRect(left, top, right - left, bottom - top);
    c.restore();
    return true;
  }
};
