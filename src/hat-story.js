import {animationPose,ROMA_STYLE} from './roma-animation.js';
// Source-cell mouth points: run poses retain the existing body/feet anchors.
const mouths={0:[18,98],1:[17,98],3:[16,97],7:[16,96]};
export function mouthPoint(player,animation,pickupProgress=null){
 const pose=animationPose(animation);let [x,y]=pose.row===2?[19,91]:mouths[pose.cell];
 if(pickupProgress!==null){const angle=-.22*Math.sin(pickupProgress*Math.PI),dx=x-60,dy=y-110;x=60+dx*Math.cos(angle)-dy*Math.sin(angle);y=110+dx*Math.sin(angle)+dy*Math.cos(angle);}
 const direction=player.face===1?-1:1;
 return {x:player.x+34+(x-pose.bodyX)*ROMA_STYLE.scale*direction,y:player.y+64+(y-pose.feetY)*ROMA_STYLE.scale};
}
export function drawCap(g,x,y,size=1,face=-1,angle=0){
 // Separate transparent vector illustration, based on the dark cap references.
 // Grip is at (0,0); the cap always extends forward/down from the dog's mouth.
 g.save();g.translate(x,y);g.scale(face===1?-size:size,size);g.rotate(angle);
 g.fillStyle='#353b3b';g.strokeStyle='#181e20';g.lineWidth=1.5;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-7,-7,-26,-7,-31,8);g.bezierCurveTo(-34,15,-18,20,-8,15);g.lineTo(0,0);g.fill();g.stroke();
 g.fillStyle='#242b2c';g.beginPath();g.moveTo(-31,8);g.quadraticCurveTo(-44,18,-29,21);g.quadraticCurveTo(-13,24,-8,15);g.fill();g.stroke();g.strokeStyle='#69706a';g.lineWidth=1;g.beginPath();g.moveTo(-6,1);g.quadraticCurveTo(-18,-2,-20,13);g.moveTo(-28,9);g.quadraticCurveTo(-20,16,-10,14);g.stroke();g.restore();
}
export function drawPickupHead(g,image,frames,p,progress){
 const f=frames[2][0],s=.66,angle=-.22*Math.sin(progress*Math.PI);
 g.save();g.translate(p.x+34,p.y+64);g.scale(p.face===1?-s:s,s);g.translate(-101,-153);
 // Temporary staging: same intact side pose, with only the head tilted around
 // the neck. No whole-body deformation, no alleged new sprite animation.
 g.save();g.beginPath();g.rect(0,0,192,208);g.rect(5,52,62,64);g.clip('evenodd');g.drawImage(image,0,416,192,208,0,0,192,208);g.restore();
 g.translate(60,110);g.rotate(angle);g.drawImage(image,5,468,62,64,-55,-58,62,64);g.restore();
}
