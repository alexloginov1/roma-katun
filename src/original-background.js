export function drawOriginalBackground(g,cam,t){
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
function text(s,x,y,size=18,c='#203e40'){g.fillStyle=c;g.font=`600 ${size}px Segoe UI`;g.fillText(s,x,y);}
function poly(points,c){g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function pine(x,y,s){rect(x-3*s,y-65*s,6*s,65*s,'#52614e');for(let j=0;j<3;j++)poly([[x,y-(150-j*36)*s],[x-(35+j*6)*s,y-(55-j*20)*s],[x+(35+j*6)*s,y-(55-j*20)*s]],j%2?'#3e7567':'#32675e');}
function background(){const sky=g.createLinearGradient(0,0,0,560);sky.addColorStop(0,'#9dd8dc');sky.addColorStop(1,'#edf1d4');g.fillStyle=sky;g.fillRect(0,0,1280,720);g.fillStyle='#fff3b1';g.beginPath();g.arc(1080-cam*.015,92,39,0,7);g.fill();for(let layer=0;layer<2;layer++){const shift=cam*(layer?.14:.065);for(let i=-1;i<8;i++){const x=i*430-shift%430;poly([[x-180,365],[x+110,95+layer*85+(i%2)*35],[x+420,365]],layer?'#6c9e98':'#91b8b2');if(!layer)poly([[x+45,154+(i%2)*35],[x+110,95+(i%2)*35],[x+175,159+(i%2)*35],[x+122,144+(i%2)*35]],'#d9e5d8');}}rect(0,352,1280,215,'#41aeb1');for(let i=0;i<32;i++){const x=((i*173-cam*.35+t*15)%1500+1500)%1500;rect(x,375+i%6*26,45+i%4*18,2,'#91d9cd');}for(let i=-1;i<13;i++)pine(i*155-(cam*.35)%155,440,.65+(i%3)*.1);poly([[0,492],[1280,466],[1280,720],[0,720]],'#b3b79a');}

background();
}
