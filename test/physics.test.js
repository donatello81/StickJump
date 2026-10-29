import {test} from 'node:test';import assert from 'node:assert/strict';import {Game,boostQuality,upright,TAU} from '../physics.js';
const dt=1/120;
function land(g){for(let i=0;i<1000&&!g.ended;i++){g.step(dt);if(g.event?.type==='land')return;} }
test('ballistic flight reaches a realistic apex and lands with height points',()=>{const g=new Game();land(g);assert.equal(g.jump,2);assert.ok(g.best>5&&g.best<5.2);assert.ok(g.score>=500);assert.ok(g.vy>0);});
test('a missed trampoline ends immediately',()=>{const g=new Game();g.x=3;g.y=.01;g.vy=-2;g.step(dt);assert.ok(g.ended);assert.match(g.reason,/missed/);assert.equal(g.score,0);});
test('sideways and inverted landings crash; full rotations are upright',()=>{assert.equal(upright(Math.PI/2),false);assert.equal(upright(Math.PI),false);assert.equal(upright(TAU),true);const g=new Game();g.angle=Math.PI;g.y=.01;g.vy=-2;g.step(dt);assert.ok(g.ended);});
test('timing window rewards a fresh tap and rejects a held boost',()=>{assert.equal(boostQuality(.075),1);assert.equal(boostQuality(1),0);assert.ok(boostQuality(.075)>boostQuality(.25));const a=new Game(),b=new Game();for(const g of [a,b]){g.y=.01;g.vy=-10;}a.boost();a.step(dt);b.step(dt);assert.ok(a.vy>b.vy);});
test('a swim impulse reverses when facing the opposite direction',()=>{const a=new Game(),b=new Game();b.angle=Math.PI;a.step(dt,{up:true});b.step(dt,{up:true});assert.ok(a.vx>0);assert.ok(b.vx<0);const vx=a.vx;a.step(dt,{up:true});assert.ok(a.vx<vx+.1);});
test('completed rotations are banked only after a safe landing',()=>{const g=new Game();g.angle=TAU+.05;g.rotation=TAU;g.y=.01;g.vy=-2;g.step(dt);assert.equal(g.jump,2);assert.equal(g.score,250);});
test('wind pushes the player sideways',()=>{const g=new Game();for(let i=0;i<100;i++)g.step(dt);assert.ok(g.x>0);});
test('ten successful landings finish the run without an eleventh jump',()=>{const g=new Game();for(let i=0;i<10;i++){g.x=0;g.y=.01;g.vy=-2;g.angle=0;g.step(dt);}assert.equal(g.jump,10);assert.ok(g.ended);assert.ok(g.completed);const score=g.score;g.step(dt);assert.equal(g.score,score);});
