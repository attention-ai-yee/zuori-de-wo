// Plays every level through the real page (same input path as the keyboard) and checks it is won.
const {chromium}=require('playwright');const path=require('path');
(async()=>{const br=await chromium.launch();const pg=await br.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await pg.goto('file://'+path.resolve(process.argv[2]||__dirname+'/../index.html'));
  const res=await pg.evaluate(()=>{const G=window.__game;G.setFast(true);const out=[];
    G.LEVELS.forEach((L,i)=>{G.load(i);L.sol.forEach((s,k)=>{for(const c of s)G.act(c);if(k<L.sol.length-1)G.rewind();});
      const st=G.state();out.push({i:i+1,name:L.name,won:st.won,ghosts:st.ghosts});});return out;});
  let ok=true;res.forEach(r=>{console.log(r.i,r.name,r.won?'通关':'失败','影子',r.ghosts);if(!r.won)ok=false;});
  // keyboard path on level 1, real timing
  await pg.evaluate(()=>{window.__game.setFast(false);window.__game.load(0);});
  for(const k of ['ArrowDown','ArrowDown','ArrowRight']){await pg.keyboard.press(k);await pg.waitForTimeout(160);}
  await pg.keyboard.press('r');await pg.waitForTimeout(900);
  for(const k of 'DDRRRRRR'){await pg.keyboard.press({D:'ArrowDown',R:'ArrowRight'}[k]);await pg.waitForTimeout(160);}
  await pg.waitForTimeout(1200);const st=await pg.evaluate(()=>window.__game.state());
  const winVisible=await pg.isVisible('#winOv');console.log('键盘实玩第1关:',st.won?'通关':'失败','结算面板',winVisible);
  if(!st.won||!winVisible)ok=false;
  console.log('页面错误:',errs.length?errs:'无');if(errs.length)ok=false;
  console.log(ok?'全部通过':'有失败');await br.close();process.exit(ok?0:1);})();
