import {Game,TRAMPOLINE_HALF_WIDTH} from './physics.js';
const $=id=>document.getElementById(id), canvas=$('canvas'),ctx=canvas.getContext('2d');
const game=new Game(),keys={},held=new Set();let mode='ready',last=0,accumulator=0,toastUntil=0,sound=false,audio;
let width=900,height=370;
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
window.addEventListener('resize',resize);resize();
function tone(frequency){if(!sound)return;try{audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=frequency;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.15);}catch{}}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-label',sound?'Disable sound':'Enable sound');tone(440);};
function clearInput(){held.clear();for(const k of Object.keys(keys))keys[k]=false;document.querySelectorAll('[data-key]').forEach(b=>b.classList.remove('active'));}
function begin(){game.reset();clearInput();accumulator=0;mode='playing';$('overlay').hidden=true;$('pause').hidden=false;$('toast').textContent='';tone(440);}
function overlay(tag,title,copy,button,note){$('overlay-tag').textContent=tag;$('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('play').innerHTML=button+' <span>↗</span>';$('overlay-note').textContent=note;$('overlay').hidden=false;}
function pause(){if(mode!=='playing')return;mode='paused';clearInput();overlay('TAKE A BREATHER','Hang tight.','Your next bounce can wait.','KEEP JUMPING','PRESS SPACE TO RESUME');$('pause').hidden=true;}
function resume(){mode='playing';accumulator=0;$('overlay').hidden=true;$('pause').hidden=false;}
$('play').onclick=()=>mode==='paused'?resume():begin();$('pause').onclick=pause;
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
const mapping={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'up'};
function press(code,source){if(!mapping[code]||mode!=='playing')return;const first=!keys[mapping[code]];held.add(source);keys[mapping[code]]=true;if(code==='ArrowDown'&&first)game.boost();}
function release(code,source){held.delete(source);keys[mapping[code]]=[...held].some(s=>s.endsWith(':'+code));}
window.addEventListener('keydown',e=>{if(mapping[e.code]||['Space','Escape','KeyP'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Space'){if(mode==='playing')pause();else if(mode==='paused')resume();else begin();}else if(e.code==='Escape'||e.code==='KeyP'){if(mode==='playing')pause();else if(mode==='paused')resume();}else press(e.code,'keyboard:'+e.code);});
window.addEventListener('keyup',e=>{if(mapping[e.code])release(e.code,'keyboard:'+e.code);});
document.querySelectorAll('[data-key]').forEach(button=>{const code=button.dataset.key;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('active');press(code,e.pointerId+':'+code);});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{button.classList.remove('active');release(code,e.pointerId+':'+code);});});
function updateUI(){ $('score').textContent=String(game.score).padStart(5,'0');$('jump').textContent=String(game.jump).padStart(2,'0');$('height').textContent=game.best.toFixed(1);$('wind').innerHTML=`${game.wind>=0?'→':'←'} ${Math.abs(game.wind).toFixed(1)}<em> m/s</em>`;
 if(mode==='playing'){$('status').textContent=game.vy<0?'COMING DOWN · FIND YOUR FEET':'GOING UP · MAKE IT COUNT';$('hint').textContent=game.vy<0&&game.y<1.5?'↓ BOUNCE NOW':'SPACE TO PAUSE';}
}
function processEvent(){const event=game.event;if(!event)return;if(event.type==='end'){mode='ended';clearInput();$('pause').hidden=true;let best=0;try{best=Number(localStorage.getItem('stickjump-best'))||0;if(game.score>best){best=game.score;localStorage.setItem('stickjump-best',String(best));}}catch{}overlay(game.completed?'ALL TEN. ALL YOU.':'GRAVITY WINS THIS ONE.',game.completed?'What a flight.':'One more try?',`${game.reason} Score: ${game.score.toLocaleString()}. Best height: ${game.best.toFixed(1)} m.`,'JUMP AGAIN',`PERSONAL BEST ${best.toLocaleString()} · LANDED ${game.completed?10:game.jump-1} / 10`);$('status').textContent=game.completed?'RUN COMPLETE':'RUN ENDED';$('hint').textContent='SPACE TO TRY AGAIN';tone(130);}else{$('toast').textContent=event.text;toastUntil=performance.now()+1300;if(event.type==='land')tone(event.quality>.8?660:440);else if(event.type==='flip')tone(880);}}
function line(points,color='#222',thickness=2){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.lineCap='round';ctx.lineJoin='round';points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function draw(now){ctx.clearRect(0,0,width,height);const mobile=width<550,scale=Math.min(mobile?25:32,(height-75)/(Math.max(6.7,game.y+2.1))),ground=height-53,cx=width/2;
 // Quiet altitude lines, scaled with the camera so the entire flight stays visible.
 ctx.font='9px monospace';for(let m=2;m<=18;m+=2){const y=ground-m*scale;if(y<22)continue;line([[20,y],[width-20,y]],'#e9e7e1',1);ctx.fillStyle='#a4a29b';ctx.fillText(m+' m',24,y-5);}
 line([[20,ground+25],[width-20,ground+25]],'#dedcd5',1);
 const tw=TRAMPOLINE_HALF_WIDTH*scale,bend=game.contact>0?Math.sin(game.contact/.2*Math.PI)*8:0;
 ctx.fillStyle='#e8e6e0';ctx.beginPath();ctx.ellipse(cx,ground+23,tw+14,5,0,0,Math.PI*2);ctx.fill();
 line([[cx-tw+5,ground],[cx-tw+11,ground+23],[cx-tw+23,ground+23]],'#333',3);line([[cx+tw-5,ground],[cx+tw-11,ground+23],[cx+tw-23,ground+23]],'#333',3);
 line([[cx-tw,ground],[cx,ground+bend],[cx+tw,ground]],'#222',4);for(let i=-TRAMPOLINE_HALF_WIDTH+.15;i<TRAMPOLINE_HALF_WIDTH;i+=.28)line([[cx+i*scale,ground+2],[cx+i*scale+3,ground+6]],'#888',1);
 ctx.font='8px monospace';ctx.fillStyle='#888';ctx.textAlign='center';ctx.fillText('THE SWEET SPOT',cx,ground+44);ctx.textAlign='left';
 const px=cx+game.x*scale,py=ground-game.y*scale;ctx.save();ctx.translate(px,py-1.05*scale);ctx.rotate(game.angle);ctx.lineWidth=2.6;ctx.strokeStyle='#1b1b1b';
 const s=scale,stroke=game.time-game.strokeAt<.3,phase=Math.max(0,1-(game.time-game.strokeAt)/.3);const tuck=keys.left||keys.right;
 ctx.beginPath();ctx.arc(0,-.67*s,.19*s,0,Math.PI*2);ctx.stroke();
 // Face detail; swimming follows the body axis, not the nose.
 line([[.17*s,-.72*s],[.26*s,-.65*s],[.17*s,-.62*s]],'#222',1.8);
 line([[0,-.46*s],[0,.28*s]],'#222',2.6);
 const arm=stroke?phase*.5:0;
 line([[-.02*s,-.3*s],[-.34*s,(-.12-arm)*s],[-.52*s,(-.32-arm)*s]],'#222',2.3);
 line([[.02*s,-.3*s],[.32*s,(-.08-arm)*s],[.53*s,(-.3-arm)*s]],'#222',2.3);
 line([[0,.27*s],[-(tuck?.4:.2)*s,.65*s],[-.25*s,1.05*s],[-.08*s,1.05*s]],'#222',2.5);
 line([[0,.27*s],[(tuck?.4:.2)*s,.65*s],[.25*s,1.05*s],[.43*s,1.05*s]],'#222',2.5);ctx.restore();
 if(stroke){line([[px-.8*s,py-.7*s],[px-1*s,py-.65*s]],'#aaa',1);line([[px+.8*s,py-.7*s],[px+1*s,py-.65*s]],'#aaa',1);}
 if(mode==='playing'&&game.vy<0&&game.y<2){const bar=70;ctx.fillStyle='#e2e0d9';ctx.fillRect(cx-bar/2,ground+12,bar,3);ctx.fillStyle='#222';ctx.fillRect(cx-bar/2,ground+12,bar*Math.max(0,1-game.y/2),3);}
 if(now>toastUntil)$('toast').textContent='';
}
function frame(now){const elapsed=Math.min((now-last)/1000||0,.05);last=now;if(mode==='playing'){accumulator+=elapsed;while(accumulator>=1/120&&mode==='playing'){game.step(1/120,keys);processEvent();accumulator-=1/120;}}updateUI();draw(now);requestAnimationFrame(frame);}requestAnimationFrame(frame);
