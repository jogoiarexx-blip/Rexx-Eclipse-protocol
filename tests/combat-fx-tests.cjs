const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { createCanvas } = require('@napi-rs/canvas');
const Rexx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/core/combatFX.js'), 'utf8'), { Rexx, Math });
const canvas = createCanvas(960, 480), c = canvas.getContext('2d');
c.fillStyle = '#0b1420'; c.fillRect(0, 0, 960, 480);
const app = { save: { settings: { quality: 'alta' } } };
const styles = ['drone', 'frost', 'rail', 'ghost', 'disc', 'boomerang'];
for (let i = 0; i < styles.length; i++) {
  const x = 95 + i * 150;
  c.fillStyle = '#a5bec9'; c.font = '16px sans-serif'; c.fillText(styles[i], x - 35, 50);
  for (let j = 0; j < 3; j++) {
    const p = { x, y: 95 + j * 55, age: .06 + j * .13, vx: 430, vy: -100 + j * 100,
      r: 6, weapon: styles[i], color: ['#89ffad','#b5eeff','#ffa973','#bca1ff','#ffa3b0','#76ffd1'][i], hostile: j === 2 };
    const before = JSON.stringify(p);
    Rexx.CombatFX.projectile(c, p, app);
    assert.equal(JSON.stringify(p), before, 'Rendering must not mutate projectile simulation');
  }
}
for (const low of [false, true]) {
 const y = low ? 360 : 290;
 Rexx.CombatFX.line(c, {x:40,y,tx:430,ty:y+20,color:'#89cfff',width:3,life:.12,max:.18},low);
 Rexx.CombatFX.line(c, {x:520,y,tx:910,ty:y+20,color:'#ff8899',width:12,life:.18,max:.25},low);
 Rexx.CombatFX.zone(c,{x:480,y:420,r:40,delay:.3,maxDelay:.65,weapon:'meteor',color:'#ffbe65',pull:true},1,low);
}
assert.equal(c.globalAlpha, 1, 'Effects restore canvas state');
fs.writeFileSync(process.env.FX_PREVIEW || '/tmp/rexx-combat-fx.webp', canvas.toBuffer('image/webp'));
console.log('Combat FX render checks passed: six projectile styles, hostile bullets, Tesla, laser, zones, quality modes and state isolation.');
