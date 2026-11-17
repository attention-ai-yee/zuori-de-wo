// Takes screenshots: title, mid-puzzle with ghosts, rewind effect, win, phone.
const {chromium,devices}=require('playwright');const path=require('path');
const url='file://'+path.resolve('index.html');const out=process.argv[2]||'shots';
const K={U:'ArrowUp',D:'ArrowDown',L:'ArrowLeft',R:'ArrowRight',W:' '};
async function play(pg,s){for(const c of s){await pg.keyboard.press(K[c]);await pg.waitForTimeout(150);}}
(async()=>{const br=await chromium.launch();
  const pg=await br.newPage({viewport:{width:1100,height:720},deviceScaleFactor:2});
  await pg.goto(url);await pg.waitForTimeout(600);await pg.screenshot({path:out+'/1-title.png'});
  // level 9 (绕路): play loops 1-3, then part of the final loop
  await pg.evaluate(()=>{window.__game.load(8);});await pg.waitForTimeout(300);
  const L=await pg.evaluate(()=>window.__game.LEVELS[8].sol);
  for(let k=0;k<3;k++){await play(pg,L[k]);await pg.keyboard.press('r');await pg.waitForTimeout(k===2?350:1300);
    if(k===2){await pg.screenshot({path:out+'/3-rewind.png'});await pg.waitForTimeout(1100);}}
  await play(pg,L[3].slice(0,11));await pg.waitForTimeout(250);await pg.screenshot({path:out+'/2-ghosts.png'});
  await play(pg,L[3].slice(11));await pg.waitForTimeout(1500);await pg.screenshot({path:out+'/4-win.png'});
  // level 10 mid-run
  await pg.evaluate(()=>{window.__game.load(9);});const L10=await pg.evaluate(()=>window.__game.LEVELS[9].sol);
  await pg.evaluate(()=>window.__game.setFast(true));
  await pg.evaluate(s=>{const G=window.__game;s.slice(0,4).forEach(q=>{for(const c of q)G.act(c);G.rewind();});for(const c of s[4].slice(0,13))G.act(c);},L10);
  await pg.evaluate(()=>window.__game.setFast(false));await pg.waitForTimeout(400);await pg.screenshot({path:out+'/5-final-level.png'});
  // phone
  const ph=await br.newPage({...devices['iPhone 13']});await ph.goto(url);await ph.evaluate(()=>{window.__game.load(5);});
  const L6=await ph.evaluate(()=>window.__game.LEVELS[5].sol);
  await ph.evaluate(()=>window.__game.setFast(true));await ph.evaluate(s=>{const G=window.__game;for(const c of s[0])G.act(c);G.rewind();for(const c of s[1].slice(0,7))G.act(c);},L6);
  await ph.evaluate(()=>window.__game.setFast(false));await ph.waitForTimeout(2500);await ph.screenshot({path:out+'/6-phone.png'});
  await br.close();})();
