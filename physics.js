export const TRAMPOLINE_HALF_WIDTH = 2.25;
export const TAU = Math.PI * 2;
export const upright = angle => Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < Math.PI / 3.5;
export const boostQuality = age => age >= 0 && age <= .3 ? Math.max(0, 1 - Math.abs(age - .075) / .225) : 0;
export class Game {
 constructor(random = Math.random) { this.random = random; this.reset(); }
 reset() { Object.assign(this,{x:0,y:0,vx:0,vy:13.5,angle:0,omega:0,time:0,jump:1,score:0,best:0,peak:0,rotation:0,flips:0,boostAt:-100,strokeAt:-100,wind:0,ended:false,reason:'',event:null,contact:0}); }
 boost() { this.boostAt=this.time; }
 step(dt, keys={}) {
  if(this.ended)return;
  this.time+=dt;this.event=null;this.contact=Math.max(0,this.contact-dt);
  this.wind=1.15*Math.sin(this.time*.48)+.65*Math.sin(this.time*1.13+1);
  const turn=(keys.right?1:0)-(keys.left?1:0);
  this.omega+=(turn*10-this.omega*.7)*dt;
  const rotation=this.omega*dt;this.angle+=rotation;this.rotation+=rotation;
  // A full rotation in either direction must be completed before it scores.
  while(Math.abs(this.rotation)>=TAU){this.flips++;this.rotation-=Math.sign(this.rotation)*TAU;this.event={type:'flip',text:'FULL ROTATION +250'};}
  if(keys.up && this.time-this.strokeAt>.4){this.strokeAt=this.time;this.vx+=Math.cos(this.angle)*3.2;this.event={type:'swim',text:Math.cos(this.angle)>=0?'STROKE →':'← STROKE'};}
  this.vx+=(this.wind*.25-this.vx*.65)*dt;this.x+=this.vx*dt;
  const oldY=this.y;this.vy-=9.81*dt;this.y+=this.vy*dt;
  this.peak=Math.max(this.peak,this.y);this.best=Math.max(this.best,this.y);
  if(this.y<=0 && oldY>=0 && this.vy<0){
   if(Math.abs(this.x)>TRAMPOLINE_HALF_WIDTH){this.end('You missed the trampoline.');return;}
   if(!upright(this.angle)){this.end('That landing needed more feet.');return;}
   const quality=boostQuality(this.time-this.boostAt);
   const earned=Math.round(this.peak*100)+this.flips*250;
   this.score+=earned;this.event={type:'land',quality,text:`${quality>.8?'PERFECT BOUNCE':quality>0?'NICE BOUNCE':'CLEAN LANDING'} +${earned}`};
   if(this.jump===10){this.end('Ten jumps. Nicely landed.',true);return;}
   this.jump++;this.y=0;this.vy=Math.max(13.5,Math.min(19,Math.sqrt(this.vy*this.vy*.79+20+quality*65)));
   this.angle=Math.atan2(Math.sin(this.angle),Math.cos(this.angle));this.omega*=.22;
   this.peak=0;this.flips=0;this.rotation=0;this.boostAt=-100;this.contact=.2;
  }
  if(this.y < -3 || Math.abs(this.x)>18)this.end('You drifted out of the arena.');
 }
 end(reason,completed=false){this.ended=true;this.reason=reason;this.completed=completed;this.event={type:'end',text:reason};}
}
