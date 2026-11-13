// One geometric definition feeds BOTH drawing and axis collision rectangles.
const cache=new WeakMap(),worlds=new WeakMap();
export function contour(b){
 if(b.type==='hill')return [[0,b.h],[0,18],[2,10],[7,4],[16,0],[b.w-16,0],[b.w-7,4],[b.w-2,10],[b.w,18],[b.w,b.h]];
 const points=b.type==='log'?[[0,.62],[.03,.29],[.12,.08],[.8,0],[.97,.18],[1,.5],[.96,.87],[.83,1],[.1,.98],[.02,.85]]:
 [[0,.82],[.04,.5],[.18,.15],[.32,0],[.69,0],[.87,.16],[.97,.45],[1,.78],[.94,1],[.08,1]];
 return points.map(([x,y])=>[x*b.w,y*b.h]);
}
export function collisionRects(b){
 if(b.type!=='rock'&&b.type!=='log'&&b.type!=='hill')return [b];
 if(cache.has(b))return cache.get(b);
 const poly=contour(b),rects=[];
 // 2px rasterization of the same polygon. Draw these exact slices: the visual
 // boundary never promises support in a chamfer with an empty collider.
 for(let y=0;y<b.h;y+=2){
  const sy=y+Math.min(1,(b.h-y)/2),xs=[];
  for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length];if((a[1]<=sy&&c[1]>sy)||(c[1]<=sy&&a[1]>sy))xs.push(a[0]+(sy-a[1])/(c[1]-a[1])*(c[0]-a[0]));}
  if(xs.length>=2){const left=Math.min(...xs),right=Math.max(...xs);rects.push({x:b.x+left,y:b.y+y,w:right-left,h:Math.min(2,b.h-y),source:b});}
 }
 cache.set(b,rects);return rects;
}
export function collisionWorld(platforms){if(!worlds.has(platforms))worlds.set(platforms,platforms.flatMap(collisionRects));return worlds.get(platforms);}
