import {test} from 'node:test';import assert from 'node:assert/strict';import {Game,boostQuality,upright,TAU} from '../physics.js';
const dt=1/120;
function land(g){for(let i=0;i<1000&&!g.ended;i++){g.step(dt);if(g.event?.type==='land')return;} }
test('ballistic flight reaches a realistic apex and lands with height points',()=>{const g=new Game();land(g);assert.equal(g.jump,2);assert.ok(g.best>9.1&&g.best<9.4);assert.ok(g.score>=910);assert.ok(g.vy>0);});
test('a missed trampoline ends immediately',()=>{const g=new Game();g.x=3;g.y=.01;g.vy=-2;g.step(dt);assert.ok(g.ended);assert.match(g.reason,/missed/);assert.equal(g.score,0);});
test('sideways and inverted landings crash; full rotations are upright',()=>{assert.equal(upright(Math.PI/2),false);assert.equal(upright(Math.PI),false);assert.equal(upright(TAU),true);const g=new Game();g.angle=Math.PI;g.y=.01;g.vy=-2;g.step(dt);assert.ok(g.ended);});
test('timing window rewards a fresh tap and rejects a held boost',()=>{assert.equal(boostQuality(.075),1);assert.equal(boostQuality(1),0);assert.ok(boostQuality(.075)>boostQuality(.25));const a=new Game(),b=new Game();for(const g of [a,b]){g.y=.01;g.vy=-13.5;}a.boost();a.step(dt);b.step(dt);assert.ok(a.vy>b.vy);});
test('stroke follows head direction with full horizontal force, proportional tilt and no vertical force',()=>{
 for(const [angle,power] of [[0,0],[Math.PI,0],[Math.PI/2,1],[-Math.PI/2,-1],[Math.PI/6,.5],[-Math.PI/6,-.5],[3*Math.PI/2,-1]]){
  const swimmer=new Game(),baseline=new Game();swimmer.angle=baseline.angle=angle;
  swimmer.step(dt,{up:true});baseline.step(dt);
  assert.ok(Math.abs((swimmer.vx-baseline.vx)-3.2*power*(1-.65*dt))<1e-10);
  assert.equal(swimmer.vy,baseline.vy);assert.equal(swimmer.y,baseline.y);
  const previous=swimmer.vx;swimmer.step(dt,{up:true});assert.ok(Math.abs(swimmer.vx-previous)<.1,'held stroke respects cooldown');
 }
});
test('completed rotations are banked only after a safe landing',()=>{const g=new Game();g.angle=TAU+.05;g.rotation=TAU;g.y=.01;g.vy=-2;g.step(dt);assert.equal(g.jump,2);assert.equal(g.score,250);});
test('wind pushes the player sideways',()=>{const g=new Game();for(let i=0;i<100;i++)g.step(dt);assert.ok(g.x>0);});
test('ten successful landings finish the run without an eleventh jump',()=>{const g=new Game();for(let i=0;i<10;i++){g.x=0;g.y=.01;g.vy=-2;g.angle=0;g.step(dt);}assert.equal(g.jump,10);assert.ok(g.ended);assert.ok(g.completed);const score=g.score;g.step(dt);assert.equal(g.score,score);});
test('wider trampoline catches a landing two metres from centre',()=>{const g=new Game();g.x=2;g.y=.01;g.vy=-13.5;g.step(dt);assert.equal(g.jump,2);assert.equal(g.ended,false);});
test('starting jump gives at least 2.7 seconds to react and later jumps retain that airtime',()=>{const g=new Game();land(g);assert.ok(g.time>2.7&&g.time<2.8);assert.ok(g.vy>=13.5);});
for(const side of [-1,1])test(`swimming recovers an outward drift from the ${side<0?'left':'right'} and lands upright`,()=>{
 const setup=()=>{const g=new Game();Object.assign(g,{x:side*3,y:7,vy:0,vx:side*.5,angle:-side*Math.PI/2});return g;};
 const recover=swim=>{const g=setup();for(let i=0;i<400&&!g.ended&&g.jump===1;i++){
  // One inward stroke, then use actual rotation inputs to return upright.
  const error=Math.atan2(Math.sin(-g.angle),Math.cos(-g.angle));
  const control=6*error-3*g.omega;
  g.step(dt,{up:swim&&i<25,left:control<-.2,right:control>.2});
 }return g;};
 const unaided=recover(false);assert.ok(unaided.ended);assert.match(unaided.reason,/missed/);
 const rescued=recover(true);assert.equal(rescued.ended,false);assert.equal(rescued.jump,2);assert.ok(Math.abs(rescued.x)<1);assert.ok(upright(rescued.angle));
});
