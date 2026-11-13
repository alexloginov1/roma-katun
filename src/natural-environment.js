import {collisionRects} from './terrain-geometry.js';
import {gullies,hill} from './level.js';
function shape(g,b){g.beginPath();for(const r of collisionRects(b))g.rect(r.x-b.x,r.y-b.y,r.w,r.h);}
function surface(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'));return c;}
export function prepareEnvironment(images,platforms){
 const shapes=new Map();
 for(const b of platforms.filter(b=>b.type==='rock'||b.type==='log'))shapes.set(b,surface(b.w,b.h,c=>{
  shape(c,b);c.clip();
  if(b.type==='rock'){
   c.drawImage(images.stone,0,0,b.w,b.h);
   const gradient=c.createLinearGradient(0,0,0,b.h);gradient.addColorStop(0,'#d6cfb64a');gradient.addColorStop(1,'#384545a8');c.fillStyle=gradient;c.fillRect(0,0,b.w,b.h);
   c.strokeStyle='#d8d0ba88';c.lineWidth=2;c.beginPath();c.moveTo(b.w*.25,5);c.lineTo(b.w*.44,9);c.lineTo(b.w*.75,5);c.stroke();
   c.strokeStyle='#38403eaa';c.lineWidth=1;c.beginPath();c.moveTo(b.w*.4,8);c.lineTo(b.w*.32,b.h*.4);c.lineTo(b.w*.53,b.h*.7);c.lineTo(b.w*.47,b.h);c.moveTo(b.w*.32,b.h*.4);c.lineTo(8,b.h*.5);c.stroke();
  }else{
   const gradient=c.createLinearGradient(0,0,0,b.h);gradient.addColorStop(0,'#ae8a60');gradient.addColorStop(.45,'#76513b');gradient.addColorStop(1,'#392d28');c.fillStyle=gradient;c.fillRect(0,0,b.w,b.h);
   for(let i=0;i<12;i++){c.strokeStyle=i%2?'#b08a5555':'#352d2988';c.lineWidth=1+i%2;c.beginPath();c.moveTo(4,i*b.h/12);c.bezierCurveTo(b.w*.3,i*b.h/12-6,b.w*.65,i*b.h/12+7,b.w-9,i*b.h/12+2);c.stroke();}
   c.fillStyle='#bca077';c.beginPath();c.ellipse(b.w-12,b.h*.52,10,b.h*.34,.12,0,7);c.fill();c.strokeStyle='#715b3e';c.lineWidth=1;for(const radius of [.18,.28]){c.beginPath();c.ellipse(b.w-12,b.h*.52,6,b.h*radius,.12,0,7);c.stroke();}
   // Short snapped branches are INSIDE the collision silhouette.
   c.strokeStyle='#402c24';c.lineWidth=5;c.beginPath();c.moveTo(b.w*.4,b.h*.3);c.lineTo(b.w*.35,5);c.moveTo(b.w*.7,b.h*.65);c.lineTo(b.w*.62,b.h*.48);c.stroke();
  }
 }));
 // One coherent massif, not five repeated rectangular faces. All texture and
 // details are cached once; its mask is the very same rounded collision union.
 const originX=hill[0].x,originY=Math.min(...hill.map(b=>b.y));
 const width=hill.at(-1).x+hill.at(-1).w-originX,height=560-originY;
 let seed=19473;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 shapes.hill={x:originX,y:originY,w:width,h:height,canvas:surface(width,height,c=>{
  c.save();
  c.beginPath();for(const b of hill)for(const r of collisionRects(b))c.rect(r.x-originX,r.y-originY,r.w,r.h);c.clip();
  const gradient=c.createLinearGradient(0,0,width,height);gradient.addColorStop(0,'#a29c87');gradient.addColorStop(.45,'#797a70');gradient.addColorStop(1,'#656c65');c.fillStyle=gradient;c.fillRect(0,0,width,height);
  for(let i=0;i<90;i++){
   const x=random()*width,y=random()*height,w=20+random()*110,h=15+random()*65;
   c.save();c.translate(x,y);c.rotate((random()-.5)*2);c.globalAlpha=.12+random()*.17;c.drawImage(images.stone,-w/2,-h/2,w,h);c.restore();
   c.fillStyle=['#c5bca031','#505b5140','#8a765c2d','#afaa9240'][i%4];c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x-w*.18,y-h*.4);c.lineTo(x+w*.4,y-h*.1);c.lineTo(x+w/2,y+h*.3);c.lineTo(x-w*.3,y+h*.4);c.closePath();c.fill();
  }
  for(let i=0;i<1200;i++){const x=random()*width,y=random()*height;c.fillStyle=i%3?'#d1c8ac30':'#3c484440';c.fillRect(x,y,1+random()*2,1+random()*2);}
  for(let i=0;i<19;i++){
   let x=random()*width,y=random()*height;c.strokeStyle='#34433d77';c.lineWidth=.6+random()*1.2;c.beginPath();c.moveTo(x,y);
   for(let j=0;j<3+Math.floor(random()*5);j++){x+=random()*25-9;y+=5+random()*15;c.lineTo(x,y);}c.stroke();
   c.strokeStyle='#d0c5a045';c.beginPath();c.moveTo(x+2,y);c.lineTo(x+12,y-18);c.stroke();
  }
  for(let i=0;i<22;i++){
   const x=random()*width,y=random()*height;c.fillStyle=i%2?'#69755579':'#84905a60';
   c.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,r=3+random()*8;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.5;j?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();
  }
  for(const [index,b] of hill.entries()){
   const x=b.x-originX,y=b.y-originY;
   c.strokeStyle='#d1c8ac99';c.lineWidth=1;c.beginPath();c.moveTo(x+16,y+1);c.lineTo(x+b.w-16,y+1);c.stroke();
   const previousTop=index?hill[index-1].y:560;
   if(b.y<previousTop){c.strokeStyle='#3b49454d';c.lineWidth=3;c.beginPath();c.moveTo(x+3,y+17);c.lineTo(x+3,previousTop-originY-2);c.stroke();}
  }
  c.restore();
  for(const b of hill){const x=b.x-originX,y=b.y-originY;for(let i=0;i<3;i++){const tx=x+25+random()*(b.w-50);c.strokeStyle='#64754b';c.lineWidth=1;c.beginPath();c.moveTo(tx,y+1);c.lineTo(tx-3,y-4);c.moveTo(tx+2,y+1);c.lineTo(tx+5,y-3);c.stroke();}}
 })};return shapes;
}
function pebbles(g,b){for(let i=0;i<Math.floor(b.w/12);i++){const x=b.x+7+i*13,y=b.y+5+(i%3)*5;g.fillStyle=i%2?'#b9b4a1':'#646b62';g.beginPath();g.ellipse(x,y,3,2,.3,0,7);g.fill();}}
export function drawEnvironment(g,platforms,photo,shapes,cam,alpha){
 for(const b of platforms){if(b.x+b.w<cam||b.x>cam+1280)continue;
  if(b.type==='hill')continue;
  if(b.type==='rock'||b.type==='log'){
   g.fillStyle='#27362d38';g.beginPath();g.ellipse(b.x+b.w/2,b.y+b.h,b.w*.48,6,0,0,7);g.fill();g.drawImage(shapes.get(b),b.x,b.y);continue;
  }
  g.fillStyle=b.type==='hill'?'#797969':b.type==='gully'?'#817f70':'#818373';g.fillRect(b.x,b.y,b.w,b.h);
  if(photo){g.save();g.globalAlpha=.5+.5*alpha;g.beginPath();g.rect(b.x,b.y,b.w,b.h);g.clip();for(let x=Math.floor(Math.max(cam,b.x)/512)*512;x<Math.min(cam+1280,b.x+b.w);x+=512)g.drawImage(photo.bank,x,b.y);g.restore();}
  g.fillStyle='#c2b79b';g.fillRect(b.x,b.y,b.w,2);pebbles(g,{...b,x:Math.max(b.x,cam-15),w:Math.min(b.x+b.w,cam+1295)-Math.max(b.x,cam-15)});
 }
 if(shapes.hill&&shapes.hill.x+shapes.hill.w>=cam&&shapes.hill.x<=cam+1280)g.drawImage(shapes.hill.canvas,shapes.hill.x,shapes.hill.y);
 for(const d of gullies){if(d.end<cam||d.x>cam+1280)continue;
  if(d.type==='stream'){
   g.fillStyle='#477e7c';g.beginPath();g.moveTo(d.x,602);g.lineTo(d.x+8,590);g.lineTo(d.end-10,594);g.lineTo(d.end,599);g.lineTo(d.end,720);g.lineTo(d.x,720);g.closePath();g.fill();
   g.strokeStyle='#b1e8e5';g.lineWidth=2;for(let y=603;y<690;y+=22){g.beginPath();g.moveTo(d.x+8,y);g.quadraticCurveTo((d.x+d.end)/2,y-6,d.end-6,y+1);g.stroke();}
   g.fillStyle='#eedeb3';g.font='600 16px Segoe UI';g.fillText('≈',d.x+30,632);
  }
  // Chipped banks: render inward, never add an unsupported lip over the gap.
  for(const [edge,side] of [[d.x,-1],[d.end,1]]){g.fillStyle='#666e65';g.beginPath();g.moveTo(edge,562);g.lineTo(edge+side*12,570);g.lineTo(edge+side*5,586);g.lineTo(edge,600);g.closePath();g.fill();}
 }
}

