// Region-specific sprite atlases; source rectangles use actual image coordinates.
Rexx.EnemySprites = class {
  constructor() {
    this.sheets = window.REXX_ENEMY_ATLAS?.sheets || [];
    this.images = {};
    this.loaded = Promise.all(
      this.sheets.map(
        (sheet) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              if (
                image.naturalWidth === sheet.width &&
                image.naturalHeight === sheet.height
              )
                this.images[sheet.id] = image;
              resolve(!!this.images[sheet.id]);
            };
            image.onerror = () => resolve(false);
            image.src = "assets/images/enemies/" + sheet.image;
          }),
      ),
    );
  }
  match(entity, mapId) {
    const id = entity.id || entity.data?.id;
    const region = this.sheets.find(
      (s) => s.id === (entity.boss ? "bosses" : mapId),
    );
    const key =
      entity.elite && !entity.boss && region?.animations[id + "_elite"]
        ? id + "_elite"
        : id;
    const sheet = region?.animations[key]
      ? region
      : this.sheets.find((s) => s.animations[key]);
    if (!sheet || !this.images[sheet.id]) return null;
    return {
      sheet,
      animation: sheet.animations[key],
      image: this.images[sheet.id],
    };
  }
  draw(context, entity, time, mapId) {
    const match = this.match(entity, mapId);
    if (!match) return false;
    const { animation, image } = match;
    const frozen = entity.status?.freeze || entity.status?.stun;
    const frame =
      animation.frames[
        frozen
          ? 0
          : Math.floor(time * animation.fps + (entity.uid || 0)) %
            animation.frames.length
      ];
    const size = entity.r * (entity.boss ? 3.25 : 3.2);
    const scale = Math.min(
      size / animation.maxHeight,
      size / animation.maxWidth,
    );
    context.save();
    context.translate(entity.x, entity.y);
    context.fillStyle = "#0005";
    context.beginPath();
    context.ellipse(
      0,
      entity.r * 0.7,
      entity.r * 0.85,
      entity.r * 0.3,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
    if (entity.flash > 0) context.globalAlpha = 0.55;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      (-frame.w * scale) / 2,
      (-frame.h * scale) / 2,
      frame.w * scale,
      frame.h * scale,
    );
    context.globalAlpha = 1;
    if (entity.elite || frozen || entity.shield > 0) {
      context.strokeStyle = frozen
        ? "#bcf7ff"
        : entity.shield > 0
          ? "#75bdff"
          : entity.data.color;
      context.lineWidth = entity.boss ? 3 : 1.5;
      context.beginPath();
      context.ellipse(
        0,
        entity.r * 0.7,
        entity.r + 7,
        entity.r * 0.45 + 4,
        0,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }
    if (entity.elite && !entity.boss) {
      context.fillStyle = "#122530";
      context.fillRect(-24, -size / 2 - 8, 48, 4);
      context.fillStyle = entity.data.color;
      context.fillRect(
        -24,
        -size / 2 - 8,
        48 * Math.max(0, entity.hp / entity.maxHP),
        4,
      );
    }
    context.restore();
    return true;
  }
};
