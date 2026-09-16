// Original synthesized soundtrack: no download, external asset or codec required.
Rexx.Audio = class {
  constructor() {
    this.ctx = null;
    this.mode = "menu";
    this.next = 0;
    this.beat = 0;
  }
  init() {
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.resume();
    } catch {}
  }
  tone(f, d = 0.12, type = "sine", v = 0.12, music = false) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const s = Rexx.app.save.settings,
      vol = s.master * (music ? s.music : s.sfx) * v;
    if (vol <= 0) return;
    let o = this.ctx.createOscillator(),
      g = this.ctx.createGain(),
      t = this.ctx.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (!music)
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f * 0.5), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(t + d + 0.02);
  }
  play(id) {
    if (id === "threat") {
      this.tone(48, 0.9, "sawtooth", 0.13);
      this.tone(73, 0.7, "triangle", 0.1);
      return;
    }
    if (id === "demonLaugh") {
      this.tone(95, 0.28, "sawtooth", 0.12);
      this.tone(130, 0.65, "triangle", 0.11);
      return;
    }
    let f =
      {
        shot: 520,
        hit: 160,
        hurt: 70,
        level: 880,
        chest: 1100,
        evolve: 1500,
        boss: 55,
        win: 1320,
        lose: 95,
        ui: 380,
        explosion: 45,
      }[id] || 300;
    let now = performance.now();
    if (id === "hit" || id === "shot") {
      if (now - (this.lastFx || 0) < 65) return;
      this.lastFx = now;
    }
    this.tone(
      f,
      id === "evolve" ? 0.7 : 0.13,
      id === "explosion" ? "sawtooth" : "triangle",
      id === "shot" ? 0.035 : 0.15,
    );
  }
  update() {
    if (!this.ctx) return;
    let t = this.ctx.currentTime;
    if (t < this.next) return;
    this.next =
      t + (this.mode === "boss" ? 0.22 : this.mode === "menu" ? 0.52 : 0.36);
    const scales = [
      [55, 65.4, 82.4, 73.4],
      [49, 58.3, 73.4, 65.4],
      [61.7, 73.4, 92.5, 82.4],
      [43.65, 51.9, 65.4, 58.3],
      [41.2, 49, 61.7, 55],
    ];
    let notes = scales[Rexx.app?.game?.map?.boss || 0],
      f = notes[Math.floor(this.beat / 8) % 4];
    this.tone(f * (this.beat % 4 === 0 ? 1 : 2), 0.42, "sine", 0.12, true);
    if (this.beat % 2 === 0)
      this.tone(f * [4, 6, 8, 6][this.beat % 4], 0.22, "triangle", 0.035, true);
    this.beat++;
  }
};
