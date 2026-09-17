Rexx.EasyFinale = class {
  constructor(g) {
    this.g = g;
    this.phase = "none";
    this.timer = 0;
    this.demon = null;
  }
  begin() {
    const g = this.g;
    if (
      g.difficulty.id !== "easy" ||
      !g.bossFinalDefeated ||
      this.phase !== "none"
    )
      return false;
    this.phase = "portal";
    this.timer = 0;
    g.state = "portal";
    g.chestQueue = 0;
    g.app.ui.hide();
    g.projectiles.clear();
    g.zones.clear();
    this.portal = {
      x: Rexx.util.clamp(
        g.player.x + (g.player.x > Rexx.C.world / 2 ? -330 : 330),
        60,
        Rexx.C.world - 60,
      ),
      y: g.player.y,
    };
    g.camera.shake = 18;
    g.app.audio.play("threat");
    g.alert("O SINAL NÃO TERMINOU…", 3);
    return true;
  }
  killedPlayer(e) {
    if (this.phase !== "hunt") return;
    const g = this.g;
    this.demon = e;
    this.phase = "death";
    this.timer = 0;
    g.specialDeath = true;
    g.state = "demonDeath";
    g.player.moving = false;
    g.alertLife = 0;
    g.projectiles.clear();
    g.zones.clear();
    g.app.ui.hide();
    g.app.ui.hudRoot.classList.add("hidden");
    g.app.audio.play("demonLaugh");
    e.x = g.player.x + 65;
    e.y = g.player.y - 5;
    e.facing = -1;
    e.anim = "laugh";
  }
  defeated(e) {
    if (this.phase !== "hunt") return;
    this.demon = { ...e };
    this.phase = "victory";
    this.timer = 0;
    this.g.state = "demonVictory";
    this.g.app.audio.play("explosion");
  }
  update(dt) {
    const g = this.g;
    if (g.state === "paused" || (g.finalized && this.phase !== "deathHold"))
      return false;
    if (!["portal", "death", "victory", "deathHold"].includes(this.phase))
      return false;
    this.timer += dt;
    g.hurt = Math.max(0, g.hurt - dt);
    g.camera.update(g.player, dt);
    if (this.phase === "portal" && this.timer >= Rexx.ENCOUNTERS.portalDelay) {
      this.demon = Rexx.Demon.spawn(g);
      if (!this.demon) {
        const other = g.enemies.items.find((e) => e.active);
        if (other) g.enemies.release(other);
        this.demon = Rexx.Demon.spawn(g);
      }
      if (this.demon) {
        this.phase = "hunt";
        g.state = "playing";
        g.app.audio.mode = "boss";
        g.camera.shake = 25;
        g.alert(`CAÇADOR DA FENDA · ${Rexx.DEMON_CONFIG.hp} HP`, 3);
      }
    } else if (
      this.phase === "death" &&
      this.timer >= Rexx.ENCOUNTERS.deathScene
    ) {
      this.phase = "deathHold";
      g.finish(false, true);
    } else if (
      this.phase === "victory" &&
      this.timer >= Rexx.ENCOUNTERS.victoryScene
    ) {
      this.phase = "complete";
      g.finish(true);
    }
    return true;
  }
  drawWorld(c) {
    if (this.phase === "portal") {
      const p = this.portal;
      c.save();
      c.translate(p.x, p.y);
      c.scale(1, 0.55);
      c.rotate(this.timer * 2);
      c.fillStyle = "#13061b";
      c.strokeStyle = "#ff4169";
      c.lineWidth = 5;
      c.beginPath();
      c.arc(0, 0, 35 + this.timer * 12, 0, 7);
      c.fill();
      c.stroke();
      for (let i = 0; i < 6; i++) {
        c.rotate(Math.PI / 3);
        c.beginPath();
        c.moveTo(36, 0);
        c.lineTo(66, 12);
        c.lineTo(40, 19);
        c.stroke();
      }
      c.restore();
    }
    if (this.phase === "victory")
      Rexx.Demon.draw(c, this.demon, this.timer, "death");
  }
  drawScreen(c, w, h) {
    if (!["portal", "death", "deathHold"].includes(this.phase)) return;
    c.save();
    c.fillStyle = this.phase === "portal" ? "#0c021f44" : "#48071544";
    c.fillRect(0, 0, w, h);
    if (this.phase === "death" && this.timer > 1) {
      c.textAlign = "center";
      c.fillStyle = "#ffb0ba";
      c.font = `bold ${Math.min(54, w / 18)}px sans-serif`;
      c.fillText("VOCÊ É UM NOOB!", w / 2, h * 0.27);
      c.font = `${Math.min(22, w / 32)}px sans-serif`;
      c.fillStyle = "#fff0f0";
      c.fillText(
        "Volte e tente em uma dificuldade maior.",
        w / 2,
        h * 0.27 + 40,
      );
    }
    c.restore();
  }
};
