export const platforms=[];
// First-level gaps: generous full-jump margin, with level, unobstructed banks.
export const gaps=[[3500,3640],[6650,6730],[10100,10180],[12500,12640],[14500,14580]];
let x=0;for(const [a,b] of gaps){platforms.push({x,y:560,w:a-x,h:300,type:'ground'});x=b;}platforms.push({x,y:560,w:17000-x,h:300,type:'ground'});
for(const [x,w,h,type] of [[680,90,36,'rock'],[1200,100,55,'rock'],[1810,140,64,'log'],[2580,110,74,'rock'],[4150,110,48,'rock'],[4770,110,83,'rock'],[7350,120,60,'rock'],[8060,110,80,'rock'],[9000,130,68,'log'],[10800,100,70,'rock'],[11550,110,88,'rock'],[13300,100,72,'rock'],[15300,130,65,'log']])platforms.push({x,y:560-h,w,h,type});
// A continuous stone mass with real, exposed ledges; no painted fake slope.
export const hill=[[5350,510,160],[5510,440,160],[5670,350,280],[5950,440,160],[6110,510,160]].map(([x,y,w])=>({x,y,w,h:560-y,type:'hill'}));
platforms.push(...hill);
export const gullies=gaps.map(([a,b],i)=>({x:a,end:b,type:i===0||i===3?'dry':'stream',waterY:595}));
for(const g of gullies.filter(g=>g.type==='dry'))platforms.push({x:g.x,y:584,w:20,h:150,type:'gully'},{x:g.x+20,y:608,w:g.end-g.x-40,h:150,type:'gully'},{x:g.end-20,y:584,w:20,h:150,type:'gully'});
export function inDangerousWater(p){return gullies.some(g=>g.type==='stream'&&p.x+34>g.x&&p.x+34<g.end&&p.y+64>g.waterY);}
export const wet={x:7600,end:8620};
export const checkpoint={x:9600,y:560};
export const hat={x:5820,y:350};
export const finish=16500;


