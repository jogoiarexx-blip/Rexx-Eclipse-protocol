Rexx.Input = class {
  constructor(onPause) {
    this.keys = new Set();
    this.padPause = false;
    window.addEventListener("keydown", (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      )
        e.preventDefault();
      this.keys.add(e.key.toLowerCase());
      if (e.key === "Escape" && !e.repeat) onPause();
    });
    window.addEventListener("keyup", (e) =>
      this.keys.delete(e.key.toLowerCase()),
    );
    window.addEventListener("blur", () => {
      this.keys.clear();
      if (
        ["playing", "portal", "demonDeath", "demonVictory"].includes(
          Rexx.app?.game?.state,
        )
      )
        onPause();
    });
  }
  axis() {
    let x =
        Number(this.keys.has("d") || this.keys.has("arrowright")) -
        Number(this.keys.has("a") || this.keys.has("arrowleft")),
      y =
        Number(this.keys.has("s") || this.keys.has("arrowdown")) -
        Number(this.keys.has("w") || this.keys.has("arrowup"));
    const pad = navigator.getGamepads?.()[0];
    if (pad) {
      if (Math.abs(pad.axes[0]) > 0.18) x = pad.axes[0];
      if (Math.abs(pad.axes[1]) > 0.18) y = pad.axes[1];
      let p = pad.buttons[9]?.pressed;
      if (p && !this.padPause) Rexx.app.pause();
      this.padPause = p;
    }
    let n = Math.max(1, Math.hypot(x, y));
    return { x: x / n, y: y / n };
  }
};
