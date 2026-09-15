Rexx.UI.prototype.modal = function (kicker, title, desc) {
  this.root.className = "overlay";
  this.root.innerHTML = `<section class="modal"><span class="eyebrow">${kicker}</span><h2>${title}</h2><p>${desc}</p><div class="modal-body"></div></section>`;
  return this.root.querySelector(".modal-body");
};
Rexx.UI.prototype.level = function (options) {
  this.screen = "level";
  const b = this.modal(
    "CORE SINCRONIZADO",
    "Escolha sua evolução",
    `Nível ${this.app.game.player.level} · A ação está pausada. Combine armas e módulos.`,
  );
  b.classList.add("upgrade-options");
  for (const o of options) {
    let d = this.card(
      b,
      `<span class="micro" style="color:${o.rarity.color}">${o.rarity.name.toUpperCase()} · ${o.kind === "weapon" ? "ARMA" : "MÓDULO"}</span><span class="upgrade-icon" style="color:${o.rarity.color}">${o.icon}</span><h3>${o.name}</h3><span class="micro">NÍVEL ${o.level}</span><p>${o.desc}</p><small>Potência de raridade: ${o.rarity.mult.toFixed(2)}×</small>`,
    );
    d.style.borderColor = o.rarity.color + "80";
    d.append(
      this.button("INSTALAR →", () => this.app.game.choose(o), "primary"),
    );
  }
};
Rexx.UI.prototype.chest = function (rewards) {
  this.screen = "chest";
  const b = this.modal(
    "CACHE RECUPERADO",
    "Ecos de uma realidade perdida",
    "O Core decodificou novas possibilidades.",
  );
  b.innerHTML =
    '<div class="chest-animation">▣</div><div class="chest-rewards"></div>';
  for (const r of rewards)
    this.card(
      b.querySelector(".chest-rewards"),
      `<span class="item-icon">${r.icon}</span><h4>${r.name}</h4><p>${r.desc}</p>`,
    );
  b.append(
    this.button(
      "RECOLHER E CONTINUAR",
      () => this.app.game.resumeChest(),
      "primary",
    ),
  );
};
