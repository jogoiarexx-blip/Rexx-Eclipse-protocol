(() => {
  const app = {
    save: Rexx.Save.load(),
    game: null,
    cost: (n) => Math.floor(70 * Math.pow(1.55, n)),
    persist() {
      if (!Rexx.Save.write(this.save)) this.ui?.toast(Rexx.Save.warning);
    },
    unlockedMaps() {
      return Rexx.data.maps
        .filter(
          (m, i) =>
            i === 0 || this.save.stats.mapWins[Rexx.data.maps[i - 1].id],
        )
        .map((m) => m.id);
    },
    start(character = "rexx", map = "zero", difficulty = 0) {
      let c = Rexx.data.characters.find((c) => c.id === character),
        m = Rexx.data.maps.find((m) => m.id === map),
        d =
          typeof difficulty === "string"
            ? Rexx.DIFFICULTIES[difficulty]
            : Rexx.data.difficulties[difficulty];
      if (
        !c?.test(this.save.stats) ||
        !this.unlockedMaps().includes(map) ||
        !d ||
        this.save.stats.wins < d.wins
      )
        return;
      this.audio.init();
      this.game = new Rexx.Game(this, c, m, d);
      this.ui.hide();
      this.ui.tick = 0;
    },
    pause() {
      if (!this.game) return;
      if (
        ["playing", "portal", "demonDeath", "demonVictory"].includes(
          this.game.state,
        )
      ) {
        this.game.resumeState = this.game.state;
        this.game.state = "paused";
        this.ui.pause();
      } else if (this.game.state === "paused") {
        if (this.ui.screen === "settings") this.ui.pause();
        else {
          this.game.state = this.game.resumeState || "playing";
          this.ui.hide();
        }
      }
    },
  };
  Rexx.app = app;
  app.audio = new Rexx.Audio();
  app.sprites = new Rexx.Sprites();
  app.enemySprites = new Rexx.EnemySprites();
  app.ground = new Rexx.Ground();
  app.scenery = new Rexx.Scenery();
  app.pickupSprites = new Rexx.PickupSprites();
  app.weaponSprites = new Rexx.WeaponSprites();
  app.input = new Rexx.Input(() => app.pause());
  app.ui = new Rexx.UI(app);
  app.engine = new Rexx.Engine(app, document.getElementById("game"));
  app.ui.menu();
  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      ["playing", "portal", "demonDeath", "demonVictory"].includes(
        app.game?.state,
      )
    )
      app.pause();
  });
  window.addEventListener("beforeunload", () => app.persist());
})();
