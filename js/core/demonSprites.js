"use strict";
Rexx.DemonSprites = class {
  constructor() {
    this.image = new Image();
    this.ready = false;
    this.rows = { idle: 0, run: 1, attack: 2, hurt: 3, laugh: 4, death: 5 };
    this.fps = { idle: 4, run: 10, attack: 14, hurt: 50, laugh: 7, death: 4 };
    this.attackMasks = {
      1: [0,0, 304,0, 304,160, 256,195, 256,256, 0,256],
      2: [70,0, 256,0, 256,90, 318,90, 318,180, 256,180, 256,256, 0,256, 0,180, 45,140, 70,100],
      3: [65,0, 256,0, 256,256, 0,256, 0,185, 65,160],
    };
    this.loaded = new Promise((resolve) => {
      this.image.onload = () => {
        this.ready = this.image.width === 1024 && this.image.height === 1536;
        resolve(this.ready);
      };
      this.image.onerror = () => resolve(false);
      this.image.src = "assets/images/demon/hunter.webp";
    });
  }
  frame(mode, elapsed) {
    const index = Math.floor(Math.max(0, elapsed) * (this.fps[mode] || 4));
    return mode === "death" || mode === "attack" || mode === "hurt"
      ? Math.min(3, index) : index % 4;
  }
  draw(c, e, time, mode = e.anim) {
    if (!this.ready) return false;
    const elapsed = mode === "laugh" || mode === "death" ? time : mode === "run" ? (e.runTime ?? e.animTime ?? 0) : e.animTime || 0;
    const frame = this.frame(mode, elapsed), row = this.rows[mode] ?? 0;
    const scale = 0.52;
    c.save();
    c.translate(e.x, e.y);
    c.scale(e.facing < 0 ? -1 : 1, 1);
    // Constant anchor; source-space masks isolate poses that overlap nominal cells.
    c.translate(-128 * scale, -204 * scale);
    c.scale(scale, scale);
    let width = 256;
    let mask = null;
    if (mode === "attack" && frame === 1) {
      width = 304;
      mask = this.attackMasks[1];
    } else if (mode === "attack" && frame === 2) {
      width = 318;
      mask = this.attackMasks[2];
    } else if (mode === "attack" && frame === 3) {
      mask = this.attackMasks[3];
    }
    if (mask) {
      c.beginPath(); c.moveTo(mask[0], mask[1]);
      for (let i = 2; i < mask.length; i += 2) c.lineTo(mask[i], mask[i + 1]);
      c.closePath(); c.clip();
    }
    c.drawImage(this.image, frame * 256, row * 256, width, 256, 0, 0, width, 256);
    c.restore();
    return true;
  }
};
