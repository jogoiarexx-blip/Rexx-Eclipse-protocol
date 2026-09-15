(() => {
  const rows = [
    ["damage", "Matriz de Impacto", "◆", "dano", 0.12],
    ["speed", "Botas de Fase", "»", "velocidade", 0.07],
    ["hp", "Coração Sintético", "♥", "HP máximo", 0.16],
    ["armor", "Placas Ômega", "⬡", "armadura", 1],
    ["area", "Lente de Horizonte", "◎", "área", 0.12],
    ["amount", "Ninho Mecânico", "⌘", "projéteis", 1],
    ["duration", "Ampulheta Nula", "◷", "duração", 0.14],
    ["cooldown", "Capacitor Dimensional", "ϟ", "redução de cooldown", 0.065],
    ["luck", "Dado Quântico", "⚄", "sorte", 0.16],
    ["xp", "Memória do Eclipse", "✦", "XP", 0.12],
    ["pickup", "Ímã de Fragmentos", "⊕", "coleta", 0.25],
    ["regen", "Célula Solar", "✚", "regeneração", 0.25],
    ["crit", "Olho Fractal", "◇", "chance crítica", 0.05],
    ["resist", "Malha Boreal", "❄", "resistência", 0.06],
  ];
  Rexx.data.passives = rows.map((r) => ({
    id: r[0],
    name: r[1],
    icon: r[2],
    label: r[3],
    value: r[4],
    max: 5,
  }));
  Rexx.data.rarities = [
    { name: "Comum", color: "#adc0cb", weight: 55, mult: 1 },
    { name: "Incomum", color: "#7fe4a1", weight: 27, mult: 1.12 },
    { name: "Raro", color: "#7ec9ff", weight: 12, mult: 1.3 },
    { name: "Épico", color: "#c897ff", weight: 5, mult: 1.55 },
    { name: "Lendário", color: "#ffd27e", weight: 1, mult: 1.9 },
  ];
  Rexx.data.permanent = [
    "hp",
    "damage",
    "armor",
    "speed",
    "regen",
    "xp",
    "luck",
    "area",
    "cooldown",
  ].map((id) => ({ ...Rexx.data.passives.find((p) => p.id === id), max: 10 }));
})();
