Rexx.SpatialHash = class {
  constructor(size = 96) {
    this.size = size;
    this.cells = new Map();
    this.used = [];
    this.result = [];
    this.maxRadius = 0;
  }
  clear() {
    for (const b of this.used) b.length = 0;
    this.used.length = 0;
    this.maxRadius = 0;
  }
  insert(o) {
    this.maxRadius = Math.max(this.maxRadius, o.r || 0);
    let k = Math.floor(o.x / this.size) + "," + Math.floor(o.y / this.size),
      b = this.cells.get(k);
    if (!b) {
      b = [];
      this.cells.set(k, b);
    }
    if (!b.length) this.used.push(b);
    b.push(o);
  }
  query(x, y, r) {
    const a = this.result;
    a.length = 0;
    const search = r + this.maxRadius;
    for (
      let i = Math.floor((x - search) / this.size);
      i <= Math.floor((x + search) / this.size);
      i++
    )
      for (
        let j = Math.floor((y - search) / this.size);
        j <= Math.floor((y + search) / this.size);
        j++
      ) {
        const b = this.cells.get(i + "," + j);
        if (b)
          for (const o of b)
            if (o.active && (o.x - x) ** 2 + (o.y - y) ** 2 <= (r + o.r) ** 2)
              a.push(o);
      }
    return a;
  }
};

// Earliest collision along a moving circle, including initial overlap.
Rexx.sweepCircle = function (x, y, tx, ty, cx, cy, radius) {
  const dx = tx - x, dy = ty - y, ox = x - cx, oy = y - cy;
  const c = ox * ox + oy * oy - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (!a) return null;
  const b = ox * dx + oy * dy, discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / a;
  return t >= 0 && t <= 1 ? t : null;
};
