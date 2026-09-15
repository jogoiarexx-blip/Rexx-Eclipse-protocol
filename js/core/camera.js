Rexx.Camera = class {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.shake = 0;
    this.zoom = 1;
    this.event = 0;
  }
  update(p, dt) {
    const f = 1 - Math.exp(-9 * dt);
    this.x += (p.x - this.x) * f;
    this.y += (p.y - this.y) * f;
    this.shake = Math.max(0, this.shake - dt * 22);
    this.event = Math.max(0, this.event - dt);
    this.zoom += ((this.event > 0 ? 0.96 : 1) - this.zoom) * f;
  }
  apply(c, w, h) {
    const s = Rexx.app.save.settings.shake ? this.shake : 0;
    c.translate(
      w / 2 + (Math.random() - 0.5) * s,
      h / 2 + (Math.random() - 0.5) * s,
    );
    c.scale(this.zoom, this.zoom);
    c.translate(-this.x, -this.y);
  }
};
