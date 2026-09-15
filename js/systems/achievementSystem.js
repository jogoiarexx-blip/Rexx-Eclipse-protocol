(() => {
  let a = [];
  const add = (id, name, desc, target, value, reward = 60) =>
    a.push({ id, name, desc, target, value, reward });
  [100, 500, 1000, 2500, 5000, 10000].forEach((n, i) =>
    add(
      "kills" + i,
      [
        "Primeiro sinal",
        "Linha de frente",
        "Mil ecos",
        "Sem recuar",
        "Quebra de cerco",
        "Extermínio dimensional",
      ][i],
      `Elimine ${n} inimigos no total.`,
      n,
      (s) => s.kills,
      50 + i * 30,
    ),
  );
  [300, 600, 900, 1200, 1500, 1800].forEach((n, i) =>
    add(
      "time" + i,
      [
        "Ainda aqui",
        "Dez minutos no escuro",
        "Além do limite",
        "Persistência",
        "Última hora",
        "Protocolo completo",
      ][i],
      `Sobreviva ${n / 60} minutos em uma partida.`,
      n,
      (s) => s.bestTime,
      70 + i * 35,
    ),
  );
  [10, 20, 30, 50].forEach((n, i) =>
    add(
      "level" + i,
      "Sincronia " + (i + 1),
      `Alcance o nível ${n}.`,
      n,
      (s) => s.bestLevel,
      80 + i * 30,
    ),
  );
  [1, 5, 15].forEach((n, i) =>
    add(
      "boss" + i,
      "Caçador de entidades " + (i + 1),
      `Derrote ${n} chefe(s).`,
      n,
      (s) => s.bosses,
      120 + i * 80,
    ),
  );
  [1, 3, 10].forEach((n, i) =>
    add(
      "win" + i,
      "Extração " + (i + 1),
      `Vença ${n} partida(s).`,
      n,
      (s) => s.wins,
      200 + i * 100,
    ),
  );
  [1, 5, 15].forEach((n, i) =>
    add(
      "evo" + i,
      "Transcendência " + (i + 1),
      `Evolua ${n} arma(s).`,
      n,
      (s) => s.evolved,
      150 + i * 60,
    ),
  );
  [5, 25, 75].forEach((n, i) =>
    add(
      "chest" + i,
      "Arqueólogo " + (i + 1),
      `Abra ${n} baús.`,
      n,
      (s) => s.chests,
      75 + i * 50,
    ),
  );
  Rexx.data.maps.forEach((m) =>
    add(
      "map" + m.id,
      "Libertação: " + m.name,
      `Derrote a entidade de ${m.name}.`,
      1,
      (s) => s.mapWins[m.id] || 0,
      250,
    ),
  );
  Rexx.data.achievements = a;
  Rexx.Achievements = {
    check(app) {
      const fresh = [];
      for (const a of Rexx.data.achievements)
        if (
          !app.save.achievements.includes(a.id) &&
          a.value(app.save.stats) >= a.target
        ) {
          app.save.achievements.push(a.id);
          app.save.coins += a.reward;
          fresh.push(a);
        }
      return fresh;
    },
  };
})();
