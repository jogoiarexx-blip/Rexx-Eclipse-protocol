Rexx.UI.prototype.result = function (win) {
  this.screen = "result";
  this.hudRoot.classList.add("hidden");
  let g = this.app.game,
    p = g.player,
    top = [...p.weapons].sort((a, b) => b.damage - a.damage)[0],
    b = this.modal(
      win ? "EXTRAÇÃO CONCLUÍDA" : "SINAL INTERROMPIDO",
      win ? "ECLIPSE CONTIDO" : "O Core lembra de você.",
      win
        ? "A entidade caiu. Esta realidade tem um amanhã."
        : "Toda tentativa deixa energia para a próxima missão.",
    );
  b.innerHTML = `<div class="result-grid">${Object.entries({
    Sobrevivência: Rexx.util.time(g.time),
    Nível: p.level,
    Eliminações: Rexx.util.fmt(g.stats.kills),
    Chefes: g.stats.bosses,
    "Dano total": Rexx.util.fmt(g.stats.damage),
    "XP coletado": Rexx.util.fmt(p.totalXP),
    "Moedas recebidas": "◉ " + g.reward,
    "Arma dominante": Rexx.data.weapons.find((w) => w.id === top.id).name,
    "Dano da arma": Rexx.util.fmt(top.damage),
    "Recorde da região": Rexx.util.time(
      this.app.save.records[g.map.id + "-" + g.difficulty.name],
    ),
  })
    .map(
      ([k, v]) =>
        `<div><span class="micro">${k}</span><strong>${v}</strong></div>`,
    )
    .join(
      "",
    )}</div>${g.unlocks.length ? '<p class="accent">DESBLOQUEADO · ' + g.unlocks.join(" · ") + "</p>" : ""}${g.newAchievements.length ? '<p class="accent">CONQUISTAS · ' + g.newAchievements.map((a) => a.name + " (+" + a.reward + "◉)").join(" · ") + "</p>" : ""}`;
  let actions = document.createElement("div");
  actions.className = "result-actions";
  actions.append(
    this.button(
      "JOGAR NOVAMENTE",
      () =>
        this.app.start(
          p.character.id,
          g.map.id,
          Rexx.data.difficulties.indexOf(g.difficulty),
        ),
      "primary",
    ),
    this.button("MENU PRINCIPAL", () => this.menu()),
  );
  b.append(actions);
};
