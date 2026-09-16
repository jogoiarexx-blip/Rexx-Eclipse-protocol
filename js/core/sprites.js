// PNG atlas loaded directly, including file://. Combat never depends on image loading.
Rexx.Sprites = class {
  constructor() {
    this.rows = { rexx: 0, nyra: 1, brakk: 2, suri: 3, ilya: 4, null: 5 };
    this.ready = false;
    this.image = new Image();
    this.loaded = new Promise((resolve) => {
      this.image.onload = () => {
        this.ready =
          this.image.naturalWidth === 1024 && this.image.naturalHeight === 1536;
        resolve(this.ready);
      };
      this.image.onerror = () => resolve(false);
    });
    this.image.src = "assets/images/zone-zero/agents-walk.webp";
    this.directionAtlas = window.REXX_AGENT_DIRECTIONS;
    this.directionImage = new Image();
    this.directionReady = false;
    const legacyLoaded = this.loaded;
    const directionLoaded = new Promise((resolve) => {
      this.directionImage.onload = () => {
        this.directionReady =
          this.directionImage.width === this.directionAtlas.width &&
          this.directionImage.height === this.directionAtlas.height;
        resolve(this.directionReady);
      };
      this.directionImage.onerror = () => resolve(false);
      this.directionImage.src =
        "assets/images/agents/" + this.directionAtlas.image;
    });
    this.loaded = Promise.all([legacyLoaded, directionLoaded]).then((results) =>
      results.every(Boolean),
    );
  }
  direction(player) {
    return (
      ((Math.round((player.angle ?? Math.PI / 2) / (Math.PI / 4)) % 8) + 8) % 8
    );
  }
  frame(player) {
    return player.moving ? Math.floor((player.walkTime || 0) * 8) % 4 : 0;
  }
  drawAgent(context, player) {
    if (this.directionReady) {
      const animation = this.directionAtlas.characters[player.character.id];
      if (!animation) return false;
      const f = animation.frames[this.direction(player)];
      const scale = 57 / animation.maxHeight;
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;
      const phase = (player.walkTime || 0) * 12;
      const hop =
        player.moving && !reduced ? Math.abs(Math.sin(phase)) * 1.8 : 0;
      const breath =
        !player.moving && !reduced
          ? Math.sin((player.animationTime || 0) * 2.4) * 0.007
          : 0;
      context.save();
      context.translate(0, -hop);
      if (player.moving && !reduced) context.rotate(Math.sin(phase) * 0.025);
      context.scale(1, 1 + breath);
      context.drawImage(
        this.directionImage,
        f.x,
        f.y,
        f.w,
        f.h,
        (-f.w * scale) / 2,
        25 - f.h * scale,
        f.w * scale,
        f.h * scale,
      );
      context.restore();
      return true;
    }
    const row = this.rows[player.character.id];
    if (!this.ready || row === undefined) return false;
    const frame = this.frame(player);
    context.save();
    context.imageSmoothingEnabled = false;
    // The source sheet is south-facing; leftward travel mirrors the animation.
    if (player.facingLeft) context.scale(-1, 1);
    context.drawImage(
      this.image,
      frame * 256,
      row * 256,
      256,
      256,
      -36,
      -41,
      72,
      72,
    );
    context.restore();
    return true;
  }
};
