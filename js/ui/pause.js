Rexx.UI.prototype.pause = function () {
  this.screen = "pause";
  let g = this.app.game,
    b = this.modal(
      "PROTOCOLO SUSPENSO",
      "Respire. A fenda pode esperar.",
      `${g.map.name} · ${Rexx.util.time(g.time)} · Nível ${g.player.level}`,
    );
  b.classList.add("pause-actions");
  b.append(
    this.button(
      "CONTINUAR",
      () => {
        g.state = "playing";
        this.hide();
      },
      "primary",
    ),
    this.button("Configurações", () => this.settings(() => this.pause())),
    this.button("Reiniciar missão", () => {
      g.finish(false);
      this.app.start(
        g.player.character.id,
        g.map.id,
        Rexx.data.difficulties.indexOf(g.difficulty),
      );
    }),
    this.button("Encerrar e voltar ao menu", () => {
      g.finish(false);
      this.menu();
    }),
  );
  let stats = document.createElement("div");
  stats.className = "pause-stats";
  stats.innerHTML = Object.entries(g.player.stats)
    .map(
      ([k, v]) =>
        `<span>${Rexx.statLabels[k] || k} <b>${Number.isInteger(v) ? v : v.toFixed(2)}</b></span>`,
    )
    .join("");
  b.append(stats);
};
