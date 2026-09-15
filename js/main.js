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
        d = Rexx.data.difficulties[difficulty];
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
      if (this.game.state === "playing") {
        this.game.state = "paused";
        this.ui.pause();
      } else if (this.game.state === "paused") {
        if (this.ui.screen === "settings") this.ui.pause();
        else {
          this.game.state = "playing";
          this.ui.hide();
        }
      }
    },
  };
  Rexx.app = app;
  app.audio = new Rexx.Audio();
  app.sprites = new Rexx.Sprites();
  app.input = new Rexx.Input(() => app.pause());
  app.ui = new Rexx.UI(app);
  app.engine = new Rexx.Engine(app, document.getElementById("game"));
  app.ui.menu();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && app.game?.state === "playing") app.pause();
  });
  window.addEventListener("beforeunload", () => app.persist());
})();
