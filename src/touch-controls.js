// Pointer IDs are independent: one finger can hold direction while another jumps.
export function createPointerInput({buttons,onPress,onRelease,enabled=()=>true}){
 const pointers=new Map(),counts=new Map();
 function release(id){
  const entry=pointers.get(id);if(!entry)return;pointers.delete(id);
  const count=(counts.get(entry.action)||1)-1;counts.set(entry.action,count);
  if(!count){entry.button.classList.remove('pressed');entry.button.setAttribute('aria-pressed','false');onRelease(entry.action);}
 }
 for(const [action,button] of Object.entries(buttons)){
  button.addEventListener('pointerdown',e=>{
   if(!enabled()||button.hidden||button.disabled||(e.pointerType==='mouse'&&e.button!==0))return;
   e.preventDefault();release(e.pointerId);
   pointers.set(e.pointerId,{action,button});const count=counts.get(action)||0;counts.set(action,count+1);
   button.classList.add('pressed');button.setAttribute('aria-pressed','true');
   try{button.setPointerCapture(e.pointerId);}catch{}
   if(!count)onPress(action);
  });
  button.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;
   const r=button.getBoundingClientRect();
   if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)release(e.pointerId);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture','pointerleave'])button.addEventListener(type,e=>release(e.pointerId));
  button.addEventListener('contextmenu',e=>e.preventDefault());
 }
 return {release,reset(){for(const id of [...pointers.keys()])release(id);},active:()=>pointers.size};
}

export function setupTouchUI({onPress,onRelease,onPause,onCheckpoint,onReset,canPlay,doc=document,win=globalThis}){
 const controls=doc.querySelector('#touch-controls');
 if(!controls)return {sync(){},reset(){}};
 const root=doc.querySelector('main'),toggle=doc.querySelector('#touch-mode'),pause=doc.querySelector('#pause'),checkpoint=doc.querySelector('#checkpoint');
 const buttons=Object.fromEntries(['left','right','jump','take'].map(a=>[a,doc.querySelector('#touch-'+a)]));
 const media=win.matchMedia('(any-pointer: coarse)');
 let preference='auto',visible=false;
 try{const value=win.localStorage.getItem('roma-touch');if(['auto','on','off'].includes(value))preference=value;}catch{}
 const input=createPointerInput({buttons,onPress,onRelease,enabled:()=>visible&&canPlay()});
 function apply(){
  visible=preference==='on'||(preference==='auto'&&(media.matches||win.navigator.maxTouchPoints>0));
  controls.hidden=!visible;root.classList.toggle('touch-enabled',visible);
  toggle.textContent=`Кнопки: ${{auto:'авто',on:'вкл.',off:'выкл.'}[preference]}`;
  toggle.setAttribute('aria-label',`Экранное управление: ${{auto:'автоматически',on:'включено',off:'выключено'}[preference]}. Нажмите для переключения`);
  input.reset();
 }
 toggle.onclick=()=>{preference={auto:'on',on:'off',off:'auto'}[preference];try{win.localStorage.setItem('roma-touch',preference);}catch{}apply();};
 media.addEventListener?.('change',apply);
 pause.onclick=onPause;checkpoint.onclick=onCheckpoint;
 for(const event of ['pointerup','pointercancel'])win.addEventListener(event,e=>input.release?.(e.pointerId));
 function suspend(){input.reset();onReset();onPause();}
 win.addEventListener('blur',suspend);win.addEventListener('pagehide',suspend);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)suspend();});
 win.addEventListener('resize',()=>{input.reset();onReset();});
 win.addEventListener('orientationchange',suspend);
 apply();
 return {
  reset:()=>input.reset(),
  sync({mode,canTake,progress,collected}){
   pause.disabled=!['play','delivery'].includes(mode);checkpoint.hidden=mode!=='pause';
   buttons.take.hidden=!canTake;
   for(const [action,button] of Object.entries(buttons))button.disabled=mode!=='play'||(action==='take'&&!canTake);
   if(mode!=='play')input.reset();
   const status=doc.querySelector('#mobile-status');status.textContent=`${progress}% пути · Кепка ${collected?'1':'0'}/1`;
  }
 };
}
