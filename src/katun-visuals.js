// Visual-only layer. Never writes to the player, platforms or animation state.
import {collisionWorld} from './terrain-geometry.js';
export function photoWeight(){return 1;}
export const PHOTO_TRANSITIONS=Object.freeze([[4675,4755],[10750,10830]]);
export function photoScene(cameraX){
 for(let i=0;i<PHOTO_TRANSITIONS.length;i++){
  const [start,end]=PHOTO_TRANSITIONS[i];
  if(cameraX<start)return {from:i,to:i,mix:0};
  if(cameraX<=end){const u=(cameraX-start)/(end-start);return {from:i,to:i+1,mix:u*u*(3-2*u)};}
 }
 return {from:2,to:2,mix:0};
}
export function drawPhotoBackdrop(g,prepared,cameraX,opacity=1){
 const scene=photoScene(cameraX);
 g.save();g.globalAlpha=opacity;g.drawImage(prepared.backdrops[scene.from],0,0);
 // An opaque photograph is always the base. Even halfway through a change,
 // no part of the geometric fallback is exposed in Photo mode.
 if(scene.from!==scene.to){g.globalAlpha=opacity*scene.mix;g.drawImage(prepared.backdrops[scene.to],0,0);}
 g.restore();
}

export function shadowSupport(player,platforms,width=68,height=64){
 const center=player.x+width/2,feet=player.y+height;
 const candidates=collisionWorld(platforms).filter(b=>center>=b.x&&center<b.x+b.w&&b.y>=feet-1&&b.y-feet<=150);
 if(!candidates.length)return null;
 const surface=candidates.reduce((a,b)=>a.y<b.y?a:b);
 return {surface,center,distance:Math.max(0,surface.y-feet)};
}

export async function loadKatun(){
 const images={};
 await Promise.all(['river','river-mid','river-camp','stone','trail'].map(async name=>{
  const image=new Image();image.src=`assets/katun/${name}.jpg`;await image.decode();images[name]=image;
 }));
 return images;
}

function cached(width,height,paint){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 paint(canvas.getContext('2d'));return canvas;
}

export function prepareKatun(images,platforms){
 // All texturing, pebbles, cracks and photograph contrast adjustment happen
 // once at loading time. Frames only composite already prepared images.
 const backdrops=['river','river-mid','river-camp'].map(name=>cached(1280,720,c=>{
  c.drawImage(images[name],0,0,1280,720);
  c.fillStyle='rgba(195,206,192,.10)';c.fillRect(0,0,1280,720);
 }));
 const backdrop=backdrops[0];
 const bank=cached(512,300,c=>{
  c.fillStyle='#817b6e';c.fillRect(0,0,512,300);
  c.globalAlpha=.40;
  for(let x=0;x<512;x+=160)for(let y=0;y<300;y+=45)c.drawImage(images.trail,0,0,160,45,x,y,160,45);
  c.globalAlpha=1;
  const shade=c.createLinearGradient(0,0,0,250);shade.addColorStop(0,'#b1a58c44');shade.addColorStop(1,'#45494799');c.fillStyle=shade;c.fillRect(0,0,512,300);
  for(let i=0;i<250;i++){
   const x=(i*137.31)%512,y=8+(i*47.73)%285;
   c.fillStyle=['#b7b1a1','#666a63','#9c978a','#cdc3ac'][i%4];
   c.beginPath();c.ellipse(x,y,2+i%4,1+i%3,.3*(i%5),0,Math.PI*2);c.fill();
  }
  c.fillStyle='#d3c5a8';c.fillRect(0,0,512,3);
 });
 const rocks=new Map();
 for(const b of platforms.filter(b=>b.type==='rock')){
  rocks.set(b,cached(b.w,b.h,c=>{
   c.beginPath();c.moveTo(0,0);c.lineTo(b.w,0);c.lineTo(b.w,b.h*.15);c.lineTo(b.w-3,b.h*.28);c.lineTo(b.w,b.h*.43);c.lineTo(b.w-2,b.h*.62);c.lineTo(b.w,b.h*.8);c.lineTo(b.w-3,b.h);c.lineTo(3,b.h);c.lineTo(0,b.h*.78);c.lineTo(3,b.h*.58);c.lineTo(0,b.h*.35);c.lineTo(2,b.h*.18);c.lineTo(0,b.h*.1);c.closePath();c.clip();
   c.fillStyle='#8a8c81';c.fillRect(0,0,b.w,b.h);c.globalAlpha=.65;
   c.drawImage(images.stone,0,0,b.w,b.h);c.globalAlpha=1;
   const shade=c.createLinearGradient(0,0,0,b.h);shade.addColorStop(0,'#c5c4b355');shade.addColorStop(1,'#303a4088');c.fillStyle=shade;c.fillRect(0,0,b.w,b.h);
   c.fillStyle='#cac4b0';c.fillRect(0,0,b.w,1);
   c.fillStyle='#d4cbb644';
   c.beginPath();c.moveTo(0,1);c.lineTo(b.w*.6,1);c.lineTo(b.w*.42,7);c.lineTo(3,11);c.closePath();c.fill();
   c.fillStyle='#3c444555';
   c.beginPath();c.moveTo(b.w-7,4);c.lineTo(b.w,1);c.lineTo(b.w,b.h);c.lineTo(b.w-12,b.h-5);c.closePath();c.fill();
   c.strokeStyle='#454d49aa';c.lineWidth=1;
   c.beginPath();c.moveTo(b.w*.36,4);c.lineTo(b.w*.3,b.h*.35);c.lineTo(b.w*.48,b.h*.6);c.lineTo(b.w*.42,b.h);c.moveTo(b.w*.3,b.h*.35);c.lineTo(b.w*.15,b.h*.4);c.stroke();
   c.fillStyle='#59655966';c.fillRect(2,b.h-5,b.w-4,5);
  }));
 }
 return {backdrop,backdrops,bank,rocks};
}

export function drawPhotoTerrain(g,b,prepared,cameraX){
 if(b.type==='rock'){g.drawImage(prepared.rocks.get(b),b.x,b.y);return;}
 if(b.type!=='ground')return;
 g.save();g.beginPath();g.rect(b.x,b.y,b.w,b.h);g.clip();
 const first=Math.floor(Math.max(b.x,cameraX)/512)*512;
 for(let x=first;x<Math.min(b.x+b.w,cameraX+1280);x+=512){g.drawImage(prepared.bank,x,b.y);}
 // The two edges stay exactly on the collider. No grass near drop-offs.
 g.fillStyle='#d4c8ac';g.fillRect(b.x,b.y,b.w,3);
 g.fillStyle='#3e4949';g.fillRect(b.x,b.y+3,2,b.h-3);g.fillRect(b.x+b.w-2,b.y+3,2,b.h-3);
 for(let x=Math.max(b.x+35,Math.floor(cameraX/157)*157);x<b.x+b.w-30&&x<cameraX+1280;x+=157){
  if(x<b.x+30)continue;
  g.strokeStyle='#747b50';g.lineWidth=1;g.beginPath();g.moveTo(x,b.y+1);g.lineTo(x-3,b.y-4);g.moveTo(x+2,b.y+1);g.lineTo(x+5,b.y-3);g.stroke();
 }
 g.restore();
}

export function drawContactShadow(g,player,platforms){
 const support=shadowSupport(player,platforms);if(!support)return;
 const {surface,center,distance}=support;
 const alpha=.25*Math.exp(-distance/55),radius=41-distance*.10;
 g.save();g.beginPath();g.rect(surface.x,surface.y-1,surface.w,14);g.clip();
 const gradient=g.createRadialGradient(center,surface.y+2,0,center,surface.y+2,radius);
 gradient.addColorStop(0,`rgba(24,31,29,${alpha})`);gradient.addColorStop(1,'rgba(24,31,29,0)');
 g.translate(center,surface.y+2);g.scale(1,.18);g.fillStyle=gradient;g.beginPath();g.arc(0,0,radius,0,Math.PI*2);g.fill();g.restore();
}
