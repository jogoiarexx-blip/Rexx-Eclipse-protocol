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
    this.image.src = "assets/images/zone-zero/agents-walk.png";
  }
  frame(player) {
    return player.moving ? Math.floor((player.walkTime || 0) * 8) % 4 : 0;
  }
  drawAgent(context, player) {
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
