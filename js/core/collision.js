Rexx.SpatialHash = class {
  constructor(size = 96) {
    this.size = size;
    this.cells = new Map();
    this.used = [];
    this.result = [];
  }
  clear() {
    for (const b of this.used) b.length = 0;
    this.used.length = 0;
  }
  insert(o) {
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
    for (
      let i = Math.floor((x - r) / this.size);
      i <= Math.floor((x + r) / this.size);
      i++
    )
      for (
        let j = Math.floor((y - r) / this.size);
        j <= Math.floor((y + r) / this.size);
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
