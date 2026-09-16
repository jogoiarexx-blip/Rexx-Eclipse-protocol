Rexx.PickupSprites = class {
  constructor(basePath = "assets/images/pickups/") {
    this.atlas = window.REXX_PICKUP_ATLAS;
    this.ready = false;
    this.image = new Image();
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
  key(p) {
    if (p.type !== "xp") return p.type;
    return p.value >= 40
      ? "xp_special"
      : p.value >= 10
        ? "xp_large"
        : p.value >= 5
          ? "xp_medium"
          : "xp_small";
  }
  draw(c, p) {
    if (!this.ready) return false;
    const f = this.atlas.frames[this.key(p)];
    if (!f) return false;
    const scale = f.size / Math.max(f.w, f.h);
    const bob =
      p.type === "xp" ? 0 : Math.sin((p.age || 0) * 3 + p.x * 0.01) * 2;
    c.drawImage(
      this.image,
      f.x,
      f.y,
      f.w,
      f.h,
      p.x - (f.w * scale) / 2,
      p.y - (f.h * scale) / 2 + bob,
      f.w * scale,
      f.h * scale,
    );
    return true;
  }
  chestElement() {
    if (!this.ready) return null;
    const container = document.createElement("div");
    container.className = "chest-sprite";
    container.setAttribute("role", "img");
    container.setAttribute("aria-label", "Baú Eclipse se abrindo");
    const frames = ["chest", "chest_half", "chest_open"].map(
      (key) => this.atlas.frames[key],
    );
    const scale = Math.min(
      200 / Math.max(...frames.map((f) => f.w)),
      150 / Math.max(...frames.map((f) => f.h)),
    );
    for (const f of frames) {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 175;
      canvas.setAttribute("aria-hidden", "true");
      canvas
        .getContext("2d")
        .drawImage(
          this.image,
          f.x,
          f.y,
          f.w,
          f.h,
          (240 - f.w * scale) / 2,
          165 - f.h * scale,
          f.w * scale,
          f.h * scale,
        );
      container.append(canvas);
    }
    return container;
  }
};
