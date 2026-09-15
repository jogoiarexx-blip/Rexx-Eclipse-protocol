Rexx.Pool = class {
  constructor(factory, limit) {
    this.factory = factory;
    this.limit = limit;
    this.items = [];
    this.free = [];
  }
  get() {
    let o = this.free.pop();
    if (!o) {
      if (this.items.length >= this.limit) return null;
      o = this.factory();
      this.items.push(o);
    }
    o.active = true;
    return o;
  }
  release(o) {
    if (!o.active) return;
    o.active = false;
    this.free.push(o);
  }
  clear() {
    this.free.length = 0;
    for (const o of this.items) {
      o.active = false;
      this.free.push(o);
    }
  }
  each(fn) {
    for (const o of this.items) if (o.active) fn(o);
  }
  get count() {
    return this.items.length - this.free.length;
  }
};
