const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const {createCanvas,Image} = require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
const Rexx={};
class LocalImage extends Image {set src(s){super.src=fs.readFileSync(path.join(root,s));}}
vm.runInNewContext(fs.readFileSync(path.join(root,'js/core/demonSprites.js'),'utf8'),{Rexx,Image:LocalImage,Math});
(async()=>{
 const sprites=new Rexx.DemonSprites();assert.equal(await sprites.loaded,true);
 const atlas=createCanvas(1024,1536),ac=atlas.getContext('2d');ac.drawImage(sprites.image,0,0);
 assert.equal(ac.getImageData(0,0,1,1).data[3],0,'Actual alpha, no painted checkerboard');
 const preview=createCanvas(768,720),pc=preview.getContext('2d');pc.fillStyle='#14303a';pc.fillRect(0,0,768,720);
 for(const [row,mode] of Object.keys(sprites.rows).entries()){
  for(let frame=0;frame<4;frame++){
   const elapsed=(frame+.1)/sprites.fps[mode];
   for(const face of [1,-1]){
    const c=createCanvas(192,144),ctx=c.getContext('2d');
    const e={x:96,y:110,facing:face,anim:mode,animTime:elapsed,r:33,hp:5000};
    const before=JSON.stringify(e);sprites.draw(ctx,e,elapsed,mode);assert.equal(JSON.stringify(e),before);
    if(face===-1) pc.drawImage(c,frame*192,row*120,192,120);
    if(face===1){global.right=ctx.getImageData(0,0,192,144).data;}else{
     const left=ctx.getImageData(0,0,192,144).data;let error=0;
     for(let y=0;y<144;y++)for(let x=0;x<192;x++) error+=Math.abs(left[(y*192+x)*4+3]-global.right[(y*192+191-x)*4+3]);
     assert.ok(error<20000,'Mirrored alpha preserves centered pivot');
    }
   }
  }
 }
 assert.equal(sprites.frame('death',20),3);assert.equal(sprites.frame('run',.2),2);
 assert.equal(sprites.frame('run',.4),0);
 fs.writeFileSync('/tmp/demon-integration.webp',preview.toBuffer('image/webp'));
 console.log('PASS: real alpha, 24 poses, mirrored render, immutable hitbox/clock, death hold and run loop.');
})();
