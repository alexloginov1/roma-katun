import {C} from './config.js';
import {endingFrame,ENDING_DURATION} from './ending-state.js';
import {platforms,wet,checkpoint,hat,finish,inDangerousWater} from './level.js';
import {createPlayer,step} from './physics.js';
import {createAnimation,advanceAnimation,drawRoma,animationPose} from './roma-animation.js';
import {loadKatun,prepareKatun,photoWeight,photoScene,drawPhotoBackdrop,drawContactShadow} from './katun-visuals.js';
import {prepareEnvironment,drawEnvironment} from './natural-environment.js';
import {drawOriginalBackground} from './original-background.js';
import {drawCap,mouthPoint,drawPickupHead} from './hat-story.js';
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const overlay=document.querySelector('#overlay'),button=document.querySelector('#start'),message=document.querySelector('#message');
const sprite=new Image(),owner=new Image(),ownerRaised=new Image();
sprite.src='assets/roma-spritesheet.png';owner.src='assets/references/01a1d2f8-3362-73bc-9c73-2db33d82d25d.webp';
ownerRaised.src='assets/owner/raised-cap-v1.png';
let frames,photoPrepared,environment;
try{
 frames=await (await fetch('assets/frames.json')).json();const photos=await loadKatun();await Promise.all([sprite.decode(),owner.decode(),ownerRaised.decode()]);
 photoPrepared=prepareKatun(photos,platforms);environment=prepareEnvironment(photos,platforms);button.disabled=false;button.textContent='Начать прогулку';
}catch(error){message.textContent='Не удалось загрузить ресурсы. Запустите start-game.cmd.';console.error(error);}
let p=createPlayer(),animation=createAnimation(),mode='title',resumeMode='play';
let collected=false,checked=false,pickup=null,delivery=0,delivered=false;
let cam=0,t=0,acc=0,last=0,photoEnabled=true,photoMix=1,jump=false;
let muted=false,audioContext,notice='',noticeTime=0;
const keys=new Set();
function sound(kind){if(muted)return;try{audioContext??=new AudioContext();audioContext.resume();const o=audioContext.createOscillator(),a=audioContext.createGain();o.connect(a);a.connect(audioContext.destination);const f={jump:330,land:110,hat:740,flag:520}[kind];o.frequency.setValueAtTime(f,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(f*.65,audioContext.currentTime+.12);a.gain.setValueAtTime(.045,audioContext.currentTime);a.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.18);o.start();o.stop(audioContext.currentTime+.2);}catch{}}
document.querySelector('#sound').onclick=()=>{muted=!muted;document.querySelector('#sound').textContent=`Звук: ${muted?'выкл.':'вкл.'}`;};
document.querySelector('#scenery').onclick=()=>{photoEnabled=!photoEnabled;document.querySelector('#scenery').textContent=photoEnabled?'Фотофон':'Исходный фон';};
function say(s){notice=s;noticeTime=3;}
function respawn(){p=createPlayer(checked?checkpoint.x:140,496);animation=createAnimation();pickup=null;cam=Math.max(0,Math.min(C.world-1280,p.x-380));keys.clear();jump=false;}
function show(title,text,label){overlay.hidden=false;overlay.querySelector('h1').textContent=title;message.textContent=text;button.textContent=label;}
function pause(){if(mode==='play'||mode==='delivery'){resumeMode=mode;mode='pause';keys.clear();jump=false;show('Тихая пауза','Рома подождёт. Прогресс сохранён.','Продолжить');}}
button.onclick=()=>{if(mode==='pause')mode=resumeMode;else{collected=false;checked=false;delivered=false;pickup=null;delivery=0;respawn();mode='play';t=0;noticeTime=0;}acc=0;overlay.hidden=true;sound('flag');};
const codes=['KeyA','KeyD','ArrowLeft','ArrowRight','Space','KeyE','KeyR','Escape'];
addEventListener('keydown',e=>{
 if(!codes.includes(e.code))return;e.preventDefault();if(e.repeat)return;
 if(e.code==='Escape'){if(mode==='play'||mode==='delivery')pause();else if(mode==='pause')button.click();return;}
 if(mode!=='play')return;keys.add(e.code);if(e.code==='Space')jump=true;if(e.code==='KeyR')respawn();
 if(e.code==='KeyE'&&!collected&&!pickup&&Math.abs(p.x+34-hat.x)<95&&Math.abs(p.y+64-hat.y)<90){if(p.grounded&&Math.abs(p.vx)<30)pickup={time:0,x:p.x};else say('Остановись на камне и нажми E');}
});
addEventListener('keyup',e=>{keys.delete(e.code);if(codes.includes(e.code))e.preventDefault();});
addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function win(){mode='win';keys.clear();show(collected?'Рома принёс кепку!':'Рома вернулся! А кепка осталась на тропе',`Кепка: ${collected?'1/1 — передана хозяину':'0/1'}. Время прогулки: ${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}.`,'Пройти ещё раз');}
function update(dt){
 t+=dt;noticeTime-=dt;const previousX=p.x;
 const dir=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 step(p,{dir,jump,held:keys.has('Space'),onJump:()=>sound('jump'),onLand:()=>sound('land')},dt,platforms,wet);jump=false;advanceAnimation(animation,p,p.x-previousX);
 if(pickup){if(!p.grounded||Math.abs(p.x-pickup.x)>15||Math.abs(p.vx)>30)pickup=null;else{pickup.time+=dt;if(pickup.time>=.32&&!collected){collected=true;sound('hat');say('Кепка 1/1 — несём хозяину!');}if(pickup.time>=.65)pickup=null;}}
 if(p.y>850||inDangerousWater(p)){respawn();say(collected?'Кепка сохранена. Рома снова на тропе.':'Рома снова на тропе.');}
 if(!checked&&p.x>=checkpoint.x){checked=true;sound('flag');say('Контрольная точка сохранена');}
 if(p.x>=finish&&p.grounded){keys.clear();if(collected){mode='delivery';delivery=0;animation.mode='idle';}else win();}
 cam+=(Math.max(0,Math.min(C.world-1280,p.x-400+p.vx*.55))-cam)*(1-Math.exp(-3*dt));
}
function text(s,x,y,size=24,color='#203e40'){g.fillStyle=color;g.font=`600 ${size}px Segoe UI`;g.fillText(s,x,y);}
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
function sign(x,s,y){const width=Math.max(250,s.length*12.5+24);rect(x,y+12,6,560-y-12,'#75604a');rect(x-12,y-30,width,42,'#f0e6c9');text(s,x,y,24);}
function storyFrame(){return endingFrame(mode==='delivery'||(mode==='pause'&&resumeMode==='delivery'),delivery,delivered);}
function drawOwner(){const image=storyFrame().ownerPose==='raised-cap'?ownerRaised:owner;const h=150,w=h*(image.naturalWidth||320)/(image.naturalHeight||480);g.fillStyle='#263b3540';g.beginPath();g.ellipse(16672,560,39,7,0,0,7);g.fill();g.drawImage(image,16672-w/2,560-h,w,h);}
function draw(){
 const alpha=photoPrepared?photoMix:0;if(alpha<.999)drawOriginalBackground(g,cam,t);
 if(alpha>0)drawPhotoBackdrop(g,photoPrepared,cam,alpha);
 g.save();g.translate(-cam,0);if(environment)drawEnvironment(g,platforms,photoPrepared,environment,cam,alpha);rect(wet.x,557,wet.end-wet.x,3,'#65b7be');
 sign(300,'← → идти · Пробел прыгать',230);sign(3000,'Сухая ложбина: есть выход',230);sign(6250,'Ручей! Вода опасна — прыгай',230);sign(5420,'Кепка наверху ↗',120);sign(7620,'Мокрые камни — скользко',230);
 rect(checkpoint.x,423,5,137,'#77644b');g.fillStyle=checked?'#f5bc5b':'#e9edcf';g.beginPath();g.moveTo(checkpoint.x+5,423);g.lineTo(checkpoint.x+65,440);g.lineTo(checkpoint.x+5,460);g.fill();text('Контрольная точка',checkpoint.x-80,310);
 if(!collected){drawCap(g,hat.x+15,hat.y-19,.85,-1,-.15);if(p.grounded&&Math.abs(p.x+34-hat.x)<95&&Math.abs(p.y+64-hat.y)<90){rect(hat.x-160,190,320,46,'#153b40ee');text('E — подобрать кепку',hat.x-145,221,24,'#fff0cd');}}
 g.fillStyle='#bc8656';g.beginPath();g.moveTo(16240,560);g.lineTo(16330,425);g.lineTo(16445,560);g.fill();text('ХОЗЯИН · ПРИВАЛ',16370,340,30);drawOwner();
 drawContactShadow(g,p,platforms);if(frames){if(pickup)drawPickupHead(g,sprite,frames,p,pickup.time/.65);else drawRoma(g,sprite,frames,animation,p,C.w,C.h);}
 if(collected&&storyFrame().capLayer!=='baked'){const mouth=mouthPoint(p,pickup?{mode:'idle',phase:0}:animation,pickup?pickup.time/.65:null);if(mode==='delivery'||(mode==='pause'&&resumeMode==='delivery')){const u=Math.max(0,Math.min(1,delivery/.9)),s=u*u*(3-2*u);drawCap(g,mouth.x+(16642-mouth.x)*s,mouth.y+(492-mouth.y)*s,.78,p.face,.15*s);}else drawCap(g,mouth.x,mouth.y,.78,p.face);}
 g.restore();rect(20,18,420,94,'#10363cf0');text('ТРОПА НАД КАТУНЬЮ',38,53,25,'#f4e9cb');text(`Кепка ${collected?'1':'0'}/1 · ${checked?'Привал близко':'К хозяину →'}`,38,88,23,'#d3e1cd');rect(1025,18,235,70,'#10363cf0');text(`${Math.floor(Math.min(100,p.x/finish*100))}% пути`,1050,60,25,'#f4e9cb');
 if(noticeTime>0){rect(465,20,540,85,'#153b40ee');text(notice,480,70,23,'#fff0cd');}if(mode==='delivery')text(storyFrame().ownerPose==='raised-cap'?'Хозяин поднимает кепку!':'Рома отдаёт кепку…',465,160,27,'#fff5db');
}
function loop(ms){const delta=last?Math.min(C.maxAccum,(ms-last)/1000):0;last=ms;photoMix+=(Number(photoEnabled)-photoMix)*(1-Math.exp(-8*delta));if(mode==='play'){acc=Math.min(C.maxAccum,acc+delta);while(acc>=C.step){update(C.step);acc-=C.step;if(mode!=='play')break;}}else{acc=0;if(mode==='delivery'){delivery+=delta;if(delivery>=ENDING_DURATION){delivered=true;win();}}}draw();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
export function inspectGame(){return {player:{...p},mode,collected,checked,cam,time:t,muted,photoEnabled,photoMix,photoWeight:photoWeight(cam),spriteReady:!!frames,pickup:pickup?{...pickup}:null,delivery,delivered,ending:storyFrame(),photoScene:photoScene(cam),animation:{...animation,pose:{...animationPose(animation)}}};}





