import {C} from './config.js';
import {collisionWorld} from './terrain-geometry.js';
export function createPlayer(x=140,y=496){return {x,y,vx:0,vy:0,grounded:false,coyote:0,buffer:0,face:1,land:0,wet:false};}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+C.w>b.x&&a.y<b.y+b.h&&a.y+C.h>b.y;
export function step(p,input,dt,platforms,wet){
 const solids=collisionWorld(platforms);
 p.land=Math.max(0,p.land-dt);p.coyote=p.grounded?C.coyote:Math.max(0,p.coyote-dt);p.buffer=input.jump?C.buffer:Math.max(0,p.buffer-dt);
 if(p.buffer>0&&p.coyote>0){p.vy=-C.jump;p.grounded=false;p.coyote=0;p.buffer=0;input.onJump?.();}
 if(!input.held&&p.vy< -C.jump*C.cut)p.vy=-C.jump*C.cut;
 const dir=input.dir;p.wet=p.grounded&&p.x+C.w>wet.x&&p.x<wet.end;
 const target=dir*C.speed;const amount=(dir?(p.grounded?C.accel:C.airAccel):(p.grounded?(p.wet?C.wetBrake:C.brake):200))*dt;
 p.vx+=Math.max(-amount,Math.min(amount,target-p.vx));if(dir)p.face=dir;
 p.vy=Math.min(C.maxFall,p.vy+C.gravity*dt);
 // At 120 Hz maximum displacement is 8.34 px; all solid platforms are >=22 px.
 const horizontalDirection=Math.sign(p.vx);
 const oldFeet=p.y+C.h;
 const followingContour=p.grounded&&solids.some(b=>b.source&&Math.abs(b.y-oldFeet)<.1&&p.x<b.x+b.w&&p.x+C.w>b.x);
 p.x+=p.vx*dt;for(const b of solids)if(overlap(p,b)){
  // Follow only tiny (<=6px) raster steps on a rock/log already supporting us.
  // A real ledge still requires the unchanged jump; no stepping through walls.
  if(followingContour&&b.source&&b.y>=oldFeet-6&&b.y<p.y+C.h){const elevated={...p,y:b.y-C.h};if(!solids.some(s=>overlap(elevated,s))){p.y=elevated.y;continue;}}
  if(horizontalDirection>0)p.x=b.x-C.w;else if(horizontalDirection<0)p.x=b.x+b.w;p.vx=0;
 }
 p.x=Math.max(0,Math.min(C.world-C.w,p.x));p.y+=p.vy*dt;p.grounded=false;
 for(const b of solids)if(overlap(p,b)){if(p.vy>=0){p.y=b.y-C.h;p.grounded=true;if(p.vy>220){p.land=.12;input.onLand?.();}}else p.y=b.y+b.h;p.vy=0;}
}
