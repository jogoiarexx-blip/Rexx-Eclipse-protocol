"use strict";
(() => {
  const $ = (id) => document.getElementById(id), canvas = $("preview"), c = canvas.getContext("2d");
  const sprites = new Rexx.DemonSprites();
  let elapsed = 0, facing = 1, paused = false, last = 0, ready = false;
  const toggle = () => { paused = !paused; $("pause").textContent = paused ? "Continuar" : "Pausar"; };
  $("pause").onclick = toggle;
  $("flip").onclick = () => facing *= -1;
  $("restart").onclick = () => elapsed = 0;
  $("mode").onchange = () => elapsed = 0;
  $("step").onclick = () => { if (!paused) toggle(); elapsed += 1 / sprites.fps[$("mode").value]; };
  document.addEventListener("keydown", (event) => {
    if (/INPUT|SELECT|BUTTON/.test(event.target.tagName)) return;
    if (event.code === "ArrowLeft") facing = -1;
    if (event.code === "ArrowRight") facing = 1;
    if (event.code === "Space") { event.preventDefault(); toggle(); }
  });
  sprites.loaded.then((ok) => { ready = ok; if (!ok) $("status").textContent = "Não foi possível carregar assets/images/demon/hunter.webp."; });
  function draw(now) {
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    if (!paused && ready && !document.hidden) elapsed += dt * Number($("speed").value);
    c.fillStyle = $("background").value; c.fillRect(0, 0, 1000, 480);
    c.save(); c.translate(500, 300); c.scale(2.5, 2.5);
    const mode = $("mode").value;
    sprites.draw(c, { x:0, y:0, facing, anim:mode, animTime:elapsed, runTime:elapsed }, elapsed, mode);
    if ($("hitbox").checked) {
      c.strokeStyle = "#71f6c3"; c.lineWidth = .7; c.beginPath(); c.arc(0, 0, 33, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = "#fff"; c.beginPath(); c.moveTo(-5,0); c.lineTo(5,0); c.moveTo(0,-5); c.lineTo(0,5); c.stroke();
    }
    c.restore();
    if (ready) $("status").textContent = `Frame ${sprites.frame(mode, elapsed)+1}/4 · ${facing > 0 ? "Direita" : "Esquerda espelhada"} · 5.000 HP · 100 de dano`;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
