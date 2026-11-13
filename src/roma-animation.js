// Display-only settings. Source coordinates are inside a 192×208 cell.
// Body anchors are manually chosen between shoulder and hip, not at the
// bounding-box centre (which moves with the tail). Feet use pixel-edge y.
export const ROMA_STYLE=Object.freeze({scale:.66,stride:160,threshold:8});
export const RUN_POSES=Object.freeze([
 {row:5,cell:0,bodyX:98,feetY:158},
 {row:5,cell:1,bodyX:98,feetY:159},
 {row:5,cell:3,bodyX:98,feetY:159},
 {row:5,cell:7,bodyX:98,feetY:157}
]);
export const IDLE_POSE=Object.freeze({row:2,cell:0,bodyX:101,feetY:153});
export const AIR_POSE=RUN_POSES[2]; // Existing fixed 6.4; no jump cycle.

export function createAnimation(){return {phase:0,mode:'idle'};}

export function advanceAnimation(state,player,travel){
 if(!player.grounded){state.mode='air';return;}
 if(Math.abs(player.vx)<=ROMA_STYLE.threshold||Math.abs(travel)<1e-7){
  state.mode='idle';state.phase=0;return;
 }
 state.mode='run';
 // Actual ground travel stops the cycle at walls and excludes airborne travel.
 state.phase=(state.phase+Math.abs(travel)/ROMA_STYLE.stride)%1;
}

export function animationPose(state){
 if(state.mode==='air')return AIR_POSE;
 if(state.mode==='idle')return IDLE_POSE;
 return RUN_POSES[Math.min(RUN_POSES.length-1,Math.floor(state.phase*RUN_POSES.length))];
}

export function poseRect(pose,frames){
 const f=frames[pose.row][pose.cell],s=ROMA_STYLE.scale;
 // Uniform scale in every state. No per-frame width/height normalization and
 // no instantaneous vertical squash on landing.
 return {sx:f.x,sy:f.y,sw:f.w,sh:f.h,
  dx:((f.x%192)-pose.bodyX)*s,
  dy:((f.y-pose.row*208)-pose.feetY)*s,dw:f.w*s,dh:f.h*s};
}

export function drawRoma(g,image,frames,state,player,width,height){
 const r=poseRect(animationPose(state),frames);
 g.save();g.translate(player.x+width/2,player.y+height);
 g.scale(player.face===1?-1:1,1);
 g.drawImage(image,r.sx,r.sy,r.sw,r.sh,r.dx,r.dy,r.dw,r.dh);
 g.restore();
}
