Rexx.WeaponSprites = class {
  constructor(basePath = "assets/images/weapons/") {
    this.atlas = window.REXX_WEAPON_ATLAS;
    this.source = basePath + this.atlas.image;
    this.image = new Image();
    this.ready = false;
    this.icons = new Map();
    this.loaded = new Promise((resolve) => {
      this.image.onload = () => {
        this.ready =
          this.image.width === this.atlas.width &&
          this.image.height === this.atlas.height;
        resolve(this.ready);
      };
      this.image.onerror = () => resolve(false);
      this.image.src = this.source;
    });
  }
  icon(id, size = 48) {
    const f = this.atlas.frames[id];
    if (!f || !this.ready)
      return Rexx.data.weapons.find((w) => w.id === id)?.icon || "◈";
    const key = id + ":" + size;
    if (this.icons.has(key)) return this.icons.get(key);
    const scale = size / Math.max(f.w, f.h),
      width = f.w * scale,
      height = f.h * scale;
    const html = `<span class="weapon-art" aria-hidden="true" style="position:relative;display:inline-block;vertical-align:middle;width:${size}px;height:${size}px"><span style="position:absolute;left:${(size - width) / 2}px;top:${(size - height) / 2}px;width:${width}px;height:${height}px;background-image:url('${this.source}');background-size:${this.atlas.width * scale}px ${this.atlas.height * scale}px;background-position:${-f.x * scale}px ${-f.y * scale}px;background-repeat:no-repeat"></span></span>`;
    this.icons.set(key, html);
    return html;
  }
  draw(c, id, x, y, size, angle = 0) {
    const f = this.atlas.frames[id];
    if (!this.ready || !f) return false;
    const scale = size / Math.max(f.w, f.h);
    c.save();
    c.translate(x, y);
    if (angle) c.rotate(angle);
    c.drawImage(
      this.image,
      f.x,
      f.y,
      f.w,
      f.h,
      (-f.w * scale) / 2,
      (-f.h * scale) / 2,
      f.w * scale,
      f.h * scale,
    );
    c.restore();
    return true;
  }
  projectile(c, p) {
    if (p.hostile || (p.weapon !== "disc" && p.weapon !== "boomerang"))
      return false;
    return this.draw(c, p.weapon, p.x, p.y, Math.max(18, p.r * 3), p.age * 10);
  }
};
