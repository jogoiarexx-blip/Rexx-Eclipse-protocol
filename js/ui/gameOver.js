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
        : g.difficulty.id === "easy"
          ? "Modo Fácil: nenhuma moeda permanente concedida."
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

Rexx.UI.prototype.demonResult = function () {
  this.screen = "demonResult";
  this.hudRoot.classList.add("hidden");
  const g = this.app.game;
  const b = this.modal(
    "A FENDA ESTÁ RINDO",
    "VOCÊ É UM NOOB!",
    "Volte e tente em uma dificuldade maior.",
  );
  this.root.classList.add("demon-result");
  const info = document.createElement("p");
  info.textContent = `Tempo: ${Rexx.util.time(g.time)} · Nível ${g.player.level} · Moedas permanentes: 0`;
  const actions = document.createElement("div");
  actions.className = "result-actions";
  actions.append(
    this.button(
      "Tentar novamente",
      () => this.app.start(g.player.character.id, g.map.id, "easy"),
      "primary",
    ),
    this.button("Selecionar dificuldade", () => {
      this.selectedCharacter = g.player.character.id;
      this.selectedMap = g.map.id;
      this.selectedDifficulty = 1;
      this.app.game = null;
      this.select();
    }),
    this.button("Menu principal", () => this.menu()),
  );
  b.append(info, actions);
};
